import {
  type Content,
  type EditorOptions,
  type Extensions,
  type JSONContent,
  mergeAttributes,
  Editor as TiptapEditor,
} from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Image } from '@tiptap/extension-image'
import { Italic } from '@tiptap/extension-italic'
import { Link } from '@tiptap/extension-link'
import {
  BulletList,
  ListItem,
  ListKeymap,
  OrderedList,
} from '@tiptap/extension-list'
import { Mention, type MentionOptions } from '@tiptap/extension-mention'
import { Paragraph } from '@tiptap/extension-paragraph'
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table'
import { Text } from '@tiptap/extension-text'
import { Placeholder, UndoRedo } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { PluginKey } from '@tiptap/pm/state'
import { Suggestion } from '@tiptap/suggestion'
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  splitProps,
  untrack,
} from 'solid-js'
import { EditorContext } from './context'
import {
  createMentionRenderer,
  filterMentionItems,
  type MentionItem,
} from './mention'

/**
 * The content shape `value`/`onValueChange` speak. `'html'` and `'markdown'`
 * are strings, `'json'` is TipTap's `JSONContent`.
 */
export type EditorFormat = 'html' | 'json' | 'markdown'

/** A document in whichever shape `format` selects. */
export type EditorValue = string | JSONContent

/**
 * Coerce an optional content value to the string TipTap parses. `null` and
 * `undefined` both mean "empty document", never the literal text.
 *
 * Exported so the contract is pinned by a test.
 */
export function normalizeContent(value: string | null | undefined): string {
  return value ?? ''
}

interface PlaceholderStorage {
  text: string
}

// `editor.storage` is an index signature, and this repo runs with
// `noPropertyAccessFromIndexSignature`, so the read goes through a typed,
// bracket-based accessor rather than `editor.storage.placeholder`.
function placeholderStorage(
  editor: TiptapEditor | null | undefined,
): PlaceholderStorage | undefined {
  const storage = editor?.storage as Record<string, unknown> | undefined
  return storage?.['placeholder'] as PlaceholderStorage | undefined
}

/**
 * The Placeholder extension, extended with a `text` slot in its own storage so
 * `<Editor>`'s reactive `placeholder` prop can be threaded in without rebuilding
 * the editor. An explicit `Placeholder.configure({ placeholder })` by a consumer
 * would replace this reader — that is the documented escape hatch.
 */
const EditorPlaceholder = Placeholder.extend({
  addStorage() {
    return { ...(this.parent?.() ?? {}), text: '' }
  },
}).configure({
  placeholder: ({ editor }) => placeholderStorage(editor)?.text ?? '',
})

/**
 * Write the placeholder text onto a live editor and refresh the decoration.
 * Placeholder decorations only recompute on a state change, so an empty (no-step)
 * transaction forces the refresh without emitting an update or a doc change.
 *
 * Exported so it can be exercised without a DOM.
 */
export function setPlaceholder(
  editor: TiptapEditor | null | undefined,
  text: string,
): void {
  const storage = placeholderStorage(editor)
  if (!editor || editor.isDestroyed || !storage || storage.text === text) return
  storage.text = text
  editor.view.dispatch(editor.state.tr)
}

interface EditorMentionOptions extends MentionOptions {
  /** The prefix rendered before a mention label, e.g. `@`. */
  suggestionChar: string
  /**
   * Candidate source for the `@` popup, or `null` to ship the suggestion-less
   * node only. Read on every query, so the list stays reactive to a changing
   * prop without rebuilding the editor.
   */
  getItems: (() => MentionItem[]) | null
}

/**
 * A mention node with an optional trigger popup. TipTap's `Mention` installs a
 * `Suggestion` plugin that opens a trigger menu; this package overrides
 * `addProseMirrorPlugins` so the popup is installed only when the consumer
 * supplies `mentionItems`. Without it, mentions are inserted programmatically
 * (`editor.commands.insertContent`) and `suggestionChar` only controls the
 * rendered prefix.
 */
const EditorMention = Mention.extend<EditorMentionOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      suggestionChar: '@',
      getItems: null,
    } as EditorMentionOptions
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      mentionSuggestionChar: {
        default: this.options.suggestionChar,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-mention-suggestion-char') ??
          this.options.suggestionChar,
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-mention-suggestion-char': attributes['mentionSuggestionChar'],
        }),
      },
    }
  },
  // No `mentionItems` → no trigger popup; the parent's `Suggestion` plugin is
  // dropped and the node is insert-only.
  addProseMirrorPlugins() {
    const getItems = this.options.getItems
    if (!getItems) return []
    return [
      Suggestion<MentionItem, MentionItem>({
        editor: this.editor,
        char: this.options.suggestionChar,
        pluginKey: new PluginKey('editorMention'),
        allowSpaces: false,
        items: ({ query }) => filterMentionItems(getItems(), query),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'mention', attrs: { id: props.id, label: props.label } },
              // A trailing space ends the mention so typing continues normally.
              { type: 'text', text: ' ' },
            ])
            .run()
        },
        render: createMentionRenderer,
      }),
    ]
  },
  renderText({ node }) {
    const attrs = node.attrs
    const char = attrs['mentionSuggestionChar'] ?? this.options.suggestionChar
    return `${char}${attrs['label'] ?? attrs['id']}`
  },
  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs
    const char = attrs['mentionSuggestionChar'] ?? this.options.suggestionChar
    return [
      'span',
      mergeAttributes(
        { 'data-type': this.name },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      `${char}${attrs['label'] ?? attrs['id']}`,
    ]
  },
})

/**
 * The lean extension set the editor ships: the document basics plus the marks
 * and nodes the toolbar drives, and the three richer nodes (table, image,
 * mention) this package adds on top. Consumers who need more pass `extensions`.
 *
 * `Markdown` is only added for `format: 'markdown'`, so the `marked` payload
 * stays out of the other formats.
 */
function builtInExtensions(
  format: EditorFormat,
  mentionChar: string,
  getMentionItems: (() => MentionItem[]) | null,
): Extensions {
  const extensions: Extensions = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
    ListKeymap,
    Link.configure({ openOnClick: false, autolink: true }),
    // Column resizing (drag handles on cell borders) is stock behaviour; it is
    // installed at editor creation when the editor is editable.
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    // Drag handles on all eight directions; TipTap's own `ResizableNodeView`
    // renders them, so no extra dependency is needed.
    Image.configure({ resize: { enabled: true } }),
    EditorMention.configure({
      suggestionChar: mentionChar,
      getItems: getMentionItems,
    }),
    EditorPlaceholder,
    UndoRedo,
  ]
  if (format === 'markdown') extensions.push(Markdown)
  return extensions
}

/**
 * Merge consumer extensions after the built-ins, keyed by name: a consumer
 * extension with the same name replaces the built-in instead of colliding with
 * it (TipTap only warns on duplicates, and the schema keeps one).
 */
function mergeExtensions(
  base: Extensions,
  extra: Extensions | undefined,
): Extensions {
  if (!extra || extra.length === 0) return base
  const overridden = new Set(extra.map((extension) => extension.name))
  return [
    ...base.filter((extension) => !overridden.has(extension.name)),
    ...extra,
  ]
}

/** Read the document in the shape `format` selects. */
function readValue(editor: TiptapEditor, format: EditorFormat): EditorValue {
  if (format === 'json') return editor.getJSON()
  if (format === 'markdown') return editor.getMarkdown()
  return editor.getHTML()
}

/**
 * Whether two values describe the same document. Strings compare by value; JSON
 * compares by serialized form (the only cheap deep equality for a `JSONContent`,
 * and a false negative merely rewrites, never loops).
 */
function valuesEqual(
  a: EditorValue | undefined,
  b: EditorValue | undefined,
  format: EditorFormat,
): boolean {
  if (a === b) return true
  if (format !== 'json' || a === undefined || b === undefined) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Write an external value into the document without re-entering `onUpdate`. */
function writeValue(
  editor: TiptapEditor,
  value: EditorValue,
  format: EditorFormat,
): void {
  if (format === 'markdown') {
    editor.commands.setContent(value as string, {
      emitUpdate: false,
      contentType: 'markdown',
    })
    return
  }
  editor.commands.setContent(value as Content, { emitUpdate: false })
}

export interface EditorProps {
  /**
   * Controlled document. The shape follows `format`. Pair with
   * `onValueChange` (P2).
   */
  value?: EditorValue
  /** Uncontrolled initial document. Ignored once `value` is provided. */
  defaultValue?: EditorValue
  /** Called on every document change, controlled or not. */
  onValueChange?: (value: EditorValue) => void
  /**
   * The content shape `value`/`onValueChange` speak. Read once, at mount.
   * @default 'html'
   */
  format?: EditorFormat
  /**
   * Consumer extensions, merged after the built-in set by name (a same-named
   * extension replaces the built-in).
   */
  extensions?: Extensions
  /**
   * Prefix rendered before a mention label. Read once, at mount.
   * @default '@'
   */
  mentionChar?: string
  /**
   * Candidates for the mention trigger popup. Providing this turns on the
   * `mentionChar` suggestion menu (read once, at mount; the list itself stays
   * reactive). Omit it for a suggestion-less mention node.
   */
  mentionItems?: MentionItem[]
  /** Placeholder shown while the document is empty. Reactive. */
  placeholder?: string
  /** Render read-only. Reactive. */
  readonly?: boolean
  /** Accessible name for the editable surface. */
  'aria-label'?: string
  /** Root class fallthrough, merged last (P10). */
  class?: string
  /** Chrome rendered above the editable surface, e.g. `<EditorToolbar />`. */
  children?: JSX.Element
}

/**
 * A TipTap (ProseMirror) rich-text editor as a Solid component.
 *
 * The editor is created in `onMount` and destroyed in `onCleanup`, so no node or
 * listener outlives the component and prop changes never rebuild it.
 * `value`/`defaultValue` + `onValueChange` follow the library's two-way contract
 * (P2): controlled when `value` is provided, uncontrolled otherwise. `format`
 * selects the content shape (HTML, JSON or markdown); `extensions` and
 * `mentionChar` shape the schema. The live instance is published through context
 * for `<EditorToolbar />`.
 */
export function Editor(props: EditorProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'format',
    'extensions',
    'mentionChar',
    'mentionItems',
    'placeholder',
    'readonly',
    'aria-label',
    'class',
    'children',
  ])

  // Mount-time: the editor is built once, so `format` never changes under it.
  // `untrack` is the explicit statement of that — a `format` change is ignored.
  const format = untrack(() => local.format ?? 'html')
  // The popup's presence is a mount-time decision too (it adds a plugin); the
  // candidate list behind it stays live through `latest.mentionItems`.
  const hasMentionItems = untrack(() => local.mentionItems !== undefined)

  let container: HTMLDivElement | undefined
  const [editor, setEditor] = createSignal<TiptapEditor | null>(null)
  const [internal, setInternal] = createSignal<EditorValue>(
    local.defaultValue ?? '',
  )

  const isControlled = () => local.value !== undefined
  const currentValue = (): EditorValue =>
    isControlled() ? (local.value ?? '') : internal()

  // Guards the value effect against the editor's own update handler: an external
  // write must not be echoed straight back out as `onValueChange`.
  let applyingExternal = false

  // A plain snapshot the editor's handler reads. Keeping the reactive reads out
  // of the handler means the editor is built once, not re-created on every prop
  // change, and the handler always sees the latest callback.
  const latest = {
    controlled: false,
    onValueChange: undefined as ((value: EditorValue) => void) | undefined,
    mentionItems: undefined as MentionItem[] | undefined,
  }
  createEffect(() => {
    latest.controlled = isControlled()
    latest.onValueChange = local.onValueChange
    latest.mentionItems = local.mentionItems
  })

  // The suggestion plugin calls this on every keystroke, so it reads the live
  // snapshot rather than the value captured when the editor was built.
  const getMentionItems = hasMentionItems
    ? () => latest.mentionItems ?? []
    : null

  onMount(() => {
    // The ref runs before `onMount`, so the surface is always present here; the
    // guard is for the type, not a real branch.
    if (!container) return

    const options: Partial<EditorOptions> = {
      element: container,
      content: currentValue() as Content,
      editable: local.readonly !== true,
      extensions: mergeExtensions(
        builtInExtensions(format, local.mentionChar ?? '@', getMentionItems),
        local.extensions,
      ),
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': local['aria-label'] ?? 'Rich text editor',
          'data-slot': 'editor-content',
        },
      },
      onUpdate: ({ editor: instance }) => {
        if (applyingExternal) return
        const next = readValue(instance, format)
        if (!latest.controlled) setInternal(next)
        latest.onValueChange?.(next)
      },
    }

    // `contentType` is declared by `@tiptap/markdown` and tells the Markdown
    // extension to parse the initial `content` as markdown, not HTML.
    if (format === 'markdown') options.contentType = 'markdown'

    const instance = new TiptapEditor(options)
    setEditor(instance)

    onCleanup(() => {
      instance.destroy()
      setEditor(null)
    })
  })

  // Write an external `value` into the document. A no-op when the document
  // already holds it, which is what breaks the controlled loop. `emitUpdate:
  // false` keeps the write from re-entering `onValueChange`.
  createEffect(() => {
    const instance = editor()
    if (!instance) return
    const next = currentValue()
    if (valuesEqual(readValue(instance, format), next, format)) return

    applyingExternal = true
    try {
      writeValue(instance, next, format)
    } finally {
      applyingExternal = false
    }
  })

  createEffect(() => {
    const instance = editor()
    if (!instance) return
    // `emitUpdate: false` matters: `setEditable` emits an update by default,
    // which would surface a bogus `onValueChange` on mount and on every
    // `readonly` toggle. Read-only is not a document change.
    instance.setEditable(local.readonly !== true, false)
  })

  createEffect(() => {
    setPlaceholder(editor(), normalizeContent(local.placeholder))
  })

  createEffect(() => {
    const instance = editor()
    if (!instance) return
    instance.view.dom.setAttribute(
      'aria-label',
      local['aria-label'] ?? 'Rich text editor',
    )
  })

  return (
    <EditorContext.Provider value={editor}>
      <div {...rest} class={local.class} data-slot="editor">
        {local.children}
        <div
          ref={(el) => {
            container = el
          }}
          data-slot="editor-surface"
        />
      </div>
    </EditorContext.Provider>
  )
}
