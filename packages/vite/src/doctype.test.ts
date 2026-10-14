import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  type DocTypeMeta,
  extractDocTypeMeta,
  fieldToProperty,
  generateDocTypeSource,
  generateDocTypes,
  mapFieldType,
  toTypeName,
} from './doctype'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  )
})

describe('toTypeName', () => {
  it('strips spaces from a doctype name', () => {
    expect(toTypeName('Sales Order')).toBe('SalesOrder')
  })
})

describe('mapFieldType', () => {
  it('maps scalar fieldtypes', () => {
    expect(mapFieldType({ fieldname: 'a', fieldtype: 'Data' })).toBe('string')
    expect(mapFieldType({ fieldname: 'a', fieldtype: 'Int' })).toBe('number')
    expect(mapFieldType({ fieldname: 'a', fieldtype: 'Check' })).toBe('0 | 1')
  })

  it('turns a Select into a union', () => {
    expect(
      mapFieldType({
        fieldname: 'status',
        fieldtype: 'Select',
        options: 'Open\nClosed',
      }),
    ).toBe("'Open' | 'Closed'")
  })

  it('names the child doctype for a Table', () => {
    expect(
      mapFieldType({
        fieldname: 'items',
        fieldtype: 'Table',
        options: 'Task Item',
      }),
    ).toBe('TaskItem[]')
  })

  it('falls back to any for an unknown fieldtype', () => {
    expect(mapFieldType({ fieldname: 'a', fieldtype: 'Mystery' })).toBe('any')
  })
})

describe('fieldToProperty', () => {
  it('skips layout-only fields', () => {
    expect(
      fieldToProperty({ fieldname: 's', fieldtype: 'Section Break' }),
    ).toBeNull()
  })

  it('makes a required field non-optional', () => {
    expect(
      fieldToProperty({ fieldname: 'subject', fieldtype: 'Data', reqd: true }),
    ).toBe('  /** subject: Data */\n  subject: string;')
  })

  it('makes a plain field optional and annotates Link options', () => {
    expect(
      fieldToProperty({
        fieldname: 'owner',
        fieldtype: 'Link',
        label: 'Owner',
        options: 'User',
      }),
    ).toBe('  /** Owner: Link (User) */\n  owner?: string;')
  })

  it('keeps tables always present', () => {
    expect(
      fieldToProperty({
        fieldname: 'items',
        fieldtype: 'Table',
        options: 'Task Item',
      }),
    ).toContain('items: TaskItem[];')
  })
})

describe('generateDocTypeSource', () => {
  const metas: DocTypeMeta[] = [
    {
      name: 'Task',
      fields: [
        { fieldname: 'subject', fieldtype: 'Data', reqd: true },
        { fieldname: 'items', fieldtype: 'Table', options: 'Task Item' },
      ],
    },
    {
      name: 'Task Item',
      istable: true,
      fields: [{ fieldname: 'description', fieldtype: 'Data' }],
    },
  ]

  it('emits the base interfaces once', () => {
    const source = generateDocTypeSource(metas)
    expect(source).toContain('export interface DocType {')
    expect(source).toContain('export interface ChildDocType extends DocType {')
  })

  it('extends the right base per doctype', () => {
    const source = generateDocTypeSource(metas)
    expect(source).toContain('export interface Task extends DocType {')
    expect(source).toContain('export interface TaskItem extends ChildDocType {')
  })

  it('includes the field properties', () => {
    const source = generateDocTypeSource(metas)
    expect(source).toContain('subject: string;')
    expect(source).toContain('items: TaskItem[];')
  })
})

describe('extractDocTypeMeta', () => {
  it('reads the { message: { docs: [meta] } } shape', () => {
    const meta = extractDocTypeMeta(
      {
        message: {
          docs: [
            {
              name: 'Task',
              fields: [{ fieldname: 'subject', fieldtype: 'Data', reqd: 1 }],
            },
          ],
        },
      },
      'Task',
    )
    expect(meta.name).toBe('Task')
    expect(meta.fields).toEqual([
      { fieldname: 'subject', fieldtype: 'Data', reqd: true },
    ])
  })

  it('reads the { message: meta } shape', () => {
    const meta = extractDocTypeMeta(
      { message: { name: 'Note', istable: true, fields: [] } },
      'Note',
    )
    expect(meta).toMatchObject({ name: 'Note', istable: true, fields: [] })
  })

  it('throws on an unusable payload', () => {
    expect(() => extractDocTypeMeta('nope', 'Task')).toThrow(/unexpected/)
  })
})

describe('generateDocTypes', () => {
  it('fetches, writes, then leaves an unchanged file alone', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'newui-vite-doctypes-'))
    tempDirs.push(dir)
    const output = join(dir, 'nested', 'doctypes.ts')

    const urls: string[] = []
    const fakeFetch = (async (input: string | URL | Request) => {
      urls.push(String(input))
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          message: {
            name: 'Task',
            fields: [{ fieldname: 'subject', fieldtype: 'Data', reqd: 1 }],
          },
        }),
      }
    }) as unknown as typeof globalThis.fetch

    const options = {
      doctypes: ['Task'],
      output,
      url: 'http://backend',
      fetch: fakeFetch,
    }

    const first = await generateDocTypes(options)
    expect(first.written).toBe(true)
    expect(first.doctypes).toEqual(['Task'])
    expect(urls[0]).toBe(
      'http://backend/api/method/frappe.client.get_meta?doctype=Task',
    )

    const source = await readFile(output, 'utf8')
    expect(source).toContain('export interface Task extends DocType {')
    expect(source).toContain('subject: string;')

    const second = await generateDocTypes(options)
    expect(second.written).toBe(false)
  })

  it('surfaces a backend error', async () => {
    const fakeFetch = (async () => ({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    })) as unknown as typeof globalThis.fetch

    await expect(
      generateDocTypes({
        doctypes: ['Task'],
        output: join(tmpdir(), 'unused-doctypes.ts'),
        fetch: fakeFetch,
      }),
    ).rejects.toThrow(/500/)
  })
})
