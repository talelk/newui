# Password

`Password` — a masked text field with a reveal toggle. It is a `TextInput`
with an interactive suffix, so the shared labelling contract (P5) applies
unchanged.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | — | controlled |
| `defaultValue` | `string` | — | uncontrolled initial value |
| `onValueChange` | `(value: string) => void` | — | fires controlled or not |
| `size` | `xs \| sm \| md \| lg` | `sm` | |
| `variant` | `subtle \| outline \| ghost` | `subtle` | |
| `label` | `JSX.Element` | — | rendered by `Field` (P5) |
| `description` | `JSX.Element` | — | `aria-describedby` |
| `error` | `JSX.Element \| false` | — | non-empty ⇒ invalid |
| `required` | `boolean` | `false` | |
| `placeholder` | `string` | — | |
| `disabled` | `boolean` | `false` | disables the toggle too |
| `class` | `string` | — | merged into the field root |

Controlled vs uncontrolled follows `createControllableSignal`: pass `value` to
control, `defaultValue` otherwise; `onValueChange` fires either way.

## Behavior

- Renders `<input type="password">`; the reveal toggle flips it to `type="text"`
  and back.
- The toggle is a `button` with `pointer-events-auto` — it sits in the
  `pointer-events-none` suffix socket `TextInput` provides for adornments, so it
  opts back into hit-testing.
- `Mod+I` / `Ctrl+I` toggles from the input, matching frappe-ui.
- The toggle carries `aria-label` ("Show password" / "Hide password"),
  `aria-pressed` and `aria-keyshortcuts="Control+I Meta+I"`.
- A server-masked value (one containing `*`) hides the toggle entirely.

## Styling hooks

The toggle is `data-slot`-less; state is read from `aria-pressed` (the eye
swaps between `lucide-eye` and `lucide-eye-off`) and `:disabled`.
