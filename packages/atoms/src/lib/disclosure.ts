import {
  type ControllableOptions,
  createControllableSignal,
} from './controllable'

export type DisclosureOptions = Omit<
  ControllableOptions<boolean>,
  'defaultValue'
> & {
  defaultOpen?: boolean
}

/**
 * The `open` + `onOpenChange` pair every overlay shares (Dialog, Popover,
 * Dropdown, Tooltip) — Solid's replacement for `v-model:open`.
 */
export function createDisclosure(opts: DisclosureOptions) {
  return createControllableSignal<boolean>({
    value: opts.value,
    defaultValue: opts.defaultOpen ?? false,
    onChange: opts.onChange,
  })
}
