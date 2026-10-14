# Accordion

`Accordion` — a set of collapsible sections, over Zag's `accordion` machine. The
machine owns the keyboard map (`Up`/`Down`/`Home`/`End` between the triggers,
`Enter`/`Space` to toggle, disabled items skipped) and the `aria-expanded` /
`aria-controls` / `role="region"` wiring.

## Parts

| part | notes |
| --- | --- |
| `Accordion.Root` | the machine and the frame |
| `Accordion.Item` | owns `value` and `disabled`; renders the heading level |
| `Accordion.Trigger` | the button; `icon` renders before the label |
| `Accordion.Content` | the panel |

`Item` owns the value and the disabled flag and hands both to its parts, so a
`Trigger` and its `Content` cannot disagree about which item they belong to —
and a disabled item disables all three of Zag's getters at once, not just the
item element.

## Props

### `Accordion.Root`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | more than one panel open at a time |
| `collapsible` | `boolean` | `true` | single-select only: allow closing the open panel |
| `value` | `string[]` | — | controlled |
| `defaultValue` | `string[]` | — | uncontrolled |
| `onValueChange` | `(value: string[]) => void` | — | |
| `disabled` | `boolean` | `false` | disables every item |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | vertical swaps the arrow keys |
| `class` | `string` | — | merged into the root |

### `Accordion.Item`

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | required | the machine's key for this item |
| `disabled` | `boolean` | `false` | |
| `headingLevel` | `'h2'…'h6'` | `'h3'` | the element wrapping the trigger |
| `class` | `string` | — | |

### `Accordion.Trigger` / `Accordion.Content`

| prop | type | notes |
| --- | --- | --- |
| `icon` | `IconProp` | trigger only; a `lucide-*` string or a component (P11) |
| `class` | `string` | merged into the button / the panel body |

## Behavior

- The trigger is the heading's child, and the heading wraps **only** the
  trigger. Putting the panel inside the heading too would lay the two out as
  siblings in the heading's row.
- A disabled trigger carries the native `disabled` attribute (Zag's choice, not
  a `data-disabled`), so the disabled recipe hangs off `:disabled` — and the
  indicator, a child, off `group-disabled:`.
- The panel animates with the shared `disclosure-panel` utility: the machine's
  `hidden` is dropped and `grid-template-rows: 0fr → 1fr` carries the height,
  while `visibility` (delayed by the transition) keeps a collapsed panel out of
  the tab order and the accessibility tree.

## Styling hooks

`data-slot` (`accordion` / `-item` / `-heading` / `-trigger` / `-indicator` /
`-content`) plus Zag's `data-state` (`open` / `closed`) on the trigger, the
indicator and the panel.

## Not yet

No `boundaryCount`-style layout for a horizontal accordion, and no
`forceMount`-equivalent: a collapsed panel's content stays in the DOM (it is
`visibility: hidden`), which is what makes the height transition possible.
