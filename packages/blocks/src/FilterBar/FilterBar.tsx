import {
  Button,
  Icon,
  Select,
  type SelectOption,
  TabButtons,
  TextInput,
} from '@newui/ui'
import { For, type JSX, onCleanup, onMount, Show } from 'solid-js'

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

export interface FilterChip {
  /** The active filter as the reader states it, e.g. `Status: Open`. */
  label: string
  /** When set, the chip carries a remove button that calls this. */
  onRemove?: () => void
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
  /** Active filters restated as removable pills under the bar. */
  chips?: FilterChip[]
  /**
   * Renders a "Clear all" button while a filter is active (a chip, a filled
   * select, or a non-empty query). The bar never clears anything itself —
   * it reports the request and the caller resets its own state.
   */
  onClearAll?: () => void
  /** Rows the current filters match, stated under the bar (`24 results`). */
  resultCount?: number
  /** Anything else on the trailing edge, after the tabs. */
  children?: JSX.Element
  class?: string
}

/** True when a keystroke is landing in something the user is already editing. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/**
 * The row of controls above a list: search, one or two selects, and the view
 * switcher, on one quiet surface so the controls read as a single toolbar
 * rather than loose fields above the data.
 *
 * Worth a block because the shape is a decision — search leads and is the widest
 * target, selects are fixed-width so their labels do not jump as values change,
 * and the view switcher is pushed to the far end because it changes how the data
 * below is *drawn* rather than what is in it. A filled select takes the filled
 * (`subtle`) surface, so what is filtering the list is visible without opening
 * anything; the active set can also be restated as removable chips with a
 * result count and a clear-all, which is the point where a row of controls
 * becomes an answer to "why am I seeing these rows".
 *
 * The filter bar gives each Select an `aria-label` from its `label` and uses
 * it as the placeholder, rather than rendering a form label above a toolbar.
 * The search box carries a `/` hint and honours it: pressing `/` anywhere
 * outside another editing surface focuses the box.
 */
export function FilterBar(props: FilterBarProps): JSX.Element {
  let searchBox: HTMLSpanElement | undefined

  onMount(() => {
    if (!props.query) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey)
        return
      if (isEditable(event.target)) return
      const input = searchBox?.querySelector('input')
      if (!input) return
      event.preventDefault()
      input.focus()
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  const activeCount = () =>
    (props.chips?.length ?? 0) +
    (props.selects ?? []).filter((select) => Boolean(select.value)).length +
    (props.query?.value ? 1 : 0)
  const showClearAll = () => props.onClearAll !== undefined && activeCount() > 0
  const showMetaRow = () =>
    (props.chips?.length ?? 0) > 0 ||
    props.resultCount !== undefined ||
    showClearAll()

  return (
    <div
      data-slot="filter-bar"
      class={`flex max-w-full flex-col gap-2 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-2 ${props.class ?? ''}`}
    >
      <div class="flex max-w-full flex-wrap items-center gap-2">
        <Show when={props.query}>
          {(query) => (
            <span ref={searchBox} class="contents">
              <TextInput
                size="md"
                type="search"
                value={query().value}
                placeholder={query().placeholder ?? 'Search…'}
                aria-label={query().placeholder ?? 'Search'}
                class={`max-w-full ${query().width ?? 'w-full sm:w-56'}`}
                prefix={<Icon icon="lucide-search" class="size-4" />}
                suffix={
                  <kbd class="rounded-2 border border-outline-gray-2 bg-surface-gray-1 px-1 text-caption text-ink-gray-7">
                    /
                  </kbd>
                }
                onInput={(event) =>
                  query().onInput?.(event.currentTarget.value)
                }
              />
            </span>
          )}
        </Show>

        <For each={props.selects ?? []}>
          {(select) => (
            <div class={`max-w-full ${select.width ?? 'w-40'}`}>
              <Select
                size="md"
                variant={select.value ? 'subtle' : 'outline'}
                options={select.options}
                value={select.value ? [select.value] : []}
                placeholder={select.label}
                aria-label={select.label}
                onValueChange={(value) =>
                  select.onValueChange?.(value[0] ?? '')
                }
              />
            </div>
          )}
        </For>

        <div class="ms-auto flex max-w-full flex-wrap items-center gap-2">
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

      <Show when={showMetaRow()}>
        <div
          data-slot="filter-bar-meta"
          class="flex max-w-full flex-wrap items-center gap-1.5 px-1"
        >
          <Show when={props.resultCount !== undefined}>
            <span
              aria-live="polite"
              class="me-1 text-caption tabular-nums text-ink-gray-7"
            >
              {props.resultCount}{' '}
              {props.resultCount === 1 ? 'result' : 'results'}
            </span>
          </Show>
          <For each={props.chips ?? []}>
            {(chip) => (
              <span
                data-slot="filter-chip"
                class={`inline-flex items-center gap-1 rounded-full border border-outline-gray-2 bg-surface-base py-0.5 ps-2 text-caption text-ink-gray-8 ${chip.onRemove ? 'pe-1' : 'pe-2'}`}
              >
                {chip.label}
                <Show when={chip.onRemove}>
                  {(onRemove) => (
                    <button
                      type="button"
                      aria-label={`Remove filter: ${chip.label}`}
                      class="grid size-4 place-items-center rounded-full text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none"
                      onClick={() => onRemove()()}
                    >
                      <Icon icon="lucide-x" class="size-3" />
                    </button>
                  )}
                </Show>
              </span>
            )}
          </For>
          <Show when={showClearAll()}>
            <span class="ms-auto">
              <Button
                variant="ghost"
                theme="gray"
                size="sm"
                onClick={() => props.onClearAll?.()}
              >
                Clear all
              </Button>
            </span>
          </Show>
        </div>
      </Show>
    </div>
  )
}
