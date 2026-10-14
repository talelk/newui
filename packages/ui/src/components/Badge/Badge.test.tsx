import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('is subtle gray by default', () => {
    const { getByText } = render(() => <Badge label="Draft" />)
    const el = getByText('Draft')
    expect(el.className).toContain('bg-surface-gray-2')
    expect(el.className).toContain('rounded-full')
  })

  it('applies theme and variant', () => {
    const { getByText } = render(() => (
      <Badge theme="green" variant="solid" label="Paid" />
    ))
    expect(getByText('Paid').className).toContain('bg-surface-green-8')
  })

  it('supports the amber warning tone', () => {
    const { getByText } = render(() => (
      <Badge theme="amber" variant="subtle" label="Pending" />
    ))
    expect(getByText('Pending').className).toContain('text-ink-amber-8')
  })
})
