# MobileShell

The mobile app frame: a pinned header, a natively-scrolling body and a bottom
navigation bar. `MobileShell` is presentational — it owns no state, no machine
and no router. A page puts its content in the body, a `PageHeaderMobile` in the
header region and a `MobileNav` in the nav region. For the desktop frame, use
`AppShell`.

```tsx
<MobileShell
  header={<PageHeaderMobile title="Home" />}
  nav={
    <MobileNav aria-label="Primary">
      <MobileNavItem label="Home" icon="lucide-house" active />
      <MobileNavItem label="Search" icon="lucide-search" route="/search" />
      <MobileNavItem label="You" href="/more" />
    </MobileNav>
  }
>
  {/* the routed page */}
</MobileShell>
```

## MobileShell

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `header` | `JSX.Element` | — | pinned top region; usually a `PageHeaderMobile` |
| `nav` | `JSX.Element` | — | bottom navigation region; usually a `MobileNav` |
| `class` | `string` | — | merged into the root |
| `children` | `JSX.Element` | — | the routed page content, in the scrolling body |

### Behavior

- **Regions.** A fixed, full-height column: `header`, then a `flex-1` body that
  scrolls, then `nav`. The header and nav stay pinned; only the body moves.
- **Native scrolling.** The body uses the browser's own momentum and overscroll
  (`overflow-y-auto overscroll-auto`), not a custom scrollbar.
- **Installed PWA.** Under `display-mode: standalone` the shell grows to
  `100lvh` (capped at `env(safe-area-inset-top)`, so an opaque status bar cannot
  push content off-screen) and the header region adds the top inset to clear the
  notch. The bottom inset is owned by `MobileNav`.
- **Empty regions.** `header` and `nav` render only when provided.

## PageHeaderMobile

The mobile page header: a centered title with an optional leading control and
trailing actions. `prefix` is usually a back button, `suffix` the page actions.

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | — | centered title text |
| `prefix` | `JSX.Element` | — | leading control, usually a back button |
| `suffix` | `JSX.Element` | — | trailing control(s), usually actions |
| `children` | `JSX.Element` | — | custom title markup; overrides `title` |
| `class` | `string` | — | merged into the header |

### Behavior

- **One line.** The title is a single-line, ellipsised `<h1>`; navigating
  between pages never changes the header's height.
- **Centering.** `prefix` and `suffix` are absolutely positioned at the edges and
  the title is inset symmetrically, so it stays visually centered. The inset is
  a fixed reserve (`px-12`); controls wider than that will overlap the title.
- **Back action.** The header is presentational. Put a back control in `prefix`
  and wire its own navigation; the component does not navigate.

## MobileNav

A bottom navigation bar. A bare grid frame: each `MobileNavItem` becomes one
equal-width column (`auto-cols-fr` + `grid-flow-col`), so the bar adapts to any
item count without a hardcoded column class.

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `aria-label` | `string` | — | accessible name for the `<nav>` landmark |
| `class` | `string` | — | merged into the root `<nav>` |
| `children` | `JSX.Element` | — | one or more `MobileNavItem`s |

Under `display-mode: standalone` the bar's bottom padding clears the home
indicator — the safe-area inset, or `1rem` where the inset is smaller.

## MobileNavItem

One tab: a glyph over a label, with an active highlight.

### Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `string` | — | label under the glyph; also the accessible name |
| `icon` | `string \| Component` | — | Lucide name or component (P11); replaced by `children` |
| `route` | `string` | — | in-app destination; renders an anchor, wins over `href` |
| `href` | `string` | — | external URL; renders an anchor when `route` is absent |
| `active` | `boolean` | `false` | highlight the tab |
| `aria-current` | `page \| step \| …` | — | marks the current page for assistive tech |
| `children` | `JSX.Element` | — | custom content in place of the icon (an avatar, a badge) |
| `onClick` | `(event: MouseEvent) => void` | — | click handler |
| `class` | `string` | — | merged into the item |

### Behavior

- **Element.** An anchor when the item has a `route` or `href`; otherwise a
  `<button type="button">`. `route` wins over `href` when both are set.
- **Active.** `active` is a state prop, not a theme, and is independent of the
  current route, so one tab can stay lit across a whole section. It drives the
  highlight through `data-state` and the glyph/label color.
- **Custom glyph.** Passing `children` replaces the icon region entirely; the
  label always shows under it.

## Accessibility

`MobileNav` renders a `<nav>` landmark; give it an `aria-label` when the page has
more than one navigation region. Each `MobileNavItem` takes its accessible name
from `label`. Set `aria-current="page"` on the tab for the current page —
`active` is a visual highlight and does not imply `aria-current`.

## Styling hooks

`data-slot` on every part: `mobile-shell`, `mobile-shell-header`,
`mobile-shell-scroll`, `page-header-mobile`, `page-header-mobile-prefix`,
`page-header-mobile-title`, `page-header-mobile-suffix`, `mobile-nav`,
`mobile-nav-item`. `data-state` on `mobile-nav-item` (`active` / `inactive`).

## The header's title element

`PageHeaderMobile` draws its title as an `h1`: on a phone the bar usually *is* the
page title. When the page carries its own heading below — a section name in the
bar over a document that names itself — pass `titleAs="span"`, or the page ends up
with two `h1`s and no way to tell which one it is.
