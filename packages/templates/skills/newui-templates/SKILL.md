---
name: newui-templates
description: >
  Use when composing application frames with @talelk/newui-templates — AppShell
  (responsive sidebar + drawer, brand/tenant/navigation/settings/ account slots,
  collapse), PaneLayout (resizable split panes), AuthLayout (sign-in/sign-up
  canvas). Use when the user asks for an app shell, a split layout or an auth
  page in newui, or mentions @talelk/newui-templates.
metadata:
  type: core
  domain: ui
  library: '@talelk/newui-templates'
  library_version: '1.1.1'
sources:
  - talelk/newui:packages/templates/src/templates/AppShell.tsx
  - talelk/newui:packages/templates/src/templates/PaneLayout/PaneLayout.tsx
  - talelk/newui:packages/templates/src/templates/AuthLayout.tsx
  - talelk/newui:spec/app-shell.md
  - talelk/newui:spec/pane-layout.md
  - talelk/newui:spec/auth-layout.md
  - talelk/newui:spec/adr/0013-atomic-packages-and-app-shell.md
---

# newui templates

Exactly three application frames. Read the `newui` skill for the vocabulary;
the organisms skill covers `AppSidebar`, which AppShell renders for you.

## Setup

```tsx no-check
import { AppShell } from '@talelk/newui-templates'
import { SidebarItem } from '@talelk/newui-organisms'

export function Frame() {
  return (
    <AppShell
      title="Projects"
      brand={<span>Acme</span>}
      navigation={[
        {
          label: 'Workspace',
          items: [
            { label: 'Projects', icon: 'lucide-folders', route: '/', active: true },
          ],
        },
      ]}
      settings={<SidebarItem label="Settings" icon="lucide-settings" />}
      account={<SidebarItem label="Rhea Kapoor" icon="lucide-user-round" />}
    >
      <p>Page content — the template owns the h1 from `title`.</p>
    </AppShell>
  )
}
```

## Core patterns

**AppShell owns the responsive sidebar.** Desktop docks it; narrow viewports
open the same navigation as a modal drawer. There is no separate mobile shell
and no rail — never mount `Sidebar` or `MobileNav` inside it.

**Collapse is controllable.** Pass `collapsed` + `onCollapsedChange` when the
app owns persistence (P2); without them the shell owns the state. The fold
lives in the sidebar's identity row (`⌘B`/`Ctrl+B` also toggles).

**Split content with PaneLayout inside AppShell.** Mail-style records need
`PaneLayout`'s resizable start/end panes; `active` collapses to one pane on
compact widths. Split panes do not replace the shell.

**AuthLayout is a canvas, not an auth backend.** It centers the flow and
offers the desktop-only `aside` context panel; the card and session logic
stay app-owned (`AuthCard` is an organism).

## Common mistakes

**One `h1` per page.** AppShell renders it from `title`; do not add a second
heading for the page name. `mobileTitle` changes only the compact bar (a
`span`, not a heading).

**Don't pass a rail or second navigation.** The old `SidebarRail`/
`DesktopShell` APIs were removed; their props fail typecheck.

**Don't put page content outside the children.** `footer` renders inside the
page scroller below the body — a fixed footer is app chrome, not this
template's slot.

## Completion

The starter app (`apps/starter`) composes all three templates against the
published packages; its e2e suite (`e2e/starter.spec.ts`) is the reference
for expected behavior.
