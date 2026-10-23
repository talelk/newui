# Section

The shared page-region anatomy: header, optional toolbar, body, optional footer.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | — | region title |
| `description` | `JSX.Element` | — | one-line context under the title |
| `actions` | `JSX.Element` | — | trailing actions opposite the title |
| `toolbar` | `JSX.Element` | — | controls between the header and body |
| `footer` | `JSX.Element` | — | footer above a 1px rule |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | `2` | semantic heading level |
| `surface` | `'plain' \| 'card' \| 'inset'` | `plain` | surface treatment |
| `density` | `'comfortable' \| 'compact'` | `comfortable` | 12px or 8px rhythm |
| `id` | `string` | — | anchor id |
| `class` | `string` | — | merged into the section |

## Behavior

- **One H1 per page.** `AppShell` and `AuthCard` own the page H1; a `Section`
  defaults to H2; cards and subregions inside use H3.
- **The four slots have one owner each.** Header = title/description/actions;
  toolbar = controls that change the data; body = the data view; footer =
  pagination, totals or selection feedback. Organisms do not repeat those
  regions internally.
- **`plain` is the default** because DataTable, Kanban and VirtualList already
  bring their own card surfaces. `card` is for a section that needs one;
  `inset` for a recessed group.
- The header wraps; actions stay on the trailing edge until the width forces
  them below the title.
- `data-slot="section"`, `data-surface` and `data-density` are stable hooks.
