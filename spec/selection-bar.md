# SelectionBar

The bulk-action surface for a data region.

## Props

| prop | type | notes |
| --- | --- | --- |
| `count` | `number` | selected records; `0` renders nothing |
| `summary` | `JSX.Element` | total or scope beside the count |
| `primary` | `{ label, onClick, icon?, disabled? }` | the bulk action |
| `secondary` | `JSX.Element` | extra actions before Clear |
| `onClear` | `() => void` | clears selection |
| `placement` | `'inline' \| 'sticky'` | sticky fixes to the bottom below `sm` |
| `class` | `string` | merged into the bar |

## Behavior

- On phones the primary and Clear actions use the 40px touch height; the
  bar stays above the safe area.


- Renders only while `count > 0`.
- Inline on desktop; `sticky` is `position: fixed` below `sm` so a selected row
  far down a card list never requires scrolling back to a toolbar.
- The primary is the only solid button; Clear is ghost. The count and summary
  are read first.
- `data-slot="selection-bar"` and `data-placement` are stable hooks.
