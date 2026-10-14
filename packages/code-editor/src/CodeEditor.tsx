import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { python } from '@codemirror/lang-python'
import { sql } from '@codemirror/lang-sql'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  placeholder as cmPlaceholder,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'

/** The languages the editor ships a grammar for. Anything else is plain text. */
export type CodeEditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'python'
  | 'sql'
  | 'markdown'

export interface CodeEditorProps {
  /** Controlled document text. Pair with `onValueChange` (P2). */
  value?: string
  /** Uncontrolled initial text. Ignored once `value` is provided. */
  defaultValue?: string
  /** Called on every document change, controlled or not. */
  onValueChange?: (value: string) => void
  /** Syntax grammar to load. Defaults to plain text. */
  language?: CodeEditorLanguage
  /** Render read-only. Reactive. */
  readonly?: boolean
  /** Placeholder shown while the document is empty. */
  placeholder?: string
  /** Accessible name for the editable surface. */
  'aria-label'?: string
  /** Root class fallthrough, merged last (P10). */
  class?: string
}

/**
 * The single change that turns `current` into `next`: skip the longest common
 * prefix, then the longest common suffix, and replace only what is left.
 *
 * Replacing the whole document instead would reset the caret, collapse the
 * selection and jump the scroll position. CodeMirror maps the live selection
 * through a narrow change, so an external write that does not touch the caret
 * leaves it where it was.
 *
 * Exported so the contract can be pinned by a test.
 */
export function diffDocument(
  current: string,
  next: string,
): { from: number; to: number; insert: string } {
  let from = 0
  const max = Math.min(current.length, next.length)
  while (from < max && current[from] === next[from]) from++

  // The suffix scan stops at `from` on both sides, so the prefix and the suffix
  // can never overlap and produce a backwards range.
  let currentEnd = current.length
  let nextEnd = next.length
  while (
    currentEnd > from &&
    nextEnd > from &&
    current[currentEnd - 1] === next[nextEnd - 1]
  ) {
    currentEnd--
    nextEnd--
  }

  return { from, to: currentEnd, insert: next.slice(from, nextEnd) }
}

function languageExtension(language?: CodeEditorLanguage): Extension {
  switch (language) {
    case 'javascript':
      return javascript()
    case 'typescript':
      return javascript({ typescript: true })
    case 'json':
      return json()
    case 'html':
      return html()
    case 'css':
      return css()
    case 'python':
      return python()
    case 'sql':
      return sql()
    case 'markdown':
      return markdown()
    default:
      return []
  }
}

// One CodeMirror theme, written against the runtime custom properties so dark
// mode flips with no JS and no second theme to swap (semantic tokens only).
const codeTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--surface-base)',
    color: 'var(--ink-gray-8)',
    border: '1px solid var(--outline-gray-3)',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    overflow: 'hidden',
  },
  '&.cm-focused': {
    outline: '2px solid var(--outline-gray-4)',
    outlineOffset: '-1px',
  },
  '.cm-content': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    padding: '0.5rem 0',
    caretColor: 'var(--ink-gray-8)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--surface-gray-1)',
    color: 'var(--ink-gray-5)',
    border: 'none',
  },
  '.cm-activeLine': { backgroundColor: 'var(--surface-gray-1)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--surface-gray-2)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ink-gray-8)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
    {
      backgroundColor: 'var(--surface-gray-3)',
    },
})

/**
 * A CodeMirror 6 editor as a Solid component.
 *
 * The view is created in `onMount` and destroyed in `onCleanup`, so no node or
 * listener outlives the component. `value`/`defaultValue` + `onValueChange`
 * follow the library's two-way contract (P2): controlled when `value` is
 * provided, uncontrolled otherwise.
 */
export function CodeEditor(props: CodeEditorProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'language',
    'readonly',
    'placeholder',
    'aria-label',
    'class',
  ])

  let container: HTMLDivElement | undefined
  const [view, setView] = createSignal<EditorView | null>(null)
  const [internal, setInternal] = createSignal(local.defaultValue ?? '')

  // Compartments are stable keys; reconfiguring one keeps the doc, selection
  // and history while swapping a single facet.
  const languageCompartment = new Compartment()
  const readonlyCompartment = new Compartment()
  const placeholderCompartment = new Compartment()

  const isControlled = () => local.value !== undefined
  const currentValue = () => (isControlled() ? (local.value ?? '') : internal())

  const readonlyExtension = (): Extension => [
    EditorState.readOnly.of(local.readonly === true),
    EditorView.editable.of(local.readonly !== true),
  ]

  // Guards the value effect against the view's own update listener: an external
  // write must not be echoed straight back out as `onValueChange`.
  let applyingExternal = false

  // A plain snapshot the view's listener reads. Keeping the reactive reads out
  // of the listener means the extension is built once, not re-created on every
  // prop change, and the listener always sees the latest handler.
  const latest = {
    controlled: false,
    onValueChange: undefined as ((value: string) => void) | undefined,
  }
  createEffect(() => {
    latest.controlled = isControlled()
    latest.onValueChange = local.onValueChange
  })

  const updateListener = EditorView.updateListener.of((update) => {
    if (!update.docChanged || applyingExternal) return
    const next = update.state.doc.toString()
    if (!latest.controlled) setInternal(next)
    latest.onValueChange?.(next)
  })

  onMount(() => {
    const editor = new EditorView({
      doc: currentValue(),
      parent: container,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        indentUnit.of('  '),
        foldGutter(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
        ]),
        EditorView.lineWrapping,
        languageCompartment.of(languageExtension(local.language)),
        readonlyCompartment.of(readonlyExtension()),
        placeholderCompartment.of(cmPlaceholder(local.placeholder ?? '')),
        EditorView.contentAttributes.of({
          'aria-label': local['aria-label'] ?? 'Code editor',
          'aria-multiline': 'true',
          role: 'textbox',
        }),
        codeTheme,
        updateListener,
      ],
    })
    setView(editor)

    onCleanup(() => {
      editor.destroy()
      setView(null)
    })
  })

  // Write an external `value` into the document as a narrow change. A no-op when
  // the document already holds it, which is what breaks the controlled loop.
  createEffect(() => {
    const editor = view()
    if (!editor) return
    const next = currentValue()
    const current = editor.state.doc.toString()
    if (next === current) return

    applyingExternal = true
    try {
      editor.dispatch({ changes: diffDocument(current, next) })
    } finally {
      applyingExternal = false
    }
  })

  createEffect(() => {
    const editor = view()
    if (!editor) return
    editor.dispatch({
      effects: languageCompartment.reconfigure(
        languageExtension(local.language),
      ),
    })
  })

  createEffect(() => {
    const editor = view()
    if (!editor) return
    editor.dispatch({
      effects: readonlyCompartment.reconfigure(readonlyExtension()),
    })
  })

  createEffect(() => {
    const editor = view()
    if (!editor) return
    editor.dispatch({
      effects: placeholderCompartment.reconfigure(
        cmPlaceholder(local.placeholder ?? ''),
      ),
    })
  })

  return (
    <div
      {...rest}
      ref={(el) => {
        container = el
      }}
      class={local.class}
      data-slot="code-editor"
    />
  )
}
