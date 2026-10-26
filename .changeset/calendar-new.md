---
"@talelk/newui-molecules": minor
---

New `Calendar` molecule: the pickers' date grid exported as a standalone,
always-open component — the booking-panel and filter-rail surface that needs a
date but no input. Values are `YYYY-MM-DD` strings (ADR-0008), `min`/`max`
bound the selectable window, `dualPane` shows two months, and the Zag machine
keeps the grid's full keyboard model.
