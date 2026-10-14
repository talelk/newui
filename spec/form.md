# Form trio — `FormControl`, `FormLabel`, `ErrorMessage`

frappe-ui's public form primitives. `FormControl` is a `type` dispatcher; every
type shares the `label` / `description` / `error` / `required` contract (P5)
where the resolved control supports it. `FormLabel` and `ErrorMessage` are the
standalone halves of that contract, for wiring a control the library does not
own.

## `FormControl`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `type` | `FormControlType` | `text` | dispatches the control |
| `label` | `JSX.Element` | — | drawn by the resolved control |
| `description` | `JSX.Element` | — | text-like + `textarea` only |
| `error` | `JSX.Element \| false` | — | text-like + `textarea` only |
| `required` | `boolean` | `false` | text-like + `textarea` only |
| `id` | `string` | auto | text-like + `textarea` only |
| `disabled` / `name` / `class` | — | — | merged into the resolved control |
| `aria-label` | `string` | — | when no visible `label` |

### Types routed today

| `type` | renders |
| --- | --- |
| `text` _(default)_, `email`, `password`, `number`, `search`, `tel`, `url`, `time`, `datetime-local`, `month`, `week`, `file`, `range` | `TextInput` with the matching HTML `type` |
| `textarea` | `Textarea` |
| `select` | `Select` |
| `combobox` | `Combobox` |
| `multiselect` | `MultiSelect` |
| `checkbox` | `Checkbox` |
| `date` | `DatePicker` |

Name a field's exact surface by using its component directly. `FormControl` is
for the uniform case (a rendered list of field definitions); type-specific
props and the value shape follow the resolved control:

- text-like / `textarea` — `value`, `onInput` (+ `onChange`, `rows`, `prefix`,
  `suffix`, `size`, `variant` where the control has them);
- `select` — `options`, `value: string[]`, `onValueChange`;
- `combobox` — `options`, `value: string | null`, `onValueChange`;
- `multiselect` — `options`, `value: string[]`, `onValueChange`;
- `date` — `value: string | null`, `onValueChange`, `min`/`max`;
- `checkbox` — `checked`, `defaultChecked`, `onCheckedChange`.

`type="date"` renders `DatePicker`. `TimePicker` is not built yet, so
`type="time"` / `type="datetime-local"` are the browser's native inputs (via
`TextInput`). For a native date input, use `<TextInput type="date" />`.

`type="password"` is a plain masked `TextInput`; the reveal toggle is the
`Password` component.

Only the text and `textarea` types expose `description` / `error` /
`required` and an `id`. `select` and `checkbox` have their own narrower
surfaces — `select` draws its own label (`label`, `options`, `value`,
`onValueChange`), `checkbox` draws its own label and description plus its
checked state — so a prop the resolved control does not support is a type
error, not a silent drop.

## `FormLabel`

| prop | type | notes |
| --- | --- | --- |
| `label` | `JSX.Element` | required |
| `id` | `string` | the control's id → `for` |
| `labelId` | `string` | the label's own id → `aria-labelledby` |
| `required` | `boolean` | asterisk + `sr-only (required)` |
| `disabled` | `boolean` | dims to `ink-gray-4` |

Fixed 13px `text-sm leading-tighter`, `ink-gray-6` — it does not follow a
control's `size`. `data-slot="label"`.

## `ErrorMessage`

| prop | type | notes |
| --- | --- | --- |
| `message` | `ErrorMessageValue` | `string \| string[] \| Error` (with `messages`) |
| `id` | `string` | for `aria-describedby` / `aria-errormessage` |
| `class` | `string` | merged last |

Renders nothing when there is no error (empty string, empty array, or an
`Error` with neither `message` nor `messages`), so it doubles as the "no error"
test. Lines stack (`whitespace-pre-line`), `role="alert"`,
`data-slot="error"`.

Unlike frappe-ui's `ErrorMessage`, the message renders as **text**, not
sanitised HTML (P10 — no `innerHTML`): an `<b>` in a server message shows
literally.
