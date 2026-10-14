# @newui/editor

A [TipTap](https://tiptap.dev/) (ProseMirror) rich-text editor as a Solid
component, themed with the newui semantic tokens so it follows the light/dark
`colorScheme` axis with no reconfiguration.

## Binding decision (spike)

TipTap has no official Solid binding; the Vue binding (`@tiptap/vue-3`) is what
`frappe-ui-main/src/molecules/editor` uses. Before writing this package the two
community Solid bindings were checked against the requirement "TipTap 3 + Solid
1.9":

| Candidate | TipTap 3? | Solid 1.9? | Installs | Verdict |
| --- | --- | --- | --- | --- |
| [`@vrite/tiptap-solid`](https://www.npmjs.com/package/@vrite/tiptap-solid) `1.0.4` | **No** — peers pin `@tiptap/core`/`@tiptap/pm` to exactly `2.5.9` | `^1.8.20` | n/a | **Rejected.** TipTap 2 only, and unpublished since Aug 2024. |
| [`solid-tiptap`](https://www.npmjs.com/package/solid-tiptap) `0.8.0` | Yes — peers `@tiptap/core ^3`, `@tiptap/pm ^3` | `^1.7` | Yes (verified against `@tiptap/*@3.31` + `solid-js@1.9`) | **Viable but not adopted.** |

`solid-tiptap` is a sound, maintained binding, but it is a poor fit for a
component library:

- Its `useEditor` constructs the editor **inside a `createEffect` that tracks the
  whole options object** (`createEffect(() => new Editor({ ...props() }))`). Any
  reactive prop read there — `content`, `extensions`, an accessor — destroys and
  rebuilds the editor on change, discarding the document, selection and undo
  history. A controlled `value` would do exactly that on every keystroke.
- It offers no controlled-value contract; only `createEditorTransaction` readers.
  The `value` + `onValueChange` two-way contract (P2) would still have to be
  written on top.

So this package implements a **thin wrapper over `@tiptap/core` directly**,
mirroring `@newui/code-editor`'s CodeMirror wrapper. That buys: no third-party
binding dependency, the library's own `value`/`onValueChange` semantics, a stable
lifecycle (`onMount` create / `onCleanup` destroy — prop changes never rebuild the
editor), and narrow external writes that do not re-enter `onValueChange`.

The toolbar's pressed states are bridged from TipTap's `transaction` event into a
Solid signal — the one genuinely useful idea from `solid-tiptap`, reimplemented
in ~10 lines instead of taken as a dependency.

## Install

```sh
pnpm add @newui/editor solid-js
```

## Usage

```tsx
import { Editor, EditorToolbar } from '@newui/editor'
import { createSignal } from 'solid-js'

function Note() {
  const [html, setHtml] = createSignal('<p>Hello</p>')

  return (
    <Editor
      value={html()}
      onValueChange={setHtml}
      placeholder="Write something…"
      aria-label="Note"
    >
      <EditorToolbar />
    </Editor>
  )
}
```

Uncontrolled works too, with `defaultValue` in place of `value`:

```tsx
<Editor defaultValue="<p>Hello</p>" readonly />
```

`format` selects the shape `value`/`onValueChange` speak. JSON uses TipTap's
`JSONContent`; markdown needs no extra import (the Markdown extension is added
for you):

```tsx
const [doc, setDoc] = createSignal<JSONContent>({ type: 'doc', content: [] })

<Editor format="json" value={doc()} onValueChange={setDoc} />
<Editor format="markdown" value={'**bold**'} onValueChange={setMarkdown} />
```

`EditorToolbar` reads the editor from `<Editor>` context, so it only needs to be
rendered as a child. It also accepts an explicit `editor` prop for a standalone
toolbar.

## Props

`Editor`:

| Prop            | Type                              | Default  |
| --------------- | --------------------------------- | -------- |
| `value`         | `string \| JSONContent`           | —        |
| `defaultValue`  | `string \| JSONContent`           | `''`     |
| `onValueChange` | `(value: string \| JSONContent) => void` | —  |
| `format`        | `'html' \| 'json' \| 'markdown'`  | `'html'` |
| `extensions`    | `Extensions`                      | —        |
| `mentionChar`   | `string`                          | `'@'`    |
| `mentionItems`  | `MentionItem[]`                   | —        |
| `placeholder`   | `string`                          | —        |
| `readonly`      | `boolean`                         | `false`  |
| `aria-label`    | `string`                          | `'Rich text editor'` |
| `class`         | `string`                          | —        |
| `children`      | `JSX.Element`                     | —        |

`EditorToolbar`:

| Prop         | Type            | Default        |
| ------------ | --------------- | -------------- |
| `editor`     | `Editor \| null` | `<Editor>` context |
| `aria-label` | `string`        | `'Formatting'` |
| `class`      | `string`        | —              |

`value` + `onValueChange` is the two-way contract (P2); the editor is
uncontrolled when `value` is omitted. The editor is created in `onMount` and
destroyed in `onCleanup`, so nothing outlives the component. `format`,
`mentionChar` and whether a mention popup exists are read once, at mount — the
editor is never rebuilt under a running document. `mentionItems` itself is read
on every query, so the candidate list may change without rebuilding the editor.

## Exports

- `Editor`, `type EditorProps`
- `type EditorFormat` — `'html' | 'json' | 'markdown'`
- `type EditorValue` — `string | JSONContent`
- `type MentionItem` — `{ id: string; label: string }`, a mention candidate
- `EditorToolbar`, `type EditorToolbarProps`
- `normalizeContent(value)` — coerce an optional value to the string TipTap
  parses (`null`/`undefined` → `''`).
- `setPlaceholder(editor, text)` — write placeholder text onto a live editor and
  refresh its decoration. No-op when unchanged, destroyed, or when the Placeholder
  extension is not loaded.

## Extensions

The editor ships a lean, fixed core — the document basics plus what the toolbar
drives — extended with the three richer nodes this package adds. All from TipTap 3:

`Document`, `Paragraph`, `Text`, `Bold`, `Italic`,
`Heading` (levels 1–3), `BulletList`, `OrderedList`, `ListItem`, `ListKeymap`,
`Link` (`openOnClick: false`, `autolink: true`),
`Table` (`resizable: true`), `TableRow`, `TableCell`, `TableHeader`,
`Image` (`resize: { enabled: true }`), `Mention`, `Placeholder`, `UndoRedo`.

Tables and images are resizable out of the box, using TipTap's own features —
no extra dependency. Table column resizing is stock `@tiptap/extension-table`
behaviour; it is installed at editor creation, so it applies to an editor that
starts editable (toggling `readonly` off later does not retrofit the handles).
Image resizing uses `@tiptap/extension-image`'s built-in `ResizableNodeView`,
which renders the drag handles and stores `width`/`height` on the node.

`Markdown` is added only for `format: 'markdown'`, so the `marked` payload stays
out of the HTML and JSON paths.

`Placeholder` and `UndoRedo` live in `@tiptap/extensions` in TipTap 3;
`@tiptap/extension-placeholder` is only a re-export of the former, so this package
depends on `@tiptap/extensions` directly.

### Custom extensions

`extensions` merges after the built-in set, keyed by name: a consumer extension
whose name matches a built-in replaces it rather than colliding (TipTap would
otherwise only warn and keep both in the schema). Pass any TipTap extension the
built-ins don't cover:

```tsx
import { Editor } from '@newui/editor'
import { Highlight } from '@tiptap/extension-highlight'

<Editor extensions={[Highlight]} />
```

### Mentions

Pass `mentionItems` to turn on the `mentionChar` (default `'@'`) trigger popup.
Typing the char opens a portalled listbox of candidates filtered by the typed
query; `↑`/`↓` move the active option (wrapping), `Enter`/`Tab` insert it, and
`Escape` dismisses. The list is a real `role="listbox"`/`role="option"` widget
driven by `aria-activedescendant` on the editor surface, so focus never leaves
the document.

```tsx
const people = [
  { id: 'u1', label: 'Ann' },
  { id: 'u2', label: 'Bob' },
]

<Editor mentionItems={people} />
```

The candidate list is read on each query, so it may change (e.g. after a fetch)
without rebuilding the editor; the popup picks the new list up on the next
keystroke.

Without `mentionItems`, the `Mention` node still ships — but suggestion-less:
overriding its `addProseMirrorPlugins` drops TipTap's `Suggestion` plugin, so
there is no trigger menu and mentions are inserted programmatically:

```ts
editor.commands.insertContent({ type: 'mention', attrs: { id, label } })
```

`mentionChar` is the rendered prefix and the default
`data-mention-suggestion-char` attribute. The popup is positioned through
`@tiptap/suggestion`'s own `mount` helper (Floating UI, already a peer of the
suggestion package), so no positioning dependency was added.

## Styling

The toolbar is styled with the runtime custom properties (`--surface-*`,
`--ink-*`, `--outline-*`) and `data-active` hooks. Override the properties on the
editor or any ancestor to retune it; no component change is needed and dark mode
flips automatically.

## Notes / deferred

- External writes go through `editor.commands.setContent(..., { emitUpdate:
  false })`, which replaces the whole document. Unlike the code editor's narrow
  `diffDocument`, this can move the caret when the parent transforms the value;
  an identical value is skipped (strings by value, JSON by serialized form), so
  the controlled loop is safe.
- The toolbar's insert-table action is fixed at a 3×3 table with a header row,
  and insert-image asks for a URL via `window.prompt`. A table-size picker or a
  file/upload picker needs a richer toolbar — compose one against the editor's
  commands (`insertTable`, `setImage`), which are all available.
- `mentionChar` and whether a mention popup exists are read at mount; the popup's
  `mentionItems` are read per query.
- Image resizing has no keyboard affordance: TipTap's handles are pointer-only,
  and a keyboard-resizable image is out of scope for this lean package. The
  underlying `width`/`height` attributes can still be set programmatically.
