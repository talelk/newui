import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Divider } from './Divider'

describe('Divider (browser, real CSS)', () => {
  it('draws a visible horizontal rule', () => {
    const { container } = render(() => <Divider />)
    const rule = container.querySelector('hr') as HTMLElement
    const style = getComputedStyle(rule)
    expect(rule.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
  })

  it('splits a labelled divider into two rules around the label', () => {
    const { container } = render(() => <Divider label="or" />)
    expect(container.querySelectorAll('hr')).toHaveLength(2)
    expect(container.textContent).toContain('or')
  })

  it('draws a rule behind the action button', () => {
    const { container, getByRole } = render(() => (
      <Divider action={{ label: 'Show more' }} />
    ))
    const line = container.querySelector(
      '[data-slot="divider-action-line"]',
    ) as HTMLElement
    const button = getByRole('button', { name: 'Show more' })
    expect(
      Number.parseFloat(getComputedStyle(line).borderTopWidth),
    ).toBeGreaterThan(0)
    expect(button.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(line.getBoundingClientRect().width).toBeGreaterThan(0)
  })
})
