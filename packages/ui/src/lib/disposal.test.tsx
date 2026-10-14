import { cleanup, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Dialog } from '../components/Dialog'
import { Popover } from '../components/Popover'
import { Switch } from '../components/Switch'

/**
 * Disposal / leak guard.
 *
 * Portalled overlays and Zag machines attach nodes and listeners outside the
 * component tree. Mounting and unmounting them repeatedly must leave the DOM
 * exactly as it started — a growing `document.body` is a leak that only shows up
 * as a slow app after hundreds of opens.
 *
 * `cleanup()` (not just `unmount()`) is used per cycle so testing-library's own
 * render container is removed too; otherwise the count grows by one per render
 * regardless of our code.
 */
function cycle(times: number) {
  for (let index = 0; index < times; index += 1) {
    render(() => (
      <div>
        <Dialog.Root defaultOpen>
          <Dialog.Trigger>open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
        <Popover.Root defaultOpen>
          <Popover.Trigger>filters</Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Filters</Popover.Title>
          </Popover.Content>
        </Popover.Root>
        <Switch label="Notifications" />
      </div>
    ))
    cleanup()
  }
}

describe('disposal', () => {
  it('leaves no DOM behind after 100 mount/unmount cycles', () => {
    cycle(1) // warm up: let any module-level portal target settle
    const baseline = document.body.childElementCount

    cycle(100)

    expect(document.body.childElementCount).toBe(baseline)
  })

  it('removes portalled overlay nodes when unmounted', () => {
    const { unmount } = render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ))
    expect(
      document.querySelector('[data-slot="dialog-content"]'),
    ).not.toBeNull()

    unmount()
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
  })
})
