import { Icon, type IconProp } from '@talelk/newui-atoms'
import { cn } from '@talelk/newui-atoms/internal'
import { Dialog } from '@talelk/newui-molecules'
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
  useContext,
} from 'solid-js'

/**
 * A command palette: ⌘K, a query, and a list of things you can do.
 *
 * The state is Zag's `dialog` machine (focus trap, Escape, backdrop, scroll
 * lock) plus a filtered list. The list is *not* a Zag listbox, and that is a
 * decision rather than a shortcut: a listbox collection is built once from a
 * static set of items, while a palette is rebuilt on every keystroke — items
 * come and go as the query narrows, and the highlight has to survive that. So
 * the dialog is the machine's and the highlight is ours, expressed with
 * `aria-activedescendant`, which is what keeps focus in the input while the
 * arrows move down the list.
 *
 * Items self-register. That is what lets a consumer write groups and items as
 * plain JSX in any nesting, with the keyboard walking one flat, filtered list
 * across all of them.
 */

/**
 * Everything about an item is read through a function, not captured: an item is
 * registered once and lives until it unmounts, so a plain field would freeze the
 * first value a prop ever had.
 */
interface CommandRecord {
  value: Accessor<string>
  /** Extra search text: words that should match without being shown. */
  keywords: Accessor<string>
  label: Accessor<string>
  disabled: Accessor<boolean>
  matches: Accessor<boolean>
  select: () => void
}

interface CommandContextValue {
  query: Accessor<string>
  setQuery: (value: string) => void
  register: (record: CommandRecord) => void
  unregister: (record: CommandRecord) => void
  visible: Accessor<CommandRecord[]>
  highlighted: Accessor<string | undefined>
  highlight: (value: string | undefined) => void
  move: (delta: number) => void
  accept: () => void
  itemId: (value: string) => string
}

const CommandContext = createContext<CommandContextValue>()

function useCommand(): CommandContextValue {
  const context = useContext(CommandContext)
  if (!context)
    throw new Error('CommandPalette parts must be used within <CommandPalette>')
  return context
}

/**
 * The palette is a WAI-ARIA combobox: focus stays in the field, and the option
 * the keyboard is on is named by `aria-activedescendant`. Three lint rules assume
 * the opposite — that focus moves onto the option — so they are off for this file
 * rather than worked around:
 *
 * - `useFocusableInteractive` / `useKeyWithClickEvents`: a focusable option would
 *   pull focus out of the field the moment you arrow down, which is exactly what
 *   the pattern avoids. The field owns the keys; the click handler is for
 *   pointers.
 * - `useSemanticElements`: the options are rich rows (icon, description,
 *   shortcut) and the collection is rebuilt on every keystroke, which no native
 *   select or datalist expresses.
 */

/**
 * Both sides are reduced to letters and digits before comparing, so the way
 * people actually type a compound name finds it: `date picker`, `date-picker`
 * and `DatePicker` are one query, and no one has to know where the case
 * boundary is.
 */
function fold(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Rank: a label that starts with the query beats one that merely contains it. */
function score(label: string, keywords: string, query: string): number | null {
  const needle = fold(query)
  if (needle === '') return 0
  const index = fold(`${label} ${keywords}`).indexOf(needle)
  if (index === -1) return null
  return (fold(label).startsWith(needle) ? 0 : 100) + index
}

let commandId = 0

export interface CommandPaletteProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Bind ⌘K / Ctrl+K. Default `true`; the listener only opens, never closes —
   * pressing it inside an open palette should feel like nothing happened rather
   * than like a toggle you cannot see.
   */
  shortcut?: boolean
  placeholder?: string
  /** Accessible name of both the dialog and the list. Default `Commands`. */
  label?: string
  /** Max width class. Default `md`. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Rendered when nothing matches. */
  empty?: JSX.Element
  /** Replaces the list with a loading row while commands register. */
  loading?: boolean
  class?: string
  children: JSX.Element
}

export function CommandPalette(props: CommandPaletteProps): JSX.Element {
  commandId += 1
  const id = `command-${commandId}`
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(
    props.defaultOpen ?? false,
  )
  const isControlled = () => props.open !== undefined
  const open = () => props.open ?? uncontrolledOpen()
  const setOpen = (next: boolean) => {
    if (!isControlled()) setUncontrolledOpen(next)
    props.onOpenChange?.(next)
  }

  const [query, setQuery] = createSignal('')
  const [highlighted, setHighlighted] = createSignal<string>()
  /**
   * The registry is a signal, not a plain array with a counter beside it.
   *
   * That is not tidiness: `isEmpty` reads the registry *first*, and with a plain
   * array the first render short-circuits on `length === 0` before touching
   * anything reactive — so the empty state's condition records no dependency at
   * all and never re-runs. It renders nothing, forever, while every other read
   * of the same state updates.
   */
  const [registry, setRegistry] = createSignal<CommandRecord[]>([])

  const visible = createMemo(() => {
    const current = query()
    return registry()
      .filter((record) => record.matches())
      .map((record) => ({
        record,
        rank: score(record.label(), record.keywords(), current) ?? 0,
      }))
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.record)
  })

  /** Registered but none matching: not the same as "nothing has mounted yet". */
  const isEmpty = () => registry().length > 0 && visible().length === 0

  const register = (record: CommandRecord) =>
    setRegistry((entries) => [...entries, record])
  const unregister = (record: CommandRecord) =>
    setRegistry((entries) => entries.filter((entry) => entry !== record))

  const move = (delta: number) => {
    const items = visible()
    if (items.length === 0) return
    const current = items.findIndex((entry) => entry.value() === highlighted())
    let index = current === -1 ? (delta > 0 ? -1 : 0) : current
    // A disabled entry is stepped over rather than landed on: it is in the list
    // because it explains why it cannot be used, not because it is a target.
    for (let step = 0; step < items.length; step += 1) {
      index = (index + delta + items.length) % items.length
      if (!items[index]?.disabled()) break
    }
    setHighlighted(items[index]?.value())
  }

  const accept = () => {
    const items = visible()
    const chosen =
      items.find((entry) => entry.value() === highlighted()) ?? items[0]
    if (!chosen || chosen.disabled()) return
    setOpen(false)
    chosen.select()
  }

  // The first match is the highlighted one: a palette you can open and confirm
  // without looking at the list is the point of having one.
  createEffect(() => {
    const items = visible()
    if (!items.some((entry) => entry.value() === highlighted()))
      setHighlighted(items.find((entry) => !entry.disabled())?.value())
  })
  // A fresh palette starts empty, not showing the last search.
  createEffect(() => {
    if (!open()) setQuery('')
  })

  // Zag's trap moves focus into the dialog content; this moves it one step
  // further, into the only control there is. An effect, not the `autofocus`
  // attribute, because the content does not exist until `open` flips.
  createEffect(() => {
    if (open()) field?.focus()
  })

  onMount(() => {
    if (props.shortcut === false) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      if (!open()) setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  const context: CommandContextValue = {
    query,
    setQuery,
    register,
    unregister,
    visible,
    highlighted,
    highlight: setHighlighted,
    move,
    accept,
    itemId: (value) => `${id}-${value.replace(/\W+/g, '-')}`,
  }

  let field: HTMLInputElement | undefined
  const activeId = () => {
    const value = highlighted()
    return value === undefined ? undefined : context.itemId(value)
  }

  return (
    <CommandContext.Provider value={context}>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content
          bare
          position="top"
          size={props.size ?? 'md'}
          class={cn('max-h-[60vh] overflow-hidden', props.class)}
        >
          {/* A modal dialog has to be named: the field carries the label for the
              listbox, but the dialog itself is what a screen reader announces on
              open. */}
          <Dialog.Title class="sr-only">
            {props.label ?? 'Commands'}
          </Dialog.Title>
          <div data-slot="command-palette" role="presentation">
            <div class="flex items-center gap-2 border-b border-outline-gray-1 px-3">
              <Icon
                icon="lucide-search"
                class="size-4 shrink-0 text-ink-gray-5"
                aria-hidden="true"
              />
              <input
                ref={field}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-list`}
                aria-activedescendant={activeId()}
                aria-autocomplete="list"
                aria-label={props.label ?? 'Commands'}
                placeholder={props.placeholder ?? 'Search commands…'}
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    move(1)
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    move(-1)
                  } else if (event.key === 'Enter') {
                    event.preventDefault()
                    accept()
                  }
                }}
                class="h-11 min-w-0 flex-1 bg-transparent text-base text-ink-gray-9 placeholder:text-ink-gray-5 focus:outline-none"
              />
            </div>

            <div
              id={`${id}-list`}
              role="listbox"
              aria-label={props.label ?? 'Commands'}
              class="max-h-[50vh] overflow-y-auto p-1.5"
            >
              {/*
                The items are *always* rendered, never behind a `Show` that
                reads the filtered list: an item registers itself when it mounts,
                so hiding the list until the registry is non-empty deadlocks —
                no items, so no registry, so the empty state, forever.
              */}
              <Show when={!props.loading}>{props.children}</Show>
              <Show when={props.loading}>
                <div
                  role="option"
                  aria-disabled="true"
                  class="px-2 py-6 text-center text-base text-ink-gray-6"
                >
                  Loading commands…
                </div>
              </Show>
              <Show when={!props.loading && isEmpty()}>
                {/* A listbox may only contain options/groups: the empty
                    message is a disabled option, the one shape a screen
                    reader can address inside the list. */}
                <div
                  role="option"
                  aria-disabled="true"
                  class="px-2 py-6 text-center text-base text-ink-gray-6"
                >
                  {props.empty ?? 'Nothing matches.'}
                </div>
              </Show>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </CommandContext.Provider>
  )
}

export interface CommandGroupProps {
  /** Group heading; also the group's accessible name. */
  label: string
  children: JSX.Element
}

/**
 * A titled run of items.
 *
 * The heading is hidden while the query is filtering: the grouping is an aid to
 * browsing, and once you are searching for one thing the order is relevance.
 */
export function CommandGroup(props: CommandGroupProps): JSX.Element {
  const context = useCommand()
  return (
    <div role="group" aria-label={props.label}>
      <Show when={context.query() === ''}>
        <div
          data-slot="command-group-label"
          class="px-2 pt-2 pb-1 text-sm-medium text-ink-gray-6"
        >
          {props.label}
        </div>
      </Show>
      {props.children}
    </div>
  )
}

export interface CommandItemProps {
  /** Stable identity; also what `onSelect` reports. */
  value: string
  /** Extra search text for words that are not in the visible label. */
  keywords?: string
  icon?: IconProp
  /** Trailing hint, e.g. `⌘B`. Purely informational. */
  shortcut?: string
  description?: string
  disabled?: boolean
  onSelect?: (value: string) => void
  children: JSX.Element
}

export function CommandItem(props: CommandItemProps): JSX.Element {
  const context = useCommand()
  const [element, setElement] = createSignal<HTMLDivElement>()

  const label = () =>
    typeof props.children === 'string'
      ? props.children
      : (element()?.textContent ?? '')

  const value = () => props.value
  const record: CommandRecord = {
    value,
    keywords: () => props.keywords ?? '',
    label,
    disabled: () => props.disabled ?? false,
    matches: () =>
      score(label(), props.keywords ?? '', context.query()) !== null,
    select: () => props.onSelect?.(value()),
  }

  onMount(() => {
    context.register(record)
    onCleanup(() => context.unregister(record))
  })

  const selected = () => context.highlighted() === props.value
  const matches = () => record.matches()

  /* The item stays mounted while it does not match — it is hidden, not removed,
   * because unmounting it would unregister it, and the registry is how the
   * palette tells "nothing has mounted yet" from "nothing matches". The wrapper
   * carries the `hidden` *attribute* and no display utility, so nothing can
   * out-rank it: a `flex` class on the same element would win in the browser
   * while looking right in a test. */
  return (
    <div hidden={!matches()}>
      <div
        ref={setElement}
        id={context.itemId(props.value)}
        role="option"
        aria-selected={selected()}
        aria-disabled={props.disabled ? true : undefined}
        data-slot="command-item"
        data-selected={selected() ? '' : undefined}
        data-disabled={props.disabled ? '' : undefined}
        onClick={() => {
          if (props.disabled) return
          props.onSelect?.(props.value)
        }}
        onPointerMove={() => {
          if (!props.disabled) context.highlight(props.value)
        }}
        class={cn(
          'flex cursor-pointer items-center gap-2 rounded-control px-2 py-2 text-base text-ink-gray-8 transition-colors',
          'data-[selected]:bg-surface-gray-2',
          'data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4',
        )}
      >
        <Show when={props.icon}>
          {(icon) => (
            <Icon
              icon={icon()}
              class="size-4 shrink-0 text-ink-gray-6"
              aria-hidden="true"
            />
          )}
        </Show>
        <span class="min-w-0 flex-1 truncate">{props.children}</span>
        <Show when={props.description}>
          <span class="shrink-0 text-sm text-ink-gray-5">
            {props.description}
          </span>
        </Show>
        <Show when={props.shortcut}>
          <kbd
            data-slot="command-shortcut"
            class="shrink-0 rounded-control border border-outline-gray-2 px-1.5 py-0.5 font-sans text-xs text-ink-gray-6"
          >
            {props.shortcut}
          </kbd>
        </Show>
      </div>
    </div>
  )
}
