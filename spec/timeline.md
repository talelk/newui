# Timeline

`Timeline` — a vertical run of events, oldest first, with a rail drawn *between*
the markers rather than through them. Plain markup: no machine, no state.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `items` | `TimelineItem[]` | required | render order is oldest first |
| `class` | `string` | — | merged into the `<ol>` |

### `TimelineItem`

| field | type | notes |
| --- | --- | --- |
| `id` | `string` | a stable key; falls back to the index |
| `title` | `JSX.Element` | required |
| `description` | `JSX.Element` | one or two lines under the title |
| `timestamp` | `JSX.Element` | muted, trailing — a relative time, usually |
| `icon` | `IconProp` | defaults to a plain dot |
| `tone` | `'gray' \| 'blue' \| 'green' \| 'amber' \| 'red'` | tints the marker |

## Behavior

- The rail is two half-lines per row — above and below the marker's centre — and
  the first and last rows drop the half that would dangle. A single full-height
  line behind a column of markers looks right only until the markers have
  different heights.
- The rail segments and the marker are `aria-hidden`: the list is a sequence of
  events, and the text carries the meaning.
- The timestamp is right-aligned on the title's baseline row.

## Styling hooks

`data-slot` (`timeline` / `timeline-item` / `-marker`).
