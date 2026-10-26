---
"@talelk/newui-molecules": minor
---

New `ColorPicker` molecule: the platform color picker under a styled swatch
with an optional hex field (`#rgb` and `#rrggbb`, normalized, invalid drafts
flagged without committing). Deliberately no custom hue surface — the native
control carries the keyboard and screen-reader behavior on every platform,
which a custom one would have to reimplement.
