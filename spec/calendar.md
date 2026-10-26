# Calendar

The date grid on its own — no input, no popup, no trigger.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | — | controlled selected date, `YYYY-MM-DD` (ADR-0008) |
| `defaultValue` | `string` | — | |
| `onValueChange` | `(value: string) => void` | — | |
| `min` / `max` | `string` | — | selectable window, `YYYY-MM-DD`; outside days are unavailable, not removed |
| `locale` | `string` | `en-US` | BCP 47 for day/month names |
| `dualPane` | `boolean` | — | two months side by side |
| `disabled` | `boolean` | — | |
| `'aria-label'` | `string` | — | names the grid when there is no visible label |
| `class` | `string` | — | merged into the surface |

## Behavior and accessibility

The same day/month/year drill-down the pickers use (`CalendarView`), mounted
inline for surfaces that *are* a date — a booking panel, a filter rail, a
scope picker. The Zag date-picker machine runs permanently open and owns the
grid's full keyboard model (arrows move by day/week/month, PageUp/PageDown by
month/year, Enter selects, typing a year in the year view). Day cells are
real buttons carrying `data-selected`, `data-today`, `data-unavailable` and
`data-disabled` (P10).
