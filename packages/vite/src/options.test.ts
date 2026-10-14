import { describe, expect, it } from 'vitest'
import { normalizeOptions } from './options'

describe('normalizeOptions', () => {
  it('enables the proxy by default and leaves the rest off', () => {
    expect(normalizeOptions()).toEqual({
      frappeProxy: {},
      lucideIcons: false,
      doctypeTypes: false,
    })
  })

  it('expands booleans and passes objects through', () => {
    const normalized = normalizeOptions({
      frappeProxy: { port: 9000 },
      lucideIcons: true,
    })
    expect(normalized.frappeProxy).toEqual({ port: 9000 })
    expect(normalized.lucideIcons).toEqual({})
  })

  it('disables a sub-plugin on false', () => {
    expect(normalizeOptions({ frappeProxy: false }).frappeProxy).toBe(false)
  })

  it('keeps doctype options only when provided', () => {
    const normalized = normalizeOptions({
      doctypeTypes: { doctypes: ['Task'] },
    })
    expect(normalized.doctypeTypes).toEqual({ doctypes: ['Task'] })
  })
})
