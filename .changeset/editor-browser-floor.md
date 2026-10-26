---
"@talelk/newui-editor": patch
---
"@talelk/newui-code-editor": patch
---

Both editor packages gain their browser-tier test floor per ADR-0015: typed
input reports documents through `onValueChange`, the editable box keeps its
metrics, and the code editor's `readonly` compartment rejects input. No
public surface changes.
