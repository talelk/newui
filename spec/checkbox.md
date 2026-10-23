# Checkbox

A native boolean input with controlled/uncontrolled checked state and indeterminate presentation.

The shared `label`, `description`, `error`, `required`, `id` contract comes from
Field. Native inline labels and group labels are retained; Field generates the
supporting/error ids and shared required marker. Description and error are both
linked to the accessible control. Invalid state has semantic visual treatment
where a control boundary exists. The existing root class and data attributes are
the styling hooks; there are no part class or style-injection props.

Explicit compact glyph sizes are retained. Labelled rows remain clickable and
keyboard interaction stays native/Zag-owned. The checked/indeterminate glyph is
a semantic icon over the fill (`text-ink-base`), not the forms-plugin's fixed
white background image, so it stays legible in both themes and disabled states.
