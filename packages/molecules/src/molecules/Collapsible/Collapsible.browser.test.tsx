import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Collapsible } from './Collapsible'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

function example(props: { defaultOpen?: boolean }) {
  return (
    <Collapsible.Root defaultOpen={props.defaultOpen}>
      <Collapsible.Trigger>More options</Collapsible.Trigger>
      <Collapsible.Content>Hidden by default.</Collapsible.Content>
    </Collapsible.Root>
  )
}

describe('Collapsible (browser, real CSS)', () => {
  it('clips a closed panel to zero and gives an open one real height', async () => {
    const closed = render(() => example({}))
    await nextFrame()
    const closedPanel = closed.container.querySelector(
      '[data-slot="collapsible-content"]',
    ) as HTMLElement
    // The `grid-template-rows: 0fr` trick collapses the row to exactly zero —
    // a dropped `overflow-hidden` or a broken `disclosure-panel` shows here.
    expect(closedPanel.getBoundingClientRect().height).toBeLessThan(1)
    expect(getComputedStyle(closedPanel).visibility).toBe('hidden')
    closed.unmount()

    const open = render(() => example({ defaultOpen: true }))
    await nextFrame()
    const openPanel = open.container.querySelector(
      '[data-slot="collapsible-content"]',
    ) as HTMLElement
    expect(openPanel.getBoundingClientRect().height).toBeGreaterThan(8)
    expect(getComputedStyle(openPanel).visibility).toBe('visible')

    // The inner box, not the clipping wrapper, holds the panel's padding —
    // the rule the disclosure animation depends on.
    const inner = openPanel.querySelector(':scope > div > div') as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(inner).paddingTop),
    ).toBeGreaterThan(0)
  })

  it('keeps the trigger a real row with its own padding', async () => {
    const { container } = render(() => example({ defaultOpen: true }))
    await nextFrame()
    const trigger = container.querySelector(
      '[data-slot="collapsible-trigger"]',
    ) as HTMLElement
    expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    expect(
      Number.parseFloat(getComputedStyle(trigger).paddingLeft),
    ).toBeGreaterThan(0)
  })
})
