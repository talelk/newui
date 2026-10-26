# PinInput

A fixed-length code — verification digits, an OTP from a text message.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `length` | `number` | `6` | how many cells render |
| `value` | `string[]` | — | controlled value, one entry per cell |
| `defaultValue` | `string[]` | — | |
| `onValueChange` | `(details: { value: string[]; valueAsString: string }) => void` | — | |
| `onValueComplete` | `(details: { value: string[]; valueAsString: string }) => void` | — | fires when every cell holds a valid value |
| `type` | `'numeric' \| 'alphanumeric' \| 'alphabetic'` | `numeric` | what a cell accepts |
| `otp` | `boolean` | — | `autocomplete="one-time-code"` for SMS autofill |
| `mask` | `boolean` | — | password-style cells (they stop being role `textbox`) |
| `placeholder` | `string` | `○` | |
| `blurOnComplete` | `boolean` | — | |
| `disabled` / `readOnly` | `boolean` | — | |
| `name` | `string` | — | form submission name on the hidden input |
| `label` / `description` / `error` / `required` | shared labelling contract (P5) | — | names every cell |
| `id` / `'aria-label'` / `class` | | | |

## Behavior and accessibility

One focus walks the cells: typing advances, paste splits across the cells,
arrows and backspace move between them; a character outside `type` is
rejected. The shared labelling contract reaches every cell through
`aria-labelledby` — a multi-cell control cannot point one `label[for]` at a
single cell, so the accessible name comes from the field label, not the
per-cell `"pin code 1 of N"`. A field-level `error` sets `aria-invalid` +
`aria-errormessage` on every cell. Cells expose `data-complete`, `data-filled`
and `data-index` for styling hooks (P10).
