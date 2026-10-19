# DetailHeader

`DetailHeader` — the top of a record page: where it sits, what it is, what state
it is in, and what you can do to it.

## Props

| prop | type | notes |
| --- | --- | --- |
| `breadcrumbs` | `BreadcrumbItem[]` | trail above the title; omitted → no trail |
| `title` | `JSX.Element` | required |
| `subtitle` | `JSX.Element` | muted line — an id, an owner, a timestamp |
| `status` | `{ label, theme? }` | pill beside the title |
| `actions` | `DetailAction[]` | all but the last render outline; the last is primary |
| `children` | `JSX.Element` | trailing controls, before the actions |
| `class` | `string` | |

## Behavior

The order is the point. A reader arrives from a list and needs three questions
answered in that order: the trail first, so they know this is the record they
clicked; then the name; then the status, because a status only means something
once you know what it belongs to. Actions sit on the trailing edge with the
primary one **last**, so the least-common (often destructive) action is never the
one nearest the title. The subtitle reads at `ink-gray-7` (secondary text never
drops below that step), and the trailing action row wraps rather than pushing
the title off a narrow record page.
