import {
  displayText,
  isMacPlatform,
  KeyboardShortcut,
  parseCombo,
  TextInput,
} from '@talelk/newui-atoms'
import { cn, createDisclosure } from '@talelk/newui-atoms/internal'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  splitProps,
} from 'solid-js'
import { Dialog } from '../Dialog'

/**
 * One row of the shortcuts dialog. `label` is this library's name for the row;
 * `description` is frappe-ui's. Either one works — `label` wins when both are
 * set.
 */
export interface KeyboardShortcutEntry {
  /** Group heading the row sits under. Defaults to `General`. */
  group?: string
  /** Row name. */
  label?: string
  /** frappe-ui alias for `label`. */
  description?: string
  /** Shortcut combo, e.g. `"Mod+K"`. */
  combo: string
  /** Alternative equivalent combos, drawn after a `/` (display only). */
  altCombos?: string[]
}

/** A group of rows, as the dialog renders them. */
export interface KeyboardShortcutGroup {
  name: string
  shortcuts: KeyboardShortcutEntry[]
}

export interface KeyboardShortcutsDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The shortcuts to list, in the order they should appear. */
  shortcuts: KeyboardShortcutEntry[]
  /** Dialog title (default: `"Keyboard Shortcuts"`). */
  title?: string
  /**
   * The search field appears once the number of rows passes this count
   * (default: 20).
   */
  searchThreshold?: number
  class?: string
}

const DEFAULT_GROUP = 'General'
const DEFAULT_TITLE = 'Keyboard Shortcuts'
const DEFAULT_SEARCH_THRESHOLD = 20

function entryLabel(entry: KeyboardShortcutEntry): string {
  return entry.label ?? entry.description ?? entry.combo
}

// A row for `Mod+Slash` draws `Ctrl /`, so a reader who sees `/` types `/`.
// Searching the raw combo alone would miss it; the row matches on what it
// shows as well as on the name behind it.
function searchText(entry: KeyboardShortcutEntry, isMac: boolean): string {
  const combos = [entry.combo, ...(entry.altCombos ?? [])]
  const shown = combos.map((combo) => displayText(parseCombo(combo, isMac)))
  return [entryLabel(entry), ...combos, ...shown].join(' ').toLowerCase()
}

function groupShortcuts(
  shortcuts: KeyboardShortcutEntry[],
): KeyboardShortcutGroup[] {
  const groups = new Map<string, KeyboardShortcutEntry[]>()
  for (const entry of shortcuts) {
    const name = entry.group ?? DEFAULT_GROUP
    const list = groups.get(name)
    if (list) list.push(entry)
    else groups.set(name, [entry])
  }
  return [...groups].map(([name, items]) => ({ name, shortcuts: items }))
}

/**
 * A dialog that lists keyboard shortcuts in groups, with search. It reuses the
 * `Dialog` compound for focus trapping and dismissal; it only adds the list.
 */
export function KeyboardShortcutsDialog(
  props: KeyboardShortcutsDialogProps,
): JSX.Element {
  const [local] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'shortcuts',
    'title',
    'searchThreshold',
    'class',
  ])

  const [query, setQuery] = createSignal('')
  const [open, setOpen] = createDisclosure({
    value: () => local.open,
    defaultOpen: local.defaultOpen,
    onChange: (value) => local.onOpenChange?.(value),
  })

  // A query left over from the last visit hides most of the list, and the
  // reader has no idea why. Clear it on every close, controlled or not.
  createEffect(() => {
    if (!open()) setQuery('')
  })

  const isMac = isMacPlatform()
  const groups = createMemo(() => groupShortcuts(local.shortcuts ?? []))
  const total = createMemo(() => (local.shortcuts ?? []).length)
  const showSearch = () =>
    total() > (local.searchThreshold ?? DEFAULT_SEARCH_THRESHOLD)

  const filtered = createMemo(() => {
    const text = query().trim().toLowerCase()
    if (!text) return groups()
    return groups()
      .map((group) => ({
        name: group.name,
        shortcuts: group.shortcuts.filter((entry) =>
          searchText(entry, isMac).includes(text),
        ),
      }))
      .filter((group) => group.shortcuts.length > 0)
  })

  const emptyMessage = () =>
    total() === 0
      ? 'No keyboard shortcuts available.'
      : 'No shortcuts match your search.'

  return (
    <Dialog.Root open={open()} onOpenChange={setOpen}>
      <Dialog.Content class={cn('max-w-5xl', local.class)}>
        <Dialog.Header class="mb-3 flex-row items-center justify-between gap-3">
          <Dialog.Title class="text-3xl-semibold leading-6 text-ink-gray-9">
            {local.title ?? DEFAULT_TITLE}
          </Dialog.Title>
          <Show when={showSearch()}>
            <TextInput
              value={query()}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search shortcuts"
              aria-label="Search shortcuts"
              class="w-48"
            />
          </Show>
        </Dialog.Header>
        <div
          data-slot="shortcut-groups"
          class="grid max-h-[70vh] grid-cols-1 gap-8 gap-x-6 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3"
        >
          <Show
            when={filtered().length > 0}
            fallback={
              <p
                data-slot="shortcut-empty"
                class="h-[20vh] py-8 text-center text-sm text-ink-gray-6"
              >
                {emptyMessage()}
              </p>
            }
          >
            <For each={filtered()}>
              {(group) => (
                <section data-slot="shortcut-group" class="space-y-1">
                  <h3
                    data-slot="shortcut-group-title"
                    class="mb-3 text-base-medium tracking-[0.025em] text-ink-gray-8"
                  >
                    {group.name}
                  </h3>
                  <For each={group.shortcuts}>
                    {(entry) => (
                      <div
                        data-slot="shortcut"
                        class="grid grid-cols-[1fr_auto] items-start gap-3 rounded-4 py-0.5"
                      >
                        <span
                          data-slot="shortcut-label"
                          class="text-p-base text-ink-gray-6"
                        >
                          {entryLabel(entry)}
                        </span>
                        <KeyboardShortcut
                          combo={entry.combo}
                          altCombos={entry.altCombos}
                          bg
                        />
                      </div>
                    )}
                  </For>
                </section>
              )}
            </For>
          </Show>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
