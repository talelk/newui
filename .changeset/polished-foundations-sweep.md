---
'@talelk/newui-atoms': minor
'@talelk/newui-molecules': minor
'@talelk/newui-organisms': minor
'@talelk/newui-tokens': patch
'@talelk/newui-tailwind': patch
'@talelk/newui-icons': patch
'@talelk/newui-templates': patch
'@talelk/newui-charts': patch
'@talelk/newui-code-editor': patch
'@talelk/newui-editor': patch
---

Design-system polish sweep: exhaustive, tokenized foundations (motion, radius roles, density, z-layer scale, dark elevation) now consumed consistently across atoms, molecules, organisms, templates, charts and editors via shared `control-styles` recipes instead of per-component one-offs. New props in existing vocabulary: `NumberInput`/`PinInput` gain `size`/`variant`, `Dropdown` gains `disabled`, `IconButton` gains `loading`. `Button` loading no longer sets the native `disabled` attribute. Renames/removals: the `data-color` hook becomes `data-theme`, and `KanbanTone` drops the unused `violet` value. The playground and starter screens adopt the same foundations.
