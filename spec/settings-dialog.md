# SettingsDialog

`SettingsDialog` — a dialog for app settings: a sidebar of grouped tabs on the
left, the selected panel on the right. Built on the `Dialog` compound, so focus
trapping, Escape and the backdrop come from the primitive. The two-pane layout
is presentational; panel selection is a controllable value, not a new machine.

## Anatomy

`SettingsDialog` is made of small parts rather than a config object. Give each
nav item and its panel the same `value`.

```tsx
<SettingsDialog.Root open={open()} onOpenChange={setOpen} value={tab()} onValueChange={setTab}>
  <SettingsDialog.Sidebar>
    <SettingsDialog.NavGroup label="User settings">
      <SettingsDialog.NavItem value="profile" prefix={<Avatar size="xs" label="Alex Rivera" />}>
        Profile
      </SettingsDialog.NavItem>
      <SettingsDialog.NavItem value="notifications">Notifications</SettingsDialog.NavItem>
    </SettingsDialog.NavGroup>
  </SettingsDialog.Sidebar>

  <SettingsDialog.Content>
    <SettingsDialog.Panel value="profile">…</SettingsDialog.Panel>
    <SettingsDialog.Panel value="notifications">
      <SettingsDialog.Header title="Notifications" />
      <SettingsDialog.Body>
        <SettingsDialog.Row title="Email digests" description="A summary of missed activity.">
          <Switch />
        </SettingsDialog.Row>
      </SettingsDialog.Body>
    </SettingsDialog.Panel>
  </SettingsDialog.Content>
</SettingsDialog.Root>
```

- `SettingsDialog.Root` holds the open state and the selected panel `value`.
- `SettingsDialog.Sidebar`, `SettingsDialog.NavGroup` and
  `SettingsDialog.NavItem` are the navigation.
- `SettingsDialog.Content` and `SettingsDialog.Panel` are the right side, one
  panel per tab.
- `SettingsDialog.Header`, `SettingsDialog.Body` and `SettingsDialog.Row` lay
  out a panel.

The parts are also exported as flat named components (`SettingsDialog`,
`SettingsSidebar`, `SettingsNavGroup`, `SettingsNavItem`, `SettingsContent`,
`SettingsPanel`, `SettingsHeader`, `SettingsBody`, `SettingsRow`).

## Props

### SettingsDialog.Root

| prop | type | default | notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | controlled (P2) |
| `defaultOpen` | `boolean` | `false` | uncontrolled |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `value` | `string` | — | controlled selected panel id |
| `defaultValue` | `string` | — | uncontrolled |
| `onValueChange` | `(value: string) => void` | — | fires when a nav item is selected |
| `title` | `JSX.Element` | `"Settings"` | accessible dialog title, visually hidden |
| `description` | `JSX.Element` | — | accessible description, visually hidden |
| `class` | `string` | — | merged into the dialog content |

### SettingsDialog.Sidebar

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `string` | `Settings` | accessible name for the vertical tablist |
| `class` | `string` | — | merged into the sidebar |
| `children` | `JSX.Element` | — | `NavGroup`s and `NavItem`s |

### SettingsDialog.NavGroup

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `JSX.Element` | — | group heading |
| `class` | `string` | — | merged into the group |
| `children` | `JSX.Element` | — | `NavItem`s |

### SettingsDialog.NavItem

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | — | panel id it controls |
| `name` | `string` | — | alias for `value` |
| `active` | `boolean` | — | explicit selected state; omit to derive it from the dialog `value` |
| `prefix` | `JSX.Element` | — | leading icon or avatar |
| `suffix` | `JSX.Element` | — | trailing badge / count |
| `disabled` | `boolean` | `false` | |
| `class` | `string` | — | merged into the item |
| `children` | `JSX.Element` | — | item label |

### SettingsDialog.Content

| prop | type | default | notes |
| --- | --- | --- | --- |
| `class` | `string` | — | merged into the column |
| `children` | `JSX.Element` | — | `Panel`s |

### SettingsDialog.Panel

| prop | type | default | notes |
| --- | --- | --- | --- |
| `value` | `string` | — | must match the nav item that controls it |
| `name` | `string` | — | alias for `value` |
| `class` | `string` | — | merged into the panel |
| `children` | `JSX.Element` | — | a `Header` and a `Body` |

### SettingsDialog.Header

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | — | convenience heading |
| `description` | `JSX.Element` | — | sub-heading under the title |
| `actions` | `JSX.Element` | — | right-aligned actions |
| `class` | `string` | — | merged into the header |
| `children` | `JSX.Element` | — | replaces the whole default header |

### SettingsDialog.Body

| prop | type | default | notes |
| --- | --- | --- | --- |
| `class` | `string` | — | merged into the scrolling region |
| `children` | `JSX.Element` | — | panel content |

### SettingsDialog.Row

| prop | type | default | notes |
| --- | --- | --- | --- |
| `title` | `JSX.Element` | required | setting name, on the left |
| `description` | `JSX.Element` | — | helper text under the title |
| `labelFor` | `string` | — | id the title `<label>` points at; overrides auto-detection |
| `class` | `string` | — | merged into the row |
| `children` | `JSX.Element` | — | the control, on the right |

## Behavior

### Selected panel

The selected panel is the `value` of a nav item, not a separate `active` flag.
`value` / `onValueChange` on the root are optional: bind them to drive the
selection yourself (for example from a `/settings/:tab` URL) or leave them
unbound and the dialog tracks the selection internally. A `NavItem` and its
`Panel` share one `value`; clicking a nav item moves the dialog's value and
reports it through `onValueChange`.

### Geometry

- Desktop content has a stable width (`min(56rem, 100vw - 2rem)`) across panels;
  switching tabs never resizes the dialog or moves the close control.
- Below `sm`, the panel is genuinely full-bleed (`fixed inset-0`) rather than
  inset inside the positioner's gutter. Navigation rows and the close control
  use the 40px touch scale.
- The sidebar uses a logical inline border so RTL keeps the divider between the
  panes.

### Panels stay mounted

Every panel is rendered, and the inactive ones carry `data-state="inactive"`
plus the `hidden` attribute (and `data-[state=inactive]:hidden` so the `flex`
utility cannot reveal them). Keeping them mounted preserves their state and
scroll position across switches.

### Panel header and body

Put a `SettingsHeader` and a `SettingsBody` in each `SettingsPanel`. The header
stays in place and the body scrolls, so titles, search inputs and column headers
never scroll away. `SettingsHeader` takes `title`, `description` and `actions`,
or any content in its default slot.

### Setting rows

`SettingsRow` shows a setting's title and description on the left and its
control on the right. The title becomes a `<label>` pointing at the control's id
when one is detected (a `[data-slot="control"]`, `[role="switch"]`,
`[role="checkbox"]`, `input`, `select` or `textarea` inside the row), so a
a control such as `Switch` needs no wiring. Set `labelFor` to point the
label at another element's id.

## Accessibility

The dialog is a tab set: the sidebar is the `tablist`
(`aria-orientation="vertical"`), each nav item is a `tab` with `aria-selected`
and `aria-controls`, and each panel is a `tabpanel` with `aria-labelledby`. The
inactive tab is not tabbable (`tabindex="-1"`). Arrow Up/Down move and select
the previous/next enabled tab, wrapping through the full sidebar; Home/End
select the first/last enabled tab. Settings controls use the 32px density,
section headings and responsive 16/24px panel padding. The dialog has a visually hidden
title (`"Settings"`) and description; replace them with the `title` /
`description` props.

Focus trapping, Escape and outside-click dismissal come from `Dialog` — this
family does not reimplement them.

## Styling hooks

`data-slot` on every part (`settings-sidebar`, `settings-nav-group`,
`settings-nav-group-label`, `settings-nav-item`, `settings-nav-item-prefix`,
`settings-nav-item-suffix`, `settings-content`, `settings-panel`,
`settings-header`, `settings-header-title`, `settings-header-description`,
`settings-header-actions`, `settings-body`, `settings-row`,
`settings-row-title`, `settings-row-description`, `settings-row-control`), plus
`data-state` (`active` / `inactive`) on the nav item and panel, and `disabled` on
the nav item.

## Exports

`SettingsDialog` (compound: `Root`, `Sidebar`, `NavGroup`, `NavItem`, `Content`,
`Panel`, `Header`, `Body`, `Row`), the flat parts `SettingsSidebar`,
`SettingsNavGroup`, `SettingsNavItem`, `SettingsContent`, `SettingsPanel`,
`SettingsHeader`, `SettingsBody`, `SettingsRow`, and the types
`SettingsDialogProps`, `SettingsSidebarProps`, `SettingsNavGroupProps`,
`SettingsNavItemProps`, `SettingsContentProps`, `SettingsPanelProps`,
`SettingsHeaderProps`, `SettingsBodyProps`, `SettingsRowProps`.
