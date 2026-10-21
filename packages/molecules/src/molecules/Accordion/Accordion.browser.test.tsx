import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Accordion } from './Accordion'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

function Example() {
  return (
    <Accordion.Root defaultValue={['one']}>
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Content>First panel</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Content>Second panel</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}

describe('Accordion (browser, real CSS)', () => {
  it('hides a collapsed panel without taking it out of the layout tree twice', async () => {
    const { container } = render(() => <Example />)
    await nextFrame()

    const panels = container.querySelectorAll(
      '[data-slot="accordion-content"]',
    ) as unknown as HTMLElement[]
    const open = panels[0] as HTMLElement
    const closed = panels[1] as HTMLElement

    // The open panel has real height; the collapsed one is clipped to zero by
    // the `grid-template-rows: 0fr` trick, which is what makes the transition
    // possible without measuring.
    expect(open.getBoundingClientRect().height).toBeGreaterThan(8)
    expect(closed.getBoundingClientRect().height).toBeLessThan(1)
    expect(getComputedStyle(closed).visibility).toBe('hidden')
  })

  it('points the chevron up while its panel is open', async () => {
    const { container } = render(() => <Example />)
    await nextFrame()

    const indicators = container.querySelectorAll(
      '[data-slot="accordion-indicator"]',
    ) as unknown as HTMLElement[]
    // Tailwind v4 compiles `rotate-180` to the standalone `rotate` property,
    // not to a `transform` matrix, so that is what we read.
    const openRotate = getComputedStyle(indicators[0] as HTMLElement).rotate
    const closedRotate = getComputedStyle(indicators[1] as HTMLElement).rotate

    // A rotation is not `none`, and the two must differ.
    expect(openRotate).not.toBe('none')
    expect(openRotate).not.toBe(closedRotate)
  })

  it('draws the hairline between items', async () => {
    const { container } = render(() => <Example />)
    await nextFrame()
    const items = container.querySelectorAll('[data-slot="accordion-item"]')
    // Tailwind v4's `divide-y` puts the rule on the first item's bottom edge
    // (`:not(:last-child)`); v3 put it on the second item's top edge.
    expect(
      Number.parseFloat(
        getComputedStyle(items[0] as HTMLElement).borderBottomWidth,
      ),
    ).toBeGreaterThan(0)
  })
})
