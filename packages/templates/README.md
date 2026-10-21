# @newui/templates

Exactly three templates: one responsive workspace `AppShell`, a two-pane
`PaneLayout`, and a centered `AuthLayout`.

```tsx
import { AppShell, PaneLayout } from '@newui/templates'

<AppShell
  brand={<Brand />}
  tenant={<TenantSwitcher />}
  navigation={groups}
  settings={<SettingsAction />}
  account={<AccountMenu />}
  title="Projects"
>
  <ProjectsPage />
</AppShell>
```

`AppShell` owns the responsive behavior and the single sidebar. The app owns its
logo, tenant switcher, routes and account actions. There is no separate rail,
desktop shell, mobile shell or alternate app layout.

The package depends downward on `@newui/atoms`, `@newui/molecules` and
`@newui/organisms`.
