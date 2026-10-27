---
"@talelk/newui-molecules": patch
---

Toast: the close button works, stacked toasts lift instead of overlapping, and in-place updates (promise loading → success) re-render in the same node. Root causes: the region keyed items by record reference (the store re-syncs fresh objects constantly, remounting each item's machine mid-click), placement depended on group heights without a tracked read, and the placement transform consuming Zag's `--y`/`--x` variables was never written.
