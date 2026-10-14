import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('is a labelled status region', () => {
    const { getByRole } = render(() => <Spinner />)
    expect(getByRole('status').getAttribute('aria-label')).toBe('Loading')
  })

  it('applies the theme colour class', () => {
    const { getByRole } = render(() => <Spinner theme="red" />)
    expect(getByRole('status').className).toContain('text-ink-red-7')
  })

  it('inherits the text colour when no theme is set', () => {
    const { getByRole } = render(() => <Spinner />)
    expect(getByRole('status').className).not.toContain('text-ink-')
  })

  it('sizes with the size enum', () => {
    const { getByRole } = render(() => <Spinner size="lg" />)
    expect(getByRole('status').className).toContain('size-5')
  })
})
