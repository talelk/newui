/**
 * Internal listbox parts shared by `Combobox` and `MultiSelect` — the two
 * grouped-option popups over Zag's `combobox` machine. Not exported from the
 * package: the public names stay `Combobox` / `MultiSelect` (P8), and the
 * row/label look itself comes from `listboxRow` / `listboxLabel` in
 * atoms/lib control-styles.
 */
import { Icon } from '@talelk/newui-atoms'
import type { JSX } from 'solid-js'

/** A labelled cluster after normalization; ungrouped runs hide their label. */
export interface NormalizedGroup<T> {
  key: string
  group: string
  hideLabel: boolean
  options: T[]
}

interface OptionGroupLike<T> {
  group: string
  hideLabel?: boolean
  options: T[]
}

function isGroup<T>(
  option: T | OptionGroupLike<T>,
): option is OptionGroupLike<T> {
  return typeof option === 'object' && option !== null && 'group' in option
}

/** Split a flat/grouped option list into labelled groups; ungrouped runs become one hidden group. */
export function normalizeGroups<T>(
  options: Array<T | OptionGroupLike<T>>,
): NormalizedGroup<T>[] {
  const groups: NormalizedGroup<T>[] = []
  let pending: T[] = []

  const flush = () => {
    if (!pending.length) return
    groups.push({
      key: `__ungrouped__${groups.length}`,
      group: '',
      hideLabel: true,
      options: pending,
    })
    pending = []
  }

  for (const [index, option] of options.entries()) {
    if (isGroup(option)) {
      flush()
      if (!option.options.length) continue
      groups.push({
        key: `group-${index}`,
        group: option.group,
        hideLabel: Boolean(option.hideLabel),
        options: option.options,
      })
      continue
    }
    pending.push(option)
  }

  flush()
  return groups
}

/** The checked-row mark, through the `Icon` atom like every other glyph (P11). */
export function ListboxCheck(): JSX.Element {
  return <Icon icon="lucide-check" class="size-3.5" />
}
