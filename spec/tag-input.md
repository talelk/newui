# TagInput

A token editor: type and press Enter or comma to add a tag, Backspace on the
empty input removes the last one, and every tag carries its own remove button
(`aria-label="Remove <tag>"`). Committed on blur too, so a typed token
survives tabbing away.

Duplicates are rejected by default (`unique`); `max` caps the list. The list
is plain state — vocabulary or format validation belongs to the form around
it. The shared Field contract provides `label`, `description`, `error`,
`required` and `id`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string[]` | — | controlled tokens |
| `defaultValue` | `string[]` | `[]` | uncontrolled initial tokens |
| `onValueChange` | `(value: string[]) => void` | — | fires on add and remove |
| `unique` | `boolean` | `true` | rejects a token already in the list |
| `max` | `number` | — | caps the list |
| `size` | `xs \| sm \| md \| lg` | `sm` | matches the input scale |
| `variant` | `subtle \| outline \| ghost` | `outline` | |
| `label` / `description` / `error` / `required` | — | — | P5 contract |

## Behavior and accessibility

The input is a plain textbox labelled through Field; tokens are spans with
button removes, so screen readers announce the removal target by name.
`data-slot` hooks: `tag-input`, `tag-input-token`, `tag-input-remove`,
`tag-input-field`. Disabled blocks commits and removes.
