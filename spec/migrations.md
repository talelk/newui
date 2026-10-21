# Migrations

Known breaking changes and how to move off them. Codemods are only written when
a **v1-equivalent freeze** is declared; until then each change is documented here
and, where the transform is mechanical, a `scripts/migrate.ts` will be added
alongside it.

## `Select` single mode is scalar (pre-1.0)

`Select`'s value was `string[]` in every mode. Single mode (the default, no
`multiple`) now takes `value: string | null` and reports `onValueChange` with a
scalar — the same shape as `Combobox`. `multiple` keeps the array contract.

Before:

```tsx
<Select options={STATUSES} value={[status()]} onValueChange={(v) => setStatus(v[0] ?? 'Todo')} />
```

After:

```tsx
<Select options={STATUSES} value={status()} onValueChange={(v) => setStatus(v ?? 'Todo')} />
```

## Vite 8 tooling

`@newui/vite` now targets Vite `^8.3.4`. Upgrade consumer applications from Vite 6
before adopting this package update. The workspace uses Vite 8's Rolldown build
and Oxc minifier; existing bundle and route budgets remain unchanged.

Local checks use TypeScript 7 and Vitest 5. ESLint still needs the TypeScript 6
JavaScript API, installed through Microsoft's `@typescript/typescript6` alias
alongside the native compiler. Application tables use TanStack Table 9 with an
explicit feature set, row-model factories and sort-function registry.

## `Dropdown` is options-based (pre-1.0)

`Dropdown` used to be an alias of the compound `Menu`
(`<Dropdown.Root>/<Dropdown.Item>`). It is now options-based.

Before:

```tsx
<Dropdown.Root onSelect={onSelect}>
  <Dropdown.Trigger>Actions</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item value="edit">Edit</Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
```

After:

```tsx
<Dropdown
  options={[{ label: 'Edit', value: 'edit' }]}
  onSelect={onSelect}
>
  Actions
</Dropdown>
```

The compound API is unchanged — it is `Menu` (`Menu.Root`, `Menu.Item`, …). A
codemod would rewrite `Dropdown.Root` → `Menu.Root` and `Dropdown.Item` →
`Menu.Item`; it is deferred (see ADR-0006).

## No `v-model`

Overlays use `open` + `onOpenChange`; inputs use `value` + `onValueChange`
(ADR-0001). Uncontrolled use is expressed with `default*` props.

## Colour shifts

Colours intentionally differ from earlier releases where WCAG AA required it
(ADR-0005). This is a visual migration, not a code migration.

## Atomic package and shell break

The pre-atomic packages are removed without aliases or redirects:

| Former package/API | Current destination |
| --- | --- |
| `@newui/ui` | split by component into `@newui/atoms`, `@newui/molecules`, and `@newui/organisms` |
| `@newui/blocks` | `@newui/organisms` |
| `@newui/layouts` | `@newui/templates` |
| former `AppShell` from `@newui/ui` | the new, distinct `AppShell` template from `@newui/templates` |
| `DataTable`, `VirtualList` from `@newui/data` | `@newui/organisms` |
| `ScrollTable` from `@newui/data` | `@newui/molecules` |
| `AppLayout`, `DesktopShell`, `MobileShell`, `ResponsiveShell`, rail APIs | removed; use the single responsive `AppShell` |

`AppShell` composes one sidebar model at both viewport sizes: a collapsible,
docked sidebar on desktop and the same expanded navigation in a mobile modal
drawer. Supply brand, tenant, grouped navigation, settings and account content
through its props. See [ADR-0013](./adr/0013-atomic-packages-and-app-shell.md)
and [the kit contract](./kit.md).

## Analytics visual system (next major)

Default controls use sm (28px): Button, text entry, Select, Combobox,
MultiSelect, date/time controls, Duration, ToggleGroup, Tabs, TabButtons and
Pagination. Explicit xs=24, sm=28, md=32 and lg=40 choices remain available where
documented. Set size="md" to retain the preceding 32px default. NumberInput's
fixed control is also 28px. Checkbox/radio and avatar geometry is unchanged.
Cards default to padding="sm" (12px); set padding="md" for 16px. Dialogs keep
16px padding. Heading/section/metric/hero roles now use 24/30, 18/24, 28/32 and
36/40px respectively.
TextInput, Textarea, Select, Combobox, MultiSelect, date/time controls and Duration now default to outline;
set variant="subtle" for the filled surface. Cards default to no shadow and use
10px corners; Dialog uses 12px corners. NumberCard now includes typography,
padding, border and surface styling. Role typography is additive; numbered
utilities continue to work. See visual-system.md for the shared standard.

Select now exposes description/error/required through the shared Field contract. Its label targets the visible trigger.


Chart wrappers now register their own ECharts marks and coordinate systems.
Use AreaChart/LineChart/BarChart/DonutChart and the other wrappers normally.
Consumers drawing custom options through raw ChartBase/useChart register their
required ECharts modules through `echarts.use` before mounting. The shared
lifecycle supplies SVG, tooltip and label layout. This prevents a dashboard
from downloading engines for chart kinds it never renders.

### Additional form and navigation alignment

- NumberInput and Slider accept the shared Field label/description/error/required
  contract. NumberInput step buttons are horizontal, full-height targets inside
  its 28px outline. Generated prop tables document the additive fields.
- Sidebar items use 32px rows, blue selection and an inherited count foreground.
  BottomSheet uses the shared 12px overlay radius and opaque elevated surface.
- TabButtons uses one tab stop and directional/Home/End navigation, skipping
  disabled options and respecting RTL.
- Cartesian chart wrappers register both supported bar and line engines so
  per-series bar/line/area overrides work when a wrapper is imported alone.

- Checkbox, Switch, Rating and RadioGroup also expose the shared Field contract.
  Field remains mounted with or without a label or error, preserving uncontrolled
  values and focus when validation appears. Bare controls keep their aria-label.
  Checkbox and Switch expose `checkbox-root` / `switch-root` outer hooks.
- Typography utilities now emit rem font sizes and line heights. Their computed
  default sizes are unchanged; they follow the user's root-font preference.
  Button and Badge labels can wrap, and their heights become minimum heights.
- SettingsDialog uses 32px navigation rows, 20px section titles, responsive panel
  padding and Arrow Up/Down/Home/End navigation through enabled tabs.

Menu, Dialog and Popover triggers forward native button attributes and compose
handlers with Zag. Icon-only triggers can expose `aria-label` directly. Sidebar
labels are text labels rather than fixed-level headings, avoiding heading-order
jumps when a shell is embedded below a page heading.

Generated Zag machine identities are allocated once per mounted control, keeping
trigger/content ARIA relationships stable across controlled state updates.
