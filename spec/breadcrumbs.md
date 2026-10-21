# Breadcrumbs

`Breadcrumbs` — a trail showing where the current page sits in a hierarchy and
letting the user step back to a parent. It renders its own
`<nav aria-label="Breadcrumb">` landmark around an ordered list, so it is the
page's main breadcrumb trail; the landmark belongs to the caller.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | required | ordered, root first, current page last |
| `aria-label` | `string` | `"Breadcrumb"` | accessible name for the `<nav>` |
| `class` | `string` | — | merged into the root `<nav>` |

### `BreadcrumbItem`

| field | type | notes |
| --- | --- | --- |
| `label` | `string` | required; the crumb text |
| `route` | `string` | in-app destination; renders an anchor, wins over `href` |
| `href` | `string` | external URL; renders an anchor |
| `icon` | `string` | `lucide-*` glyph shown before the label (P11) |
| `onClick` | `(event?: MouseEvent) => void` | click handler; see below |
| … | `unknown` | an item carries any extra field (e.g. its source record) |

## Behavior

- **Current page.** The last item is the current page. It renders as a plain
  `<span aria-current="page">` — not a link — and its `onClick` is ignored. Its
  label truncates when space runs out and the full text shows on hover.
- **Links.** A non-current item with `route` or `href` renders an `<a href>`;
  `route` wins when both are set. There is no router integration, so `route` is
  written straight to `href` — an in-app router intercepts the click.
- **Buttons.** A non-current item with neither `route` nor `href` renders a
  `<button type="button">`, navigated through `onClick`.
- **`onClick` with a destination.** Set `onClick` together with `route`/`href`
  to keep a real URL on the crumb and still navigate in-app: a plain left click
  runs the handler and calls `preventDefault`, while a modified click
  (Cmd/Ctrl/Shift/Alt or middle) stays with the browser.
- **Separators.** A `/` between crumbs, `aria-hidden="true"`, so assistive tech
  reads only the labels.

## Accessibility

- The root is `<nav aria-label="…">` containing a single `<ol>`; each crumb is
  an `<li>`.
- The current page is the one element with `aria-current="page"`.
- Separators are hidden from screen readers; links and buttons carry their own
  accessible names from the label.

## Styling hooks

`data-slot` on `breadcrumbs` / `breadcrumbs-list` / `breadcrumbs-item` /
`breadcrumbs-separator` / `breadcrumbs-current` / `breadcrumbs-link` /
`breadcrumbs-button`. Colors use semantic tokens only (`ink-gray-*`).

## Deliberate omission

The trail collapses overflow into a `…` dropdown once it does not fit
its container. That depends on a resize observer and the `Dropdown`/`Button`
family; it is out of scope here, and the trail scrolls/clips instead.
