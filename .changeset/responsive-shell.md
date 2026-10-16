---
'@newui/ui': minor
---

`ResponsiveShell` — one navigation, two frames.

`DesktopShell` and `MobileShell` are two honest frames. Every application that
wanted both then wrote the same sixty lines: a media query, a sidebar that turns
into a drawer, a hamburger that opens it, and a rule that closes it again when the
window grows. That switch is identical everywhere, which is the definition of a
component.

- **The breakpoint is a media query, not a prop**, so the frame follows the window
  the way CSS does — no state to sync with a resize, and the drawer closes itself
  the moment there is room for the real sidebar.
- **Only one frame is rendered.** On a wide window the phone's header and bottom
  nav do not exist, and neither does the drawer.
- **The drawer is the platform's own modal `<dialog>`**: real top layer, real focus
  trap, Escape, backdrop, and focus restored to the trigger on close. The animated
  surfaces here (`Dialog`, `BottomSheet`) use the Zag machine because they need its
  motion and drag; a drawer needs none of that. Where `showModal` is missing the
  `open` attribute is set instead, so the drawer degrades rather than throwing.
- `ResponsiveShellMenu` is the trigger, and renders nothing while the sidebar is
  docked — a hamburger beside a visible sidebar is a control that would do nothing.
  `useResponsiveShell()` exposes `{ compact, open, showDrawer, hideDrawer }` for a
  nav item or a toolbar button.

`PageHeaderMobile` also gains **`titleAs`**: it draws its title as an `h1` because
on a phone the bar usually *is* the page title, but a page that carries its own
heading below can pass `span` and keep exactly one.

The examples adopt the shell, so every recipe's frame is now the library's:
`h-dvh`, the header and filters stay put, and the content column scrolls inside it
— which is what makes a board's columns able to own their own overflow. The
recipes that declare no navigation get no sidebar, no drawer and no menu button,
rather than a sliver of empty column.
