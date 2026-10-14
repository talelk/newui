import {
  Icon,
  Select,
  type SelectOption,
  TabButtons,
  TextInput,
} from '@newui/ui'
import { For, type JSX, Show } from 'solid-js'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterSelect {
  /** Accessible name; also the placeholder when nothing is chosen. */
  label: string
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  width?: string
}

export interface FilterBarProps {
  /** Rendered as a search input. Omit for a bar with no query box. */
  query?: {
    value?: string
    placeholder?: string
    onInput?: (value: string) => void
    width?: string
  }
  /** One or more selects, in order. */
  selects?: FilterSelect[]
  /** A segmented control on the trailing edge — the view switcher. */
  tabs?: {
    options: FilterOption[]
    value?: string
    onValueChange?: (value: string) => void
  }
  /** Anything else on the trailing edge, after the tabs. */
  children?: JSX.Element
  class?: string
}

/**
 * The row of controls above a list: search, one or two selects, and the view
 * switcher.
 *
 * Worth a block because the shape is a decision — search leads and is the widest
 * target, selects are fixed-width so their labels do not jump as values change,
 * and the view switcher is pushed to the far end because it changes how the data
 * below is *drawn* rather than what is in it.
 *
 * `Select` in this library is a value control, not a labelled form field: the
 * filter bar therefore gives each one an `aria-label` from its `label` and uses
 * it as the placeholder, rather than rendering a form label above a toolbar.
 */
export function FilterBar(props: FilterBarProps): JSX.Element {
  return (
    <div class={`flex flex-wrap items-center gap-2 ${props.class ?? ''}`}>
      <Show when={props.query}>
        {(query) => (
          <TextInput
            size="sm"
            value={query().value}
            placeholder={query().placeholder ?? 'Search…'}
            aria-label={query().placeholder ?? 'Search'}
            class={query().width ?? 'w-56'}
            prefix={<Icon icon="lucide-search" class="size-4" />}
            onInput={(event) => query().onInput?.(event.currentTarget.value)}
          />
        )}
      </Show>

      <For each={props.selects ?? []}>
        {(select) => (
          <div class={select.width ?? 'w-40'}>
            <Select
              size="sm"
              options={select.options}
              value={select.value ? [select.value] : []}
              placeholder={select.label}
              aria-label={select.label}
              onValueChange={(value) => select.onValueChange?.(value[0] ?? '')}
            />
          </div>
        )}
      </For>

      <div class="ms-auto flex items-center gap-2">
        <Show when={props.tabs}>
          {(tabs) => (
            <TabButtons
              options={tabs().options}
              value={tabs().value}
              onValueChange={tabs().onValueChange}
            />
          )}
        </Show>
        {props.children}
      </div>
    </div>
  )
}
