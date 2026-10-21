import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
}

describe('Tabs (browser, real CSS)', () => {
  it('draws a 1px underline indicator under the selected trigger', async () => {
    const { container } = render(() => (
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs.Root>
    ))
    await nextFrame()
    const indicator = container.querySelector(
      '[data-slot="tab-indicator"]',
    ) as HTMLElement
    const rect = indicator.getBoundingClientRect()
    expect(rect.width).toBeGreaterThan(0)
    expect(rect.height).toBeLessThanOrEqual(2)
    const track = container.querySelector(
      '[data-slot="tabs-list"]',
    ) as HTMLElement
    expect(
      Number.parseFloat(getComputedStyle(track).borderBottomWidth),
    ).toBeGreaterThan(0)
  })

  it('slides the pill indicator onto the selected trigger', async () => {
    const { container } = render(() => (
      <Tabs.Root defaultValue="b">
        <Tabs.List variant="subtle">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs.Root>
    ))
    await nextFrame()
    const indicator = container.querySelector(
      '[data-slot="tab-indicator"]',
    ) as HTMLElement
    const selected = container.querySelector(
      '[data-slot="tab-trigger"][data-state="active"]',
    ) as HTMLElement
    const indicatorRect = indicator.getBoundingClientRect()
    const triggerRect = selected.getBoundingClientRect()
    expect(indicatorRect.width).toBeGreaterThan(0)
    expect(Math.abs(indicatorRect.left - triggerRect.left)).toBeLessThan(2)
    expect(getComputedStyle(indicator).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })
})
