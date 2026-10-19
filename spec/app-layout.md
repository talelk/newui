# AppLayout

`AppLayout` — the application frame: a title block, a navigation column, and a
content area that scrolls inside the viewport rather than with it.

## Why a layout

Nine example applications were each writing this frame by hand: a masthead, a
sidebar that becomes a drawer, a page title with its actions, a footer. The
differences between them were only *what the app puts in the slots* — which is
the definition of a template.

`ResponsiveShell` picks the frame (docked above the breakpoint, header + drawer +
bottom nav below); `AppLayout` says what goes where inside it.

## Props

| prop | type | notes |
| --- | --- | --- |
| `title` | `JSX.Element` | the page's own title block; rendered as the `h1` |
| `description` | `JSX.Element` | a muted line under the title |
| `breadcrumbs` | `BreadcrumbItem[]` | the trail above the title. Omitted → no trail |
| `eyebrow` | `JSX.Element` | the small line above the title, when a trail is too much |
| `actions` | `JSX.Element` | trailing controls of the title block |
| `rail` | `JSX.Element` | the narrow icon strip on the far left |
| `sidebar` | `JSX.Element` | the navigation column; a drawer on a phone |
| `sidebarFooter` | `JSX.Element` | pinned to the foot of the navigation column |
| `foldable` | `boolean` | let the column fold to an icon rail. Default `true` |
| `brand` | `JSX.Element` | start of the desktop header |
| `headerActions` | `JSX.Element` | trailing header controls: a colour scheme, an account |
| `mobileTitle` | `JSX.Element` | the phone bar's title. Defaults to `eyebrow`, then the breadcrumb |
| `sidebarFooter` | `JSX.Element` | pinned to the foot of the navigation column |
| `footer` | `JSX.Element` | below the content, inside the scroller |
| `navLabel` | `string` | accessible name of the navigation landmark |
| `class` | `string` | merged into the frame |

## Behavior

- **The slots are the API.** A layout that decided the brand, the header controls
  or the footer would be an application. What apps do agree on is the order —
  eyebrow, title, description, actions — and that the content scrolls under a
  header that does not.
- **No sidebar means no navigation at all**: no column, no drawer, no menu
  button. A sliver of empty column and a hamburger that opens nothing are worse
  than neither.
- **One `h1`.** The page's title is it; the phone bar's title is a `span`
  (`PageHeaderMobile`'s `titleAs`), because a bar that repeats the page title as
  a second heading leaves the document without a single one.
- **`h-dvh`.** The frame owns the viewport, so the header and the filters stay
  put and the content column scrolls — which is what lets a board's columns own
  their own overflow.
- **The title block lives in the scroller**, not in the header: on a phone it
  must scroll away, and on a desk it should not be pinned twice.

- **The fold is offered only while docked.** Below the breakpoint the same node
  is the drawer's body, and a drawer of bare icons with `sr-only` labels is no
  navigation at all.
- **The rail is a slot, not a list.** Apps know their own destinations; the frame
  only guarantees the landmark (`<nav aria-label="Apps">`) they sit in.

## Not yet

- No bulk-action footer, tab row or side panel: those are `ListPage` and
  `DetailPage`, which compose this frame rather than adding props to it.
- No side panel, no tabs, no empty state — same reason.
