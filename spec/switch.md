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

## Shared Field contract

`description`, `error`, `required` and `id` share the same semantics as text
entry. The native inline label is retained. Field owns supporting/error ids,
`aria-describedby`/`aria-invalid`, and the required marker. An invalid track has a
semantic error boundary; focus and state transitions respect reduced motion.
