import { describe, expect, it } from 'vitest'
import { classTokensIn, stripStyleObjects } from './tw-merge.harness'

/**
 * The harvest is a heuristic over quoted strings, so the one thing it must
 * never do is read a CSS property name as a utility. A style object's
 * `'outline-offset': '0px'` once entered the sweep and failed CI on a class
 * neither Tailwind nor this library emits; these cases pin the exclusion
 * without losing the class maps next to it.
 */

describe('token harvest', () => {
  it('ignores CSS property keys in a JSX style object', () => {
    const source = `<div class="p-2" style={{ outline: 'var(--focus)', 'outline-offset': '0px' }} />`
    expect(classTokensIn(source)).toEqual(['p-2'])
  })

  it('keeps class-map keys, which are utilities', () => {
    const source = `<div classList={{ 'pt-3': spaced, 'size-4': true }} />`
    expect(classTokensIn(source)).toEqual(['pt-3', 'size-4'])
  })

  it('keeps ternary branches (the `:` there is not a key)', () => {
    const source = `<div class={active() ? 'p-2' : 'p-4'} />`
    expect(classTokensIn(source)).toEqual(['p-2', 'p-4'])
  })

  it('drops lookup maps, whose values are strings', () => {
    const source = [
      "const ROUTES = { 'select-demo': '/molecules/select' }",
      "const MAP = { 'select-demo': '/x', 'size-4': cond }",
    ].join('\n')
    expect(classTokensIn(source)).toEqual(['size-4'])
  })

  it('strips across newlines, template values and nested braces', () => {
    const source = [
      '<div',
      '  class="p-2"',
      '  style={{',
      "    'outline-offset': '0px',",
      `    gridTemplateColumns: \`repeat(\${count()}, 1fr)\` as string,`,
      "    borderColor: ok ? 'var(--outline-gray-1)' : 'red',",
      '  }}',
      '/>',
      '<span class="m-1" />',
    ].join('\n')
    expect(classTokensIn(source)).toEqual(['p-2', 'm-1'])
    // Line structure survives, so a future diff in this file stays readable.
    expect(stripStyleObjects(source).split('\n')).toHaveLength(
      source.split('\n').length,
    )
  })

  it('leaves an unclosed style object harmless', () => {
    expect(() => classTokensIn('<div style={{ color: "red"')).not.toThrow()
  })
})
