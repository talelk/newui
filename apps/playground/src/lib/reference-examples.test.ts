import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../generated/components'
import { STORIES } from '../generated/stories'
import { APPLICATION_FILES } from './application-files'
import { EXAMPLES } from './examples'
import { PATTERNS, REFERENCE_EXAMPLES } from './reference-examples'

describe('reference example coverage', () => {
  it('provides source files and package requirements for every application guide', () => {
    const root = path.join(process.cwd(), 'apps/playground/src')
    expect(
      Object.keys(APPLICATION_FILES)
        .map((slug) => `/pages/${slug}`)
        .sort(),
    ).toEqual(EXAMPLES.map((entry) => entry.href).sort())
    expect(EXAMPLES).toHaveLength(12)
    expect(EXAMPLES.every((entry) => entry.href.startsWith('/pages/'))).toBe(
      true,
    )
    for (const [slug, entry] of Object.entries(APPLICATION_FILES)) {
      const manifest = JSON.parse(
        readFileSync(
          path.join(root, 'generated/sources', `${slug}.json`),
          'utf8',
        ),
      ) as { files: string[]; packages: string[] }
      expect(manifest.files[0], slug).toBe(entry)
      expect(new Set(manifest.files).size, slug).toBe(manifest.files.length)
      for (const file of manifest.files)
        expect(existsSync(path.join(root, file)), `${slug}: ${file}`).toBe(true)
      expect(manifest.packages, slug).toContain('solid-js')
    }
  })
  it('gives every shipped reference component an isolated story', () => {
    expect(
      COMPONENTS.filter((entry) => entry.shipped && !STORIES[entry.name]).map(
        (entry) => entry.name,
      ),
    ).toEqual([])
  })
  it('resolves a real written contract for every shipped reference', () => {
    expect(
      COMPONENTS.filter(
        (entry) =>
          entry.shipped &&
          (!entry.spec ||
            !existsSync(path.join(process.cwd(), `spec/${entry.spec}.md`))),
      ),
    ).toEqual([])
  })
  it('links each reference to its actual package source', () => {
    expect(
      COMPONENTS.filter(
        (entry) =>
          entry.shipped && !existsSync(path.join(process.cwd(), entry.source)),
      ).map((entry) => entry.name),
    ).toEqual([])
  })
  it('maps every registry example to a shipped destination', () => {
    const shipped = new Set(
      COMPONENTS.filter((entry) => entry.shipped).map(
        (entry) => `/${entry.atomic}s/${entry.slug}`,
      ),
    )
    for (const entry of EXAMPLES) shipped.add(entry.href)
    for (const pattern of PATTERNS) shipped.add(`/kit/recipes/${pattern.slug}`)
    for (const route of ['/foundations', '/atoms/button', '/molecules/toast'])
      shipped.add(route)
    expect(REFERENCE_EXAMPLES).toHaveLength(68)
    expect(new Set(REFERENCE_EXAMPLES.map((entry) => entry.source)).size).toBe(
      68,
    )
    expect(
      REFERENCE_EXAMPLES.filter(
        (entry) => !shipped.has(entry.implementation.split('#')[0] ?? ''),
      ),
    ).toEqual([])
    expect(
      REFERENCE_EXAMPLES.every((entry) => entry.href === entry.implementation),
    ).toBe(true)
  })
  it('lists each application family once with a responsive documentation destination', () => {
    const routes = new Set<string>(EXAMPLES.map((entry) => entry.href))
    for (const name of [
      'discussions',
      'compose',
      'deals',
      'tickets',
      'mail',
      'files',
      'tasks',
      'accounting',
    ]) {
      expect(routes.has(`/pages/${name}`)).toBe(true)
      expect(
        EXAMPLES.filter((entry) => entry.href === `/pages/${name}`),
      ).toHaveLength(1)
    }
  })
})
