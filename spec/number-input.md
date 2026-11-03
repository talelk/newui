# NumberInput

A Zag numeric spinbutton. Values are strings; `onValueChange` reports both
`value` and `valueAsNumber`. `min`, `max` and `step` constrain native keyboard
and increment/decrement interaction. Use `value` to control it or `defaultValue`
for an initial value.

The control takes the shared input axes: `size` (`xs`–`lg`, default `sm`) and
`variant` (`subtle` | `outline` | `ghost`, default `outline`), resolving
through the one density table like every peer field — the default outlined
control is 28px high with the control radius role. Increment and
decrement controls sit beside the input and have full-height targets.
The border and focus ring use semantic tokens; invalid state remains visible.

The shared Field contract provides `label`, `description`, `error`, `required`,
`id` and their ARIA relationships. Without a visible label, provide `aria-label`.
`name` participates in forms. `disabled` prevents editing and stepping.

Hooks: `data-slot="number-input"`, `number-input-control`, and `data-invalid`,
`data-size` and `data-variant` on the control. Customisation uses the root
class and data attributes.
