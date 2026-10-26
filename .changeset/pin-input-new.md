---
"@talelk/newui-molecules": minor
---

New `PinInput` molecule: a fixed-length verification code on the Zag pin-input
machine. One focus walks every cell — typing advances, paste splits, arrows
and backspace move between cells. `length` sets the shape, `otp` advertises
`autocomplete="one-time-code"` autofill, `mask` turns the cells into password
boxes, and the shared labelling contract (`label`/`description`/`error`/
`required`) names every cell. `onValueComplete` fires when the code is whole.
