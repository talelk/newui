# Select

A Zag value selector over fixed `options`, with optional icon, description and
disabled state per option. `value` is an array of strings;
`onValueChange` reports the next array. The default is a single selection;
`multiple` permits more than one value. `name` is carried by a hidden native
select for form participation.

The shared Field contract provides `label`, `description`, `error`, `required`
and `id`. The visible combobox trigger receives the label, supporting/error ids
and invalid state. Without a visible label, provide `aria-label` or a descriptive
placeholder. Disabled selectors cannot open or change.

Defaults: `size="sm"` (28px), `variant="outline"`. The xs/sm/md/lg heights are
24/28/32/40px; variants are outline/subtle/ghost. Focus uses the blue semantic
ring, invalid borders use the semantic error boundary, and floating options use
an opaque elevated surface. Multiple content lines may grow beyond the minimum.

Zag supplies opening, keyboard navigation, selection and focus. The positioned
root contains the hidden form element, so it cannot escape a scrolling container
under RTL. Hooks include `select`, `select-control`, `select-trigger`,
`select-content`, `select-item`, state, size, variant and invalid attributes.
