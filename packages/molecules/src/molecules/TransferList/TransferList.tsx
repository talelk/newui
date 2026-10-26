import { Checkbox, IconButton, TextInput } from '@talelk/newui-atoms'
import { cn, createControllableSignal } from '@talelk/newui-atoms/internal'
import { createSignal, For, type JSX, Show } from 'solid-js'

export interface TransferOption {
  /** The submitted value. */
  value: string
  /** The visible label. */
  label: string
}

export interface TransferListProps {
  options: TransferOption[]
  /** Controlled picked values (the right-hand list, in pick order). */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Filter boxes above both lists. @default false */
  search?: boolean
  /** Accessible name for the available list. @default Available */
  availableLabel?: string
  /** Accessible name for the picked list. @default Selected */
  pickedLabel?: string
  disabled?: boolean
  class?: string
}

/**
 * A dual-list picker: the left list is available, the right list is picked,
 * and the buttons between them move the checked rows. Rows are checkboxes
 * rather than a listbox — every row is natively focusable and toggleable, so
 * the pattern carries no keyboard machinery of its own.
 */
export function TransferList(props: TransferListProps): JSX.Element {
  const [picked, setPicked] = createControllableSignal<string[]>({
    value: () => props.value,
    defaultValue: props.defaultValue ?? [],
    onChange: (next) => props.onValueChange?.(next),
  })
  const [query, setQuery] = createSignal('')
  /** Row checks per panel: what the move buttons act on. */
  const [checkedLeft, setCheckedLeft] = createSignal<string[]>([])
  const [checkedRight, setCheckedRight] = createSignal<string[]>([])

  const matches = (label: string) =>
    query() === '' || label.toLowerCase().includes(query().toLowerCase())
  const available = () =>
    props.options.filter(
      (option) => !picked().includes(option.value) && matches(option.label),
    )
  const pickedOptions = (): TransferOption[] => {
    const rows: TransferOption[] = []
    for (const value of picked()) {
      const option = props.options.find(
        (candidate) => candidate.value === value,
      )
      if (option && matches(option.label)) rows.push(option)
    }
    return rows
  }

  const moveIn = (values: string[]) => {
    if (values.length === 0) return
    setPicked([...picked(), ...values])
    setCheckedLeft([])
  }
  const moveOut = (values: string[]) => {
    if (values.length === 0) return
    setPicked(picked().filter((value) => !values.includes(value)))
    setCheckedRight([])
  }
  const moveAll = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setPicked(props.options.map((option) => option.value))
      setCheckedLeft([])
    } else {
      setPicked([])
      setCheckedRight([])
    }
  }

  const toggle = (
    list: () => string[],
    setList: (next: string[]) => void,
    value: string,
    checked: boolean,
  ) => {
    setList(
      checked ? [...list(), value] : list().filter((item) => item !== value),
    )
  }

  const rows = (
    options: () => TransferOption[],
    side: 'left' | 'right',
  ): JSX.Element => {
    const checked = side === 'left' ? checkedLeft : checkedRight
    const setChecked = side === 'left' ? setCheckedLeft : setCheckedRight
    return (
      <For
        each={options()}
        fallback={
          <li
            class="p-2 text-caption text-ink-gray-6"
            data-slot="transfer-list-empty"
          >
            Nothing here
          </li>
        }
      >
        {(option) => (
          <li>
            <Checkbox
              label={option.label}
              disabled={props.disabled}
              checked={checked().includes(option.value)}
              onCheckedChange={(next) =>
                toggle(checked, setChecked, option.value, Boolean(next))
              }
            />
          </li>
        )}
      </For>
    )
  }

  const panel = (
    side: 'left' | 'right',
    label: string,
    options: () => TransferOption[],
    count: number,
  ): JSX.Element => (
    <fieldset
      data-slot="transfer-list-panel"
      data-side={side}
      class="flex min-w-0 flex-1 flex-col gap-2 rounded-card border border-outline-gray-1 bg-surface-base p-2"
    >
      <legend class="px-1 text-caption text-ink-gray-7">
        {label} ({count})
      </legend>
      <Show when={props.search}>
        <TextInput
          aria-label={`Filter ${label.toLowerCase()}`}
          placeholder="Filter…"
          disabled={props.disabled}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
      </Show>
      <ul class="m-0 flex min-h-24 max-h-64 list-none flex-col gap-1 overflow-auto p-0">
        {rows(options, side)}
      </ul>
    </fieldset>
  )

  return (
    <div
      data-slot="transfer-list"
      data-disabled={props.disabled ? '' : undefined}
      class={cn('flex items-stretch gap-2', props.class)}
    >
      {panel(
        'left',
        props.availableLabel ?? 'Available',
        available,
        available().length,
      )}

      <div
        data-slot="transfer-list-actions"
        class="flex flex-col justify-center gap-1"
      >
        <IconButton
          label="Move everything to selected"
          icon="lucide-chevrons-right"
          variant="ghost"
          disabled={props.disabled || props.options.length === 0}
          onClick={() => moveAll('in')}
        />
        <IconButton
          label="Move checked to selected"
          icon="lucide-chevron-right"
          variant="outline"
          disabled={props.disabled || checkedLeft().length === 0}
          onClick={() => moveIn(checkedLeft())}
        />
        <IconButton
          label="Move checked to available"
          icon="lucide-chevron-left"
          variant="outline"
          disabled={props.disabled || checkedRight().length === 0}
          onClick={() => moveOut(checkedRight())}
        />
        <IconButton
          label="Move everything to available"
          icon="lucide-chevrons-left"
          variant="ghost"
          disabled={props.disabled || picked().length === 0}
          onClick={() => moveAll('out')}
        />
      </div>

      {panel(
        'right',
        props.pickedLabel ?? 'Selected',
        pickedOptions,
        picked().length,
      )}
    </div>
  )
}
