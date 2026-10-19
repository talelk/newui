import type { Editor as TiptapEditor } from '@tiptap/core'
import {
  createEffect,
  createSignal,
  For,
  type JSX,
  onCleanup,
  splitProps,
  useContext,
} from 'solid-js'
import { EditorEditableContext, useEditorAccessor } from './context'

interface ToolbarAction {
  /** Stable id, also the `data-action` hook. */
  id: string
  /** Accessible name, and the visible label for this lean toolbar. */
  label: string
  /**
   * Whether the action reports a pressed state (`aria-pressed`). Toggles set
   * this; one-shot commands such as "insert table" leave it off, because a
   * pressed state would be meaningless.
   */
  toggle?: boolean
  /** Whether the action currently applies at the selection. */
  active: (editor: TiptapEditor) => boolean
  /** Whether the command is available in the current document/history. */
  enabled?: (editor: TiptapEditor) => boolean
  /** Apply the action to the editor. */
  run: (editor: TiptapEditor) => void
}

/**
 * Ask for an image URL. `window.prompt` is the lean default; it is absent on the
 * server and throws "not implemented" under jsdom, so both are caught and treated
 * as "cancelled". Consumers wanting a file picker compose their own toolbar.
 */
function promptForUrl(label: string, initial = 'https://'): string | null {
  try {
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
      return null
    }
    return window.prompt(label, initial)
  } catch {
    return null
  }
}

/**
 * The buttons the lean toolbar ships. Declared as data so the toolbar component
 * stays a dumb renderer and the set is testable on its own.
 */
const ACTIONS: ToolbarAction[] = [
  {
    id: 'paragraph',
    label: 'Paragraph',
    toggle: true,
    active: (editor) => editor.isActive('paragraph'),
    run: (editor) => {
      editor.chain().focus().setParagraph().run()
    },
  },
  {
    id: 'bold',
    label: 'Bold',
    toggle: true,
    active: (editor) => editor.isActive('bold'),
    run: (editor) => {
      editor.chain().focus().toggleBold().run()
    },
  },
  {
    id: 'italic',
    label: 'Italic',
    toggle: true,
    active: (editor) => editor.isActive('italic'),
    run: (editor) => {
      editor.chain().focus().toggleItalic().run()
    },
  },
  {
    id: 'heading-1',
    label: 'Heading 1',
    toggle: true,
    active: (editor) => editor.isActive('heading', { level: 1 }),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    toggle: true,
    active: (editor) => editor.isActive('heading', { level: 2 }),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
  },
  {
    id: 'heading-3',
    label: 'Heading 3',
    toggle: true,
    active: (editor) => editor.isActive('heading', { level: 3 }),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
  },
  {
    id: 'bullet-list',
    label: 'Bullet list',
    toggle: true,
    active: (editor) => editor.isActive('bulletList'),
    run: (editor) => {
      editor.chain().focus().toggleBulletList().run()
    },
  },
  {
    id: 'ordered-list',
    label: 'Ordered list',
    toggle: true,
    active: (editor) => editor.isActive('orderedList'),
    run: (editor) => {
      editor.chain().focus().toggleOrderedList().run()
    },
  },
  {
    id: 'link',
    label: 'Link',
    toggle: true,
    active: (editor) => editor.isActive('link'),
    run: (editor) => {
      const current = editor.getAttributes('link')['href'] as string | undefined
      const url = promptForUrl(
        'Link URL (leave empty to remove)',
        current ?? 'https://',
      )
      if (url === null) return
      const chain = editor.chain().focus().extendMarkRange('link')
      if (url.trim()) chain.setLink({ href: url.trim() }).run()
      else chain.unsetLink().run()
    },
  },
  {
    id: 'table',
    label: 'Table',
    active: () => false,
    run: (editor) => {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    id: 'image',
    label: 'Image',
    active: () => false,
    run: (editor) => {
      const url = promptForUrl('Image URL')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
  {
    id: 'undo',
    label: 'Undo',
    active: () => false,
    enabled: (editor) => editor.can().undo(),
    run: (editor) => {
      editor.chain().focus().undo().run()
    },
  },
  {
    id: 'redo',
    label: 'Redo',
    active: () => false,
    enabled: (editor) => editor.can().redo(),
    run: (editor) => {
      editor.chain().focus().redo().run()
    },
  },
]

export interface EditorToolbarProps {
  /**
   * Explicit editor instance. Defaults to the nearest `<Editor>` (context), so
   * the common case is just `<EditorToolbar />` inside an `<Editor>`.
   */
  editor?: TiptapEditor | null
  /** Accessible name for the toolbar. */
  'aria-label'?: string
  /** Root class fallthrough, merged last (P10). */
  class?: string
}

/**
 * A small formatting toolbar bound to an editor's commands. Reads the editor
 * from `<Editor>` context unless one is passed explicitly, and re-renders its
 * pressed states on every TipTap transaction.
 */
export function EditorToolbar(props: EditorToolbarProps): JSX.Element {
  const [local, rest] = splitProps(props, ['editor', 'aria-label', 'class'])

  // Resolve the context accessor once, at setup, then read it lazily so the
  // toolbar stays reactive to the editor being created and destroyed.
  const contextAccessor = useEditorAccessor()
  const contextEditable = useContext(EditorEditableContext)
  const editor = () => local.editor ?? contextAccessor?.() ?? null

  // TipTap is not a Solid store, so its `transaction` events are bridged into a
  // signal that the pressed-state reads depend on. The counter always changes,
  // so a default-equality signal is enough.
  const [version, setVersion] = createSignal(0)
  createEffect(() => {
    const instance = editor()
    if (!instance) return
    const onTransaction = () => setVersion((value) => value + 1)
    instance.on('transaction', onTransaction)
    instance.on('update', onTransaction)
    onCleanup(() => {
      instance.off('transaction', onTransaction)
      instance.off('update', onTransaction)
    })
  })

  const isActive = (action: ToolbarAction) => {
    version()
    const instance = editor()
    return instance ? action.active(instance) : false
  }
  const isDisabled = (action: ToolbarAction) => {
    version()
    const instance = editor()
    const editable = local.editor
      ? instance?.isEditable
      : (contextEditable?.() ?? instance?.isEditable)
    return (
      !editable ||
      !instance ||
      (action.enabled ? !action.enabled(instance) : false)
    )
  }

  return (
    <div
      {...rest}
      role="toolbar"
      aria-label={local['aria-label'] ?? 'Formatting'}
      class={`flex flex-wrap gap-1 rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-2 ${local.class ?? ''}`}
      data-slot="editor-toolbar"
    >
      <For each={ACTIONS}>
        {(action) => (
          <button
            type="button"
            data-slot="editor-toolbar-item"
            data-action={action.id}
            // `data-state` is the hook the coherence sweep groups peers by: an
            // active toggle is a different thing from an idle one, and without
            // it their colours read as drift instead of state.
            data-state={
              action.toggle
                ? isActive(action)
                  ? 'active'
                  : 'inactive'
                : undefined
            }
            data-active={action.toggle && isActive(action) ? '' : undefined}
            aria-pressed={action.toggle ? isActive(action) : undefined}
            aria-label={action.label}
            disabled={isDisabled(action)}
            class="h-7 rounded-3 border border-outline-gray-2 bg-surface-elevation-1 px-2 text-base font-medium text-ink-gray-7 hover:bg-surface-gray-2 data-[active]:bg-surface-gray-3 data-[active]:text-ink-gray-9 focus-visible:focus-ring-blue disabled:opacity-50"
            onClick={() => {
              const instance = editor()
              if (instance && !isDisabled(action)) action.run(instance)
            }}
          >
            {action.label}
          </button>
        )}
      </For>
    </div>
  )
}
