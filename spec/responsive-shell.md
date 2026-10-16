# ResponsiveShell

`ResponsiveShell` — one navigation, two frames: the docked `AppShell` where there
is room for two columns, the `MobileShell` where there is not, with the sidebar
becoming an off-canvas drawer between them.

## Why

`DesktopShell` and `MobileShell` are two honest frames. Every application that
wanted both then wrote the same sixty lines: a media query, a sidebar that turns
into a drawer, a hamburger that opens it, and a rule that closes it again when the
window grows. That switch is identical in every app, which is the definition of a
component.

## Props

| prop | notes |
| --- | --- |
| `rail`, `sidebar` | docked beside the content; the drawer's body on a phone |
| `header` | the desktop content column's own header |
| `mobileHeader` | the pinned phone header. Defaults to `title` + a menu button |
| `title` | title for that default header |
| `mobileNav` | bottom navigation, usually a `MobileNav` |
| `query` | the widening media query. Default `(min-width: 1024px)` |
| `label` | accessible name of the drawer. Default `Navigation` |
| `class` | merged into the active frame |

Parts: **`ResponsiveShellMenu`** (the trigger, rendering nothing while the
sidebar is docked) and **`useResponsiveShell()`** → `{ compact, open, showDrawer,
hideDrawer }`, for a nav item or a toolbar button that opens the drawer.

## Behavior

- **The breakpoint is a media query, not a prop**, so the frame follows the window
  the way CSS does: there is no state to keep in sync with a resize, and the
  drawer closes itself the moment there is room for the real sidebar.
- **Only one frame is rendered.** On a wide window the phone's header and bottom
  nav do not exist, and neither does the drawer.
- **The menu button renders nothing while the sidebar is docked** — a hamburger
  next to a visible sidebar is a control that would do nothing.
- **The drawer is the platform's own modal `<dialog>`**: a real top layer, a real
  focus trap, Escape, a backdrop, and focus restored to the trigger on close.
  The animated surfaces in this library (`Dialog`, `BottomSheet`) use the Zag
  machine because they need its motion and drag; a drawer needs none of that.
- Anything inside the drawer that navigates (`a`, or `[data-navigates]`) closes
  it, so a section row that routes does not leave the drawer standing.

## Not yet

- No swipe-to-close and no drag handle: `BottomSheet` is the surface for that.
- The drawer is one width (`w-72`), capped at the viewport.
- No `rail`-only mode (the icon strip without a sidebar). Compose
  `AppShell` directly for that, or collapse the `Sidebar` inside it.
