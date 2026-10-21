---
"@newui/atoms": minor
"@newui/molecules": minor
"@newui/code-editor": patch
"@newui/editor": minor
---

Support BottomSheet drag dismissal with scroll handling, cancellation,
non-dismissible sheets and reduced motion. Load CodeEditor grammars on demand
while preserving edits and ignoring stale language requests after changes or
unmounting.

Expose paragraph, link editing and undo/redo in EditorToolbar. Disable formatting
for readonly editors and history actions when their operation is unavailable.
