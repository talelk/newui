---
'@newui/layouts': minor
---

`@newui/layouts` — the template level, starting with `AppLayout`.

A component answers *what is this control*; a block answers *how does this section
open*; a layout answers *how does the page open*. Nine example applications were
each writing that third answer by hand — a rail, a sidebar that becomes a drawer,
a page title with its actions, a footer — with the only differences being what the
app puts in the slots.

`AppLayout` owns the arrangement:

- **The slots are the API.** Brand, header controls and footer stay the app's,
  because those are the three things two apps never agree on. What they agree on
  is the order — breadcrumbs, title, description, actions — and that the content
  scrolls under a header that does not (`h-dvh`: the frame owns the viewport).
- **A rail, a folding navigation column, and a phone bar** that names the place
  without becoming a second `h1` (`PageHeaderMobile`'s `titleAs`).
- **The fold is offered only while docked**: below the breakpoint the same node is
  the drawer's body, and a drawer of bare icons is no navigation at all.
- **No sidebar means no navigation at all** — no column, no drawer, no menu
  button, rather than a sliver of empty column and a hamburger that opens nothing.

The playground's `ExampleFrame` is gone; `WorkspacePage` is the site's
*composition* of the layout — which apps the rail lists, the workspace mark, the
colour scheme, the demo-data footer — and nine examples import it unchanged.
