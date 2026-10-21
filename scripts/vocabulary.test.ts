/**
 * The vocabulary's machine copy, the way `scripts/story-states.ts` is the
 * machine copy of `spec/states.md`: the unions `CONTEXT.md` defines are parsed
 * out of the doc itself and asserted against every generated prop table in
 * `api.json`, so a component that ships a `theme` value the axis does not
 * declare — or a `side` narrower than the doc — fails here, not in review.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) => readFileSync(file, 'utf8')
const context = read('CONTEXT.md')
const api = JSON.parse(read('api.json')) as Record<
  string,
  Record<string, { name: string; type: string }[]>
>

/** The backticked union in the CONTEXT entry for a term, e.g. `a | b | c`. */
function contextUnion(term: string): string[] {
  const entry = context.match(
    new RegExp(`\\*\\*${term}\\*\\*[^\`]*\`([^\`]+)\``, 'm'),
  )
  if (!entry) throw new Error(`CONTEXT.md does not define a union for ${term}`)
  return entry[1].split('|').map((value) => value.trim())
}

/** Quoted string literals inside a generated type string. */
function literals(type: string): string[] {
  return (type.match(/'([^']+)'/g) ?? []).map((value) => value.slice(1, -1))
}

interface PropRef {
  file: string
  table: string
  prop: string
  type: string
}

function* publicProps(): Generator<PropRef> {
  for (const [file, tables] of Object.entries(api)) {
    for (const [table, props] of Object.entries(tables)) {
      for (const prop of props) {
        yield { file, table, prop: prop.name, type: prop.type }
      }
    }
  }
}

describe('P4 color axes', () => {
  const themeAxis = contextUnion('theme')
  const variantAxis = contextUnion('variant')

  it('CONTEXT declares the documented axes', () => {
    expect(themeAxis).toEqual([
      'gray',
      'blue',
      'green',
      'amber',
      'red',
      'violet',
    ])
    expect(variantAxis).toEqual(['solid', 'subtle', 'outline', 'ghost'])
  })

  it('every theme/tone prop draws from the theme axis', () => {
    const offenders: string[] = []
    for (const { file, table, prop, type } of publicProps()) {
      if (!/^(theme|tone)$/.test(prop)) continue
      for (const literal of literals(type)) {
        if (!themeAxis.includes(literal)) {
          offenders.push(`${file} ${table}.${prop}: '${literal}'`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('every variant prop uses the variant axis', () => {
    const offenders: string[] = []
    for (const { file, table, prop, type } of publicProps()) {
      if (prop !== 'variant') continue
      for (const literal of literals(type)) {
        if (!variantAxis.includes(literal)) {
          offenders.push(`${file} ${table}.${prop}: '${literal}'`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('shared prop vocabulary', () => {
  it('side props cover the four edges CONTEXT defines', () => {
    const edges = contextUnion('side')
    expect(edges).toEqual(['top', 'bottom', 'left', 'right'])
    const offenders: string[] = []
    for (const { file, table, prop, type } of publicProps()) {
      if (prop !== 'side') continue
      for (const literal of literals(type)) {
        if (!edges.includes(literal)) {
          offenders.push(`${file} ${table}.${prop}: '${literal}'`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('align props stay within start | center | end', () => {
    const offenders: string[] = []
    for (const { file, table, prop, type } of publicProps()) {
      if (prop !== 'align') continue
      for (const literal of literals(type)) {
        if (!['start', 'center', 'end'].includes(literal)) {
          offenders.push(`${file} ${table}.${prop}: '${literal}'`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
