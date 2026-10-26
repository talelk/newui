import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { KeyValue } from './KeyValue'

function root(): HTMLElement {
  return document.querySelector('[data-slot="key-value"]') as HTMLElement
}

describe('KeyValue', () => {
  it('renders label and value as separate slots', () => {
    render(() => <KeyValue label="Email digests">Weekly</KeyValue>)
    const slots = document.querySelectorAll('[data-slot="key-value-value"]')
    expect(
      document.querySelector('[data-slot="key-value-label"]')?.textContent,
    ).toBe('Email digests')
    expect(slots.length).toBe(1)
    expect(slots[0]?.textContent).toBe('Weekly')
  })

  it('accepts the value through the prop instead of children', () => {
    render(() => <KeyValue label="Plan" value="Team" />)
    expect(
      document.querySelector('[data-slot="key-value-value"]')?.textContent,
    ).toBe('Team')
  })

  it('spreads horizontally by default and stacks vertically on request', () => {
    const { unmount } = render(() => <KeyValue label="A" value="B" />)
    expect(root().className).toContain('flex-row')
    unmount()
    render(() => <KeyValue label="A" value="B" orientation="vertical" />)
    expect(root().className).toContain('flex-col')
  })

  it('renders without a value slot when neither value nor children exist', () => {
    render(() => <KeyValue label="Empty field" />)
    expect(document.querySelector('[data-slot="key-value-value"]')).toBeNull()
  })

  it('merges a custom class after the recipe', () => {
    render(() => <KeyValue label="A" value="B" class="mt-2" />)
    expect(root().className).toContain('mt-2')
  })
})
