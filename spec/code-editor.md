# CodeEditor

CodeMirror 6 for Solid. Install `@newui/code-editor` with its declared peers.
`/organisms/code-editor` provides executable controlled usage and copyable source;
`/docs#code-editor` loads the package guide.

## State and lifecycle

Use value/onValueChange for a controlled document or defaultValue for an initial
uncontrolled document. External writes use diffDocument to replace only changed
text, preserve selection and avoid callback loops. The exported diffDocument
helper returns from/to/insert; it does not mutate an editor.

Language, readonly and placeholder reconfigure stable compartments. Grammars
load on demand; stale language requests and delayed unmount completions cannot
modify the current view. Grammar download failure leaves plain-text editing
available. onCleanup destroys the view and listeners.

## Keyboard, accessibility and layout

Supply aria-label (default Code editor). The surface exposes a multiline
textbox, keyboard editing, undo/redo, search, indentation and native selection.
readonly disables editing without hiding content. Line wrapping and semantic
colours follow container width and the live colour scheme. Check narrow layouts,
RTL and enlarged text when embedding it.
