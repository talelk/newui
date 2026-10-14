# Collapsible

`Collapsible` — one disclosure: a trigger and the panel it shows or hides, over
Zag's `collapsible` machine. The single-item sibling of `Accordion`.

Use `Collapsible` when the state is a plain boolean you own ("show more"); use
`Accordion` when the items coordinate — one open at a time, arrow keys between
the triggers.

## Parts

`Collapsible.Root` · `Collapsible.Trigger` · `Collapsible.Content`.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `disabled` | `boolean` | `false` | |
| `icon` | `IconProp` | — | trigger; shown before the label |
| `hideIndicator` | `boolean` | `false` | trigger; drop the built-in chevron |
| `class` | `string` | — | merged into the part it is passed to |

## Behavior

- Same animation contract as `Accordion`: the panel uses the shared
  `disclosure-panel` utility (`grid-template-rows` for the height, delayed
  `visibility` for the tab order and the accessibility tree).
- The trigger carries `aria-expanded` and `aria-controls` from the machine.

## Styling hooks

`data-slot` (`collapsible` / `-trigger` / `-content`) plus Zag's `data-state`
(`open` / `closed`).
