# Editor

TipTap 3 rich text for Solid. Install `@talelk/newui-editor` with its declared peers,
then import Editor and EditorToolbar. `/organisms/editor` provides executable
usage and source; `/docs#editor` loads the package guide.

## Composition and state

Editor owns a stable TipTap instance. Put EditorToolbar inside Editor to use the
nearest context; an explicit editor instance overrides that context. `value` and
`onValueChange` control the document; `defaultValue` is the uncontrolled initial
value. External writes preserve selection and must not echo onValueChange.

`format` is html by default, or json/markdown. It is read at mount. Extensions
and mentionChar are mount-time configuration. mentionItems is reactive after
mention suggestions have been enabled at mount. placeholder and readonly are
reactive. normalizeContent and setPlaceholder are public helpers documented in
the package guide. The generated inventory also includes their exported types.

## Toolbar, keyboard and accessibility

Use a labelled editing surface. Toolbar buttons expose their pressed state and
have accessible names. The toolbar provides Paragraph, Heading 1–3, Bold,
Italic, Bullet list, Ordered list, Link, Image, Table, Undo and Redo. Undo/Redo
are disabled when history has no corresponding action. All tools are disabled
while readonly. Link asks for a URL, defaults to the selected link's address,
and removes the link when submitted empty. Mention
suggestions support keyboard selection. Native prompts used for link/image URLs
can be canceled without changing the document. Do not silently publish content.

The editor disposes its instance and listeners on unmount. Width follows its
container; tools wrap at narrow widths and 200% text. Applications own sticky
header and toolbar placement. Colours follow semantic tokens in both schemes.
