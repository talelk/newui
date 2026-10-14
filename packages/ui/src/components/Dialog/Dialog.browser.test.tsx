import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Dialog } from './Dialog'

describe('Dialog (browser, real CSS)', () => {
  it('paints an opaque panel over a dimming backdrop', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    const backdrop = document.querySelector(
      '[data-slot="dialog-backdrop"]',
    ) as HTMLElement

    expect(content).not.toBeNull()
    expect(getComputedStyle(content).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    expect(content.getBoundingClientRect().width).toBeGreaterThan(0)
    // The backdrop is a translucent black, never fully transparent.
    expect(getComputedStyle(backdrop).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('honours the size and top position config', () => {
    render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Content size="2xl" position="top">
          <Dialog.Title>Big</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))

    const content = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement
    // `max-w-2xl` (42rem) is wider than the `lg` default (32rem). Assert the
    // cap, not the rendered width, which the viewport can clip.
    expect(
      Number.parseFloat(getComputedStyle(content).maxWidth),
    ).toBeGreaterThan(600)

    const positioner = document.querySelector(
      '[data-slot="dialog-positioner"]',
    ) as HTMLElement
    // `pt-[20vh]` resolves against the viewport height.
    expect(
      Number.parseFloat(getComputedStyle(positioner).paddingTop),
    ).toBeGreaterThan(window.innerHeight * 0.1)
  })
})
