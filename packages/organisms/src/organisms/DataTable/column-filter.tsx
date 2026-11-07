import { cn, Icon, TextInput } from '@talelk/newui-atoms'
import { NumberInput, Popover, Select } from '@talelk/newui-molecules'
import { createSignal, For, type JSX, Show } from 'solid-js'
import {
  type DataTableFilterFacet,
  type FilterColumn,
  filterKind,
} from './column-ops'

/**
 * The per-column filter popover, split from the column operations so a table
 * without `columnOps` never downloads it (or the NumberInput, Popover and
 * Select it renders): `DataTable` loads it lazily, the first time a filterable
 * header renders.
 */
const EMPTY_OPTIONS = [
  { label: 'Is empty', value: 'empty' },
  { label: 'Is not empty', value: 'notEmpty' },
]

/**
 * A filter button opening the right control for the column's filter function.
 * State is TanStack's `columnFilters` — the same array server mode sends to
 * the backend — so client and server filtering stay one vocabulary.
 */
export function ColumnFilter(props: {
  column: FilterColumn
  label: string
  facets?: DataTableFilterFacet[]
}): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const kind = () => filterKind(props.column.columnDef.filterFn)
  const value = () => props.column.getFilterValue()
  // Every control keeps its own string while the popover is open; TanStack's
  // state is the commit, not the binding. A text box bound straight to the
  // filter value would fight the user: each keystroke round-trips through the
  // table and lands back in the input after the next one, dropping characters.
  const [text, setText] = createSignal('')
  const [low, setLow] = createSignal('')
  const [high, setHigh] = createSignal('')
  const seed = () => {
    const current = value()
    if (Array.isArray(current)) {
      setText('')
      setLow(current[0] == null ? '' : String(current[0]))
      setHigh(current[1] == null ? '' : String(current[1]))
    } else {
      setText(current == null ? '' : String(current))
      setLow('')
      setHigh('')
    }
  }
  const commitRange = () => {
    const lo = low() === '' ? undefined : low()
    const hi = high() === '' ? undefined : high()
    set(lo === undefined && hi === undefined ? undefined : [lo, hi])
  }
  const dateValue = (): [unknown, unknown] | undefined => {
    const current = value()
    return Array.isArray(current) ? [current[0], current[1]] : undefined
  }
  const datePart = (index: 0 | 1): string => {
    const part = dateValue()?.[index]
    return part == null ? '' : String(part)
  }
  const commitDate = (index: 0 | 1, next: string): void => {
    const current = dateValue() ?? [undefined, undefined]
    const merged: [unknown, unknown] =
      index === 0
        ? [next === '' ? undefined : next, current[1]]
        : [current[0], next === '' ? undefined : next]
    set(merged)
  }
  const active = () => {
    const current = value()
    if (current === undefined || current === null || current === '')
      return false
    if (Array.isArray(current))
      return current.some(
        (part) => part !== undefined && part !== null && part !== '',
      )
    return true
  }
  const set = (next: unknown) => {
    props.column.setFilterValue(
      next === undefined ||
        next === '' ||
        (Array.isArray(next) &&
          next.every((part) => part === undefined || part === ''))
        ? undefined
        : next,
    )
  }

  return (
    <Popover.Root
      open={open()}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) seed()
      }}
    >
      <Popover.Trigger
        aria-label={`Filter by ${props.label}`}
        data-active={active() ? '' : undefined}
        class={cn(
          'inline-flex size-6 shrink-0 items-center justify-center rounded-control focus-visible:focus-ring hover:bg-surface-gray-2',
          active() ? 'text-interface' : 'text-ink-gray-6',
        )}
      >
        <Icon
          icon={active() ? 'lucide-filter-check' : 'lucide-filter'}
          class="size-3.5"
        />
      </Popover.Trigger>
      <Popover.Content>
        <div class="flex min-w-48 flex-col gap-2 p-1">
          <Show when={kind() === 'text'}>
            <TextInput
              aria-label={`Filter by ${props.label}`}
              placeholder={`Contains…`}
              size="xs"
              value={text()}
              onInput={(event) => {
                setText(event.currentTarget.value)
                set(event.currentTarget.value)
              }}
            />
          </Show>
          <Show when={kind() === 'select'}>
            <Show
              when={props.facets?.length}
              fallback={
                <TextInput
                  aria-label={`Filter by ${props.label}`}
                  placeholder={`Equals…`}
                  size="xs"
                  value={text()}
                  onInput={(event) => {
                    setText(event.currentTarget.value)
                    set(event.currentTarget.value)
                  }}
                />
              }
            >
              <Select
                aria-label={`Filter by ${props.label}`}
                size="sm"
                placeholder="Any"
                options={(props.facets ?? []).map((facet) => ({
                  label: `${facet.value} (${facet.count})`,
                  value: facet.value,
                }))}
                value={value() == null ? null : String(value())}
                onValueChange={(next) => set(next ?? undefined)}
              />
            </Show>
          </Show>
          <Show when={kind() === 'range'}>
            <div class="flex items-center gap-2">
              <NumberInput
                aria-label={`${props.label} minimum`}
                value={low()}
                onValueChange={(details) => {
                  setLow(details.value)
                  if (details.value !== '') commitRange()
                  else commitRange()
                }}
              />
              <span aria-hidden="true" class="text-ink-gray-6">
                –
              </span>
              <NumberInput
                aria-label={`${props.label} maximum`}
                value={high()}
                onValueChange={(details) => {
                  setHigh(details.value)
                  commitRange()
                }}
              />
            </div>
          </Show>
          <Show when={kind() === 'date'}>
            <div class="flex flex-col gap-1">
              <TextInput
                type="date"
                size="xs"
                aria-label={`${props.label} from`}
                value={datePart(0)}
                onInput={(event) => commitDate(0, event.currentTarget.value)}
              />
              <TextInput
                type="date"
                size="xs"
                aria-label={`${props.label} to`}
                value={datePart(1)}
                onInput={(event) => commitDate(1, event.currentTarget.value)}
              />
            </div>
          </Show>
          <Show when={kind() === 'empty'}>
            <Select
              aria-label={`Filter by ${props.label}`}
              size="sm"
              placeholder="Any"
              options={EMPTY_OPTIONS}
              value={value() == null ? null : String(value())}
              onValueChange={(next) => set(next ?? undefined)}
            />
          </Show>
          <Show when={props.facets?.length && kind() !== 'select'}>
            <div class="flex flex-col gap-0.5 border-t border-outline-gray-1 pt-1">
              <For each={props.facets}>
                {(facet) => (
                  <button
                    type="button"
                    data-slot="data-table-filter-facet"
                    aria-pressed={String(value() ?? '') === facet.value}
                    class="flex items-center justify-between gap-4 rounded-control px-2 py-1 text-start text-caption hover:bg-surface-gray-2 focus-visible:focus-ring"
                    onClick={() => {
                      set(facet.value)
                      setOpen(false)
                    }}
                  >
                    <span class="truncate">{facet.value}</span>
                    <span class="text-ink-gray-6 tabular-nums">
                      {facet.count}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}
