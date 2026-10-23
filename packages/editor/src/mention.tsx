import type { Editor as TiptapEditor } from '@tiptap/core'
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from '@tiptap/suggestion'
import { createSignal, For, type JSX } from 'solid-js'
import { render } from 'solid-js/web'

/** One candidate in the mention suggestion popup. */
export interface MentionItem {
  /** Stable identifier stored on the mention node (`data-id`). */
  id: string
  /** Text shown in the popup and rendered as the mention label. */
  label: string
}

/** How many candidates the popup shows at once. */
const MAX_SUGGESTIONS = 10

/**
 * Filter candidates by the typed query (case-insensitive, matches anywhere in
 * the label) and cap the list. An empty query shows the first `MAX_SUGGESTIONS`.
 *
 * Exported so the pure matching rule is pinned by a test.
 */
export function filterMentionItems(
  items: readonly MentionItem[],
  query: string,
): MentionItem[] {
  const needle = query.trim().toLowerCase()
  const matches = needle
    ? items.filter((item) => item.label.toLowerCase().includes(needle))
    : items
  return matches.slice(0, MAX_SUGGESTIONS)
}

interface MentionListProps {
  /** Id of the listbox, referenced by the editor's `aria-controls`. */
  listId: string
  /** Id of the option at a given index, referenced by `aria-activedescendant`. */
  optionId: (index: number) => string
  items: MentionItem[]
  selected: number
  onSelect: (index: number) => void
}

/**
 * The popup body: a listbox of options. Purely presentational — the renderer
 * owns selection so keyboard navigation does not depend on DOM focus, which
 * stays in the editor.
 */
function MentionList(props: MentionListProps): JSX.Element {
  return (
    <div
      id={props.listId}
      role="listbox"
      aria-label="Mention suggestions"
      data-slot="editor-mention-listbox"
      class="min-w-40 rounded-overlay border border-outline-gray-1 bg-surface-elevation-1 p-1 text-ink-gray-9 shadow-lg"
    >
      <For each={props.items}>
        {(item, index) => (
          <div
            id={props.optionId(index())}
            role="option"
            tabIndex={-1}
            aria-selected={index() === props.selected}
            data-slot="editor-mention-option"
            data-active={index() === props.selected ? '' : undefined}
            class="cursor-pointer rounded-3 px-2 py-1.5 text-base text-ink-gray-8 data-[active]:bg-surface-gray-3 data-[active]:text-ink-gray-9"
            // `mousedown` (not `click`) so focus never leaves the editor; the
            // plugin's keydown/command path stays the single insertion route.
            onMouseDown={(event) => {
              event.preventDefault()
              props.onSelect(index())
            }}
          >
            {item.label}
          </div>
        )}
      </For>
    </div>
  )
}

/** The render object `@tiptap/suggestion` expects, wired to the list above. */
interface MentionRenderer {
  onStart: (props: SuggestionProps<MentionItem, MentionItem>) => void
  onUpdate: (props: SuggestionProps<MentionItem, MentionItem>) => void
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
  onExit: () => void
}

let rendererCount = 0

/** Point the focused editor surface at the active option (or clear it). */
function setActiveDescendant(
  editor: TiptapEditor | undefined,
  id: string | null,
): void {
  const dom = editor?.view?.dom
  if (!dom) return
  if (id) dom.setAttribute('aria-activedescendant', id)
  else dom.removeAttribute('aria-activedescendant')
}

/**
 * A Solid renderer for the mention suggestion. `@tiptap/suggestion` calls the
 * `render` factory once per editor and reuses the returned object across every
 * trigger session, so this keeps one detached Solid root and mounts its element
 * through the plugin's `props.mount` (which portals it to `<body>` and anchors
 * it to the caret with Floating UI — no extra dependency).
 *
 * Keyboard selection lives here rather than in the list: focus stays in the
 * editor, so the listbox is driven by `aria-activedescendant` on the editor
 * surface instead of by DOM focus.
 */
export function createMentionRenderer(): MentionRenderer {
  const uid = `editor-mention-${++rendererCount}`
  const listId = `${uid}-listbox`
  const optionId = (index: number) => `${uid}-option-${index}`

  const [items, setItems] = createSignal<MentionItem[]>([])
  const [selected, setSelected] = createSignal(0)

  let editor: TiptapEditor | undefined
  let command: ((item: MentionItem) => void) | undefined
  let dispose: (() => void) | undefined
  let unmount: (() => void) | undefined
  let container: HTMLDivElement | undefined

  const syncActiveDescendant = () => {
    const active = items().length > 0 ? optionId(selected()) : null
    setActiveDescendant(editor, active)
  }

  const clearEditorAria = () => {
    const dom = editor?.view?.dom
    if (!dom) return
    dom.removeAttribute('aria-activedescendant')
    dom.removeAttribute('aria-controls')
  }

  const apply = (suggestion: SuggestionProps<MentionItem, MentionItem>) => {
    editor = suggestion.editor
    command = (item) => suggestion.command(item)
    editor.view?.dom.setAttribute('aria-controls', listId)
    setItems(suggestion.items)
    setSelected(0)
    syncActiveDescendant()
  }

  const move = (delta: number) => {
    const count = items().length
    if (count === 0) return
    setSelected((index) => (index + delta + count) % count)
    syncActiveDescendant()
  }

  const choose = (index: number) => {
    const item = items()[index]
    if (item) command?.(item)
  }

  return {
    onStart(suggestion) {
      container = document.createElement('div')
      container.dataset['slot'] = 'editor-mention-popup'
      dispose = render(
        () => (
          <MentionList
            listId={listId}
            optionId={optionId}
            items={items()}
            selected={selected()}
            onSelect={choose}
          />
        ),
        container,
      )
      apply(suggestion)
      unmount = suggestion.mount(container)
    },

    onUpdate(suggestion) {
      apply(suggestion)
    },

    onKeyDown(keyEvent) {
      const { key } = keyEvent.event
      if (key === 'ArrowDown') {
        move(1)
        return true
      }
      if (key === 'ArrowUp') {
        move(-1)
        return true
      }
      if (key === 'Enter' || key === 'Tab') {
        if (items().length === 0) return false
        choose(selected())
        return true
      }
      // Escape is handled by the plugin itself (it runs `onExit`).
      return false
    },

    onExit() {
      clearEditorAria()
      unmount?.()
      dispose?.()
      unmount = undefined
      dispose = undefined
      container = undefined
      command = undefined
      editor = undefined
      setItems([])
      setSelected(0)
    },
  }
}
