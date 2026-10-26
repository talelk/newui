---
"@talelk/newui-organisms": minor
---

`DataTable` grows the two powers a business table keeps reaching for. **Column
pinning**: freeze one column to each edge of the horizontal scroll
(`pinnedStart` — the identifier that must stay visible; `pinnedEnd` —
typically the actions) with sticky, opaque, row-tinted cells; pinning state is
app-owned via `onPinnedColumnsChange`. **Inline editing**: with `editable` and
`onCellChange`, columns marked `meta.editable` render click-to-edit cells —
Enter or blur commits the raw field through the app, Escape cancels, and the
cell shows the app-owned value from the next `rows`.
