# Text

Body copy. `Text` resolves the paragraph scale (`text-p-*` and its weight
composites) with the kit's default reading color (`text-ink-gray-8`), so prose
starts consistent and diverges deliberately — a muted caption is
`<Text size="xs" class="text-ink-gray-6">`, not a one-off utility string.

It renders a `<p>`. For text inside a sentence or a control label, use the
`text-p-*` utilities directly; `Text` is for block copy.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `size` | `2xs \| xs \| sm \| base \| md \| lg \| xl \| 2xl` | `base` | paragraph scale |
| `weight` | `medium \| semibold \| bold` | regular | weight composite (`text-p-<size>-<weight>`) |
| `class` | `string` | — | merged last; recolor here |

## Behavior and accessibility

The paragraph carries `data-slot="text"`, `data-size` and `data-weight`.
Reading color and size come from the scale, so 200% text enlargement reflows
instead of clipping.
