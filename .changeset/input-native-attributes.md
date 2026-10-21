---
"@newui/atoms": minor
---

`TextInput` and `Textarea` extend the native element's attribute set
(`autocomplete`, `inputmode`, `maxlength`, `pattern`, `min`/`max`, event
handlers, …) so HTML behavior no longer needs a dedicated prop. Component axes
(`size`, `variant`) and the `prefix`/`suffix` adornments are unchanged;
`prefix` keeps its P6 adornment meaning and shadows the HTML attribute.
