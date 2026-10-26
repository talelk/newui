---
"@talelk/newui-molecules": minor
---

New `TimeRangePicker` molecule: two `TimePicker`s under one field label,
reporting a single `[from, to]` value (or `[]` while empty). Picking the start
holds a half-open range like the `DateRangePicker`'s draft, and a range that
ends before it starts — a night shift — is reported as-is rather than
reordered.
