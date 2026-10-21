---
"@newui/molecules": major
"@newui/organisms": patch
---

`Select` single mode (the default) takes `value: string | null` and reports
`onValueChange` with a scalar, matching `Combobox`; `multiple` keeps the
`string[]` contract. `FormControl`'s `type="select"` follows the same split.
`FilterBar` selects pass scalars instead of wrapping values in arrays. See
`spec/migrations.md`.
