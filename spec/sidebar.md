# Sidebar

The desktop navigation rail: a labelled sidebar with a header, items, an
optional collapsed rail, collapsible sections and status cards.

## Anatomy

```tsx
<Sidebar collapsible defaultCollapsed={false}>
  <SidebarHeader title="Acme" />
  <SidebarSection label="Workspace" collapsible>
    <SidebarItem active prefix={<Icon icon="lucide-house" />}>
      Home
    </SidebarItem>
  </SidebarSection>
  <SidebarCard theme="amber" title="Trial" description="6 days left" action={{ label: 'Upgrade' }} />
  <SidebarCollapseToggle />
</Sidebar>
```

`SidebarRail` + `SidebarRailItem` are the icon-only rail for a collapsed shell.

## Parts

| part | notes |
| --- | --- |
| `Sidebar` | `<nav>` landmark; `collapsible` (default `true`), `collapsed`/`onCollapsedChange`, `collapsedWidth` (3rem), `ariaLabel` (Main). Auto-collapses below `sm` when uncontrolled. |
| `SidebarHeader` | `title`/`subtitle`, `logo`/`showLogo`, collapse-aware. |
| `SidebarLabel` | group label; `action` is a trailing control of the group row (hidden in the rail); `divider` swaps the label for a rule while collapsed. |
| `SidebarItem` | row; `active`, `label` (accessible name + tooltip when collapsed; defaults to string children), `icon` (used when `prefix` is unset), `prefix`/`suffix`, `route`/`href` (link rendering, frappe-ui parity). |
| `SidebarRail` / `SidebarRailItem` | 50px icon-only rail; item `variant` (`subtle`/`ghost`), `description`, `badge` + `badgeStyle` (`count`/`dot`), `route`/`href`, active indicator, tooltip. |
| `SidebarCollapseToggle` | a `SidebarItem` that toggles the sidebar; `expandLabel`/`collapseLabel`. |
| `SidebarSection` | labelled, optionally collapsible group (accordion ARIA); controlled via `collapsed`/`onCollapsedChange`. |
| `SidebarCard` | compact status card: `theme`, `title`, `description`, `icon`, `action` (its `onClick` receives `{ dismiss }`), `dismissible`. Unmounts when the sidebar is a rail, like `SidebarSearch`. |

`useSidebar()` returns `{ collapsed, toggle }` for a custom toggle.

## Behavior

- **Collapse.** Controlled via `collapsed`/`onCollapsedChange`, else the sidebar
  tracks its own state and collapses below `sm`. A collapsed item's label moves
  to `title`/`aria-label` and its text becomes `sr-only`.
- **Section.** `collapsible` renders an accordion heading (`aria-expanded` +
  `aria-controls`); the body stays in the tree and is `hidden` when collapsed,
  so the control's `aria-controls` resolves in both states.
- **Links (frappe-ui parity).** `SidebarItem` and `SidebarRailItem` take
  `route` (in-app, wins) / `href` (external, new tab) and render an anchor;
  with neither they render a button. `onClick` fires in every case, which is
  where a router intercepts. Unlike frappe-ui there is no router in the
  library, so `active` is never auto-derived from the URL — the caller owns
  it. The active row carries `aria-current="page"`. A `SidebarItem`'s
  `suffix` sits beside the link, not inside it, so a menu button there is
  valid HTML; the row background covers both.

## Styling hooks

`data-slot` on every part (`sidebar`, `sidebar-header`, `sidebar-label`,
`sidebar-item`, `sidebar-rail`, `sidebar-rail-item`, `sidebar-section`,
`sidebar-card`), plus `data-state` (`collapsed`/`expanded`, `active`/`inactive`)
and `data-theme` on the card.

## Analytics visual standard

Sidebar items default to 32px high with a 6px radius and 14px interface text.
Selection uses the semantic blue surface and foreground. Prefixes and block
counts inherit that foreground, preserving contrast in both schemes. Keyboard
focus is visible; width and colour motion respect reduced-motion preferences.

Labelled rail items treat their custom glyph/avatar content as decorative.
The accessible name includes the destination label and unread count.

## Collapse, search and the trigger

- **`SidebarSearch`** is the filter above the groups. It hides itself while the
  sidebar is a rail: there is nowhere to type into 3rem, and a field crushed to
  fit is a bug that looks deliberate.
- **`SidebarItem` gets a real tooltip while collapsed**, not a `title`
  attribute — a rail of bare icons is unusable without one, and `title` takes a
  second to appear and cannot be styled. `TooltipTrigger` renders the button
  itself, so there is no button inside a button.
- **`SidebarTrigger`** folds the sidebar; **⌘B / Ctrl+B** does the same
  anywhere on the page (`shortcut={false}` opts out). `SidebarCollapseToggle` is
  the frappe-shaped variant — a `SidebarItem` at the foot of the list.
