# NumberInput

A Zag numeric spinbutton. Values are strings; `onValueChange` reports both
`value` and `valueAsNumber`. `min`, `max` and `step` constrain native keyboard
and increment/decrement interaction. Use `value` to control it or `defaultValue`
for an initial value.

The default outlined control is 28px high, with a 6px radius. Increment and
decrement controls sit beside the input and have full-height 28px targets.
The border and focus ring use semantic tokens; invalid state remains visible.

The shared Field contract provides `label`, `description`, `error`, `required`,
`id` and their ARIA relationships. Without a visible label, provide `aria-label`.
`name` participates in forms. `disabled` prevents editing and stepping.

Hooks: `data-slot="number-input"`, `number-input-control`, and `data-invalid`
on the control. Customisation uses the root class and data attributes.
