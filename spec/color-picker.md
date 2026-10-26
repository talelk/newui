# ColorPicker

A color value: the platform's own picker under a styled swatch, with a hex
field beside it.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | — | controlled color, lowercase `#rrggbb` |
| `defaultValue` | `string` | `#6b7280` | |
| `onValueChange` | `(value: string) => void` | — | fires with normalized hex |
| `editable` | `boolean` | `true` | the hex text field beside the swatch |
| `disabled` | `boolean` | — | |
| `label` / `description` / `error` / `required` | shared labelling contract (P5) | — | the swatch is the labelled control |
| `id` / `'aria-label'` / `class` | | | |

## Behavior and accessibility

The swatch wraps a native `<input type="color">` (the `Checkbox` precedent: no
machine where the engine ships the keyboard, pointer and screen-reader
behavior). The hex field accepts `#rgb`, `#rrggbb` — with or without `#` — and
normalizes to lowercase `#rrggbb`; every 3-hex-digit prefix of a 6-digit code
is itself a valid shorthand and commits as one. A draft that is not (yet)
valid flags the text field (`aria-invalid`, `data-invalid`) without
committing; the swatch keeps the last committed color. `editable: false`
leaves only the swatch. Styling hooks: `data-slot="color-picker"` /
`color-picker-swatch`, `data-disabled` (P10).
