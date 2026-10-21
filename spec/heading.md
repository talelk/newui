# Heading

A section or page title. `Heading` exists so a page's outline and its type
roles cannot drift: `level` picks both the element (`h1`–`h3`) and the role —
`1` renders the 24px page title (`text-heading`), `2` and `3` render the 18px
section title (`text-section`). The scale has no third display size; level 3
differs from level 2 in the document outline only.

Always use the real level for the outline (P12) — never skip levels for a
smaller size. Recolor with `class` (e.g. `text-ink-gray-7` for a muted
subsection); `cn()` merges the caller class last.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `level` | `1 \| 2 \| 3` | `2` | picks `h1`–`h3` and the role |
| `class` | `string` | — | merged into the heading |

## Behavior and accessibility

The rendered element carries `data-slot="heading"` and `data-level`. Headings
are landmark content: one `h1` per page, sections nested under it.
