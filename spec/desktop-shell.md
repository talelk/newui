# DesktopShell

`DesktopShell` — the desktop app frame: an optional icon `rail`, an optional
navigation `sidebar`, and a content column beside them. Pages render inside the
content column.

It is the desktop counterpart of frappe-ui's `DesktopShell`. This port is a
**thin wrapper over [`AppShell`](#relationship-to-appshell)**, not a separate
implementation — the two are the same frame. The only thing `DesktopShell` adds
is the `scroll` axis.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `rail` | `JSX.Element` | — | far-left icon column (frappe-ui's `#rail` slot) |
| `sidebar` | `JSX.Element` | — | navigation panel (frappe-ui's `#sidebar` slot) |
| `scroll` | `boolean` | `true` | whether the shell owns the page scroller |
| `class` | `string` | — | merged into the frame root (`AppShell`) |
| `children` | `JSX.Element` | — | the routed page (frappe-ui's default slot) |

`DesktopShellProps` extends `AppShellProps` and adds `scroll`.

## Relationship to AppShell

`DesktopShell` and `AppShell` are the **same shell under two names**. Both render
`rail · sidebar · content column`; frappe-ui's `#rail`, `#sidebar` and default
slots are `AppShell`'s `rail`, `sidebar` and `children` props (P6: compound /
prop vocabulary, not named slots). `AppShell` already ships `PageHeader`,
`PageHeaderTitle` and `PageBody`, so the desktop frame needs no second
implementation of the same regions.

`DesktopShell` therefore wraps `AppShell` and forwards `rail`, `sidebar` and
`class` unchanged. `AppShell` remains the primitive; `DesktopShell` is the
name frappe-ui consumers already use, kept as a thin composition so a ported
page reads the same.

### What is ported

- **Regions.** `rail` · `sidebar` · content — reused from `AppShell`.
- **`scroll`.** frappe-ui's one real prop (`types.ts`). Ported here as the
  content region's overflow mode:
  - `scroll` (default) — the shell owns one page scroller. The content region is
    a full-height flex column with `overflow-y-auto`, so the whole page scrolls
    as one. Render page content directly.
  - `scroll={false}` — the shell adds no scroller. The content region fills the
    remaining height with `overflow-hidden`, so inner panes own their overflow:
    a list-and-detail split, or a board whose columns scroll separately. This is
    frappe-ui's escape hatch from `absolute inset-0` / `h-[calc(100vh-3rem)]`.
  - Pair `scroll={false}` with `PageBody` (or the page's own panes) when the page
    owns its overflow. `PageBody` is itself a scroller, so nesting it under the
    default `scroll` region would double-scroll — pass `scroll={false}` there.

### What is not ported

- **The teleported pinned header.** frappe-ui renders a `PageHeaderTarget` above
  its `ScrollArea` and `PageHeader` teleports into it, so the header stays pinned
  while the page scrolls. That machinery (`PageHeaderTarget`, the shell-scroll
  registry, `useShellScrolled`) has no equivalent in this library. Here a page
  that wants a pinned header composes `PageHeader` + `PageBody` and passes
  `scroll={false}`: `PageHeader` is a non-growing row and `PageBody` is the
  scroller. `DesktopShell` does not invent a teleport to fake frappe-ui's
  pinned header.
- **`useShellScrolled` / `shellScrollContainer`.** These read the shell's scroll
  element from anywhere. They are composables over the teleport/registry design
  above and are out of scope for this component.
- **`ScrollArea` as the scroller.** frappe-ui wraps the content in its
  `ScrollArea` (a Zag machine with custom scrollbars). `DesktopShell` uses the
  native `overflow-y-auto` region instead, matching how `AppShell`'s `PageBody`
  already scrolls. Consumers that want Zag scrollbars compose `ScrollArea`
  inside the content region.

## Behavior

- **Regions are optional.** `rail` and `sidebar` render only when provided, so a
  shell without a rail leaves no gap. Render `sidebar` conditionally to hide it
  on routes that don't need it.
- **The frame owns the viewport height.** `AppShell` is `h-full w-full
  overflow-hidden`, so the frame fills its parent and inner regions scroll rather
  than the document. Give the parent a height (e.g. `h-screen`).

## Accessibility

The shell is presentational: it adds no roles, no keyboard handling and no ARIA.
`rail` and `sidebar` are the caller's; label them (`<nav aria-label=…>`,
`aria-label` on a rail) and give the content region a landmark when it is the
page's main region. The shell only guarantees the layout and the scroll region.

## Styling hooks

- `data-slot="app-shell"` — the frame root (from `AppShell`; `DesktopShell` does
  not rename it).
- `data-slot="desktop-shell-content"` — the content region.
- `data-scroll="page" | "panes"` — the active `scroll` mode (`page` = shell owns
  the scroller, `panes` = panes own their overflow).
- `data-slot="sidebar"` / `data-slot="sidebar-rail"` — from `Sidebar` /
  `SidebarRail` when the caller passes them.
