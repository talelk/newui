# Switch

`Switch` — a Zag-backed boolean control.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | controlled |
| `defaultChecked` | `boolean` | `false` | uncontrolled |
| `onCheckedChange` | `(checked: boolean) => void` | — | |
| `disabled` | `boolean` | `false` | |
| `label` | `JSX.Element` | — | rendered by Zag's label part |
| `name` | `string` | — | form field name |
| `class` | `string` | — | merged into the root |

## Structure

Zag owns five parts. The visible track (`data-part="control"`) is
`aria-hidden`; the accessible control is a visually-hidden checkbox input
carrying `role="switch"` and `aria-checked`, labelled by the label part.

## State

Controlled vs uncontrolled is Zag's own contract: pass `checked` to control,
`defaultChecked` otherwise. The component does not hold its own signal, so both
modes behave exactly as Zag specifies.

## Styling hooks

`data-part` (`root`/`control`/`thumb`/`label`), `data-state`
(`checked`/`unchecked`), `data-disabled`, `data-focus-visible`.
