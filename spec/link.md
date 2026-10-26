# Link

A text link inside prose or chrome — navigation, not a command.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `href` | `string` | — | external URL; opens a new tab with `rel="noreferrer noopener"` |
| `route` | `string` | — | in-app destination (CONTEXT: `route` is in-app, `href` is external); wins over `href`; a plain `href` a router intercepts |
| `theme` | `'blue' \| 'gray'` | `blue` | accent link vs quiet chrome link |
| `underline` | `'none' \| 'hover' \| 'always'` | `hover` | decoration control for prose vs chrome |
| `showExternalIcon` | `boolean` | — | external-link glyph after the content, external `href` only |
| `class` | `string` | — | merged into the root |

## Behavior and accessibility

An external `href` opens a new tab and announces "(opens in a new tab)" to
assistive tech; the visible glyph is opt-in. There is no disabled state — links
are content; use `Button` for a command that can be unavailable. Long labels
truncate inside the link's own box. Styling hooks: `data-slot="link"`,
`data-theme`, `data-underline` (P10).
