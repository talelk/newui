# Design deltas — display & layout

A visual/design parity audit of the **display and layout** components in
`@newui/ui` against the frappe-ui reference (`frappe-ui-main/src/components/`).
This is an analysis document: no component code was changed to produce it.

Method: for each component the class recipe in
`packages/ui/src/components/<Name>/` was compared **axis by axis** with the
frappe-ui class map (`<Name>.vue`, and for the shells `Sidebar/`,
`SidebarRail/`, `DesktopShell/`, `MobileShell/`, `MobileNav/`, `PageHeader/`,
`TabButtons/`, `Tabs/`, plus `shared/tabs/styles.ts`). Every row quotes the
exact classes.

## Classification key

| classification | meaning |
| --- | --- |
| `match` | the rendered utility is the same (allowance: `size-4` ≡ `w-4 h-4`, `border-t` ≡ `border-t-[1px]`) |
| `intentional` | explained by the WCAG AA contrast shift (`spec/adr/0005-contrast-driven-color-shifts.md`) or by the identical type scale |
| `unintended` | not explained by either — flagged |
| `ours-only` | our component/feature has no frappe-ui counterpart to compare against |

### Intentional colour shifts (ADR 0005)

frappe-ui predates a systematic contrast pass. Our recipes shift:

- coloured **solid fills**: `surface-<theme>-8` (amber `-9`) where frappe uses `-7`;
- coloured **subtle/outline/ghost text**: `ink-<theme>-8` where frappe uses `-7`;
- **muted text on base**: `ink-gray-6`;
- solid-fill label: `text-ink-base` in place of frappe's `text-white`.

Rows matching that pattern are `intentional`. The **type scale is identical**
(`text-sm` = 13px, `text-base` = 14px, `text-lg` = 16px, …), so a size delta is
only real when the *class* differs (e.g. `tracking-*`, `leading-*`, a weight
utility).

---

## Prop surface / size-set differences

These components differ in their **size set or prop surface** (not just classes):

| component | ours | frappe-ui |
| --- | --- | --- |
| Badge | `theme` × `variant` × size `sm`/`md`/`lg` | same set — **no difference** |
| Avatar | sizes `xs…3xl` (identical set) | same sizes; adds an `#indicator` slot + per-size indicator/icon boxes, and drops the enum size when a sizing utility is passed via `class` |
| Alert | one `action`; `title`/`description`/`icon`/`dismissible` | `primaryAction` **and** `secondaryAction`; `#actions`/`#prefix`/`#title`/`#description` slots |
| Divider | `label` (rules + label) | `action` (Button on the rule) — no `label` |
| Progress | `value` (optional) + `indeterminate`; fixed `h-1.5` | `value` (required) + `size` `sm`/`md`/`lg`/`xl` + `label`/`hint`/`intervals` |
| Skeleton | `lines` prop; fixed `h-4` bars | no props; a single block sized by `class` |
| Spinner | sizes `xs`/`sm`/`md`/`lg` (identical) + `track` | same sizes; adds `theme` `gray`/`red` |
| LoadingText | `children` | `text` prop (default `Loading...`) |
| Icon | `icon`/`name`, no emoji strings | `icon`/`name`, **plus emoji-string** rendering |
| Sidebar | `width` only (default `14rem`) | `width` (default `15rem`), `collapsedWidth` (`3rem`), `collapsible`, `ariaLabel`, `v-model:collapsed` |
| SidebarRail | width `w-11` (44px) | width `w-[50px]` |
| SidebarHeader | `title`/`subtitle`/`actions` | `title`/`subtitle`/`logo`/`menuItems`/`showLogo` + `#prefix` |
| SidebarItem | `active`/`prefix`/`suffix`/`onClick` | `active`/`route`/`href`/`label`/`icon`/`suffix`/`tooltip` + collapse awareness |
| SidebarLabel | children only | `divider` prop (collapsed divider) |
| TabButtons | `options`/`value`/`defaultValue`/`onValueChange`/`fluid` | adds `variant` (subtle/ghost/underline/browser-tab) × `size` (sm/md) × `vertical` × `edge`; `modelValue`; `#prefix`/`#suffix` |
| Tabs | `value`/`defaultValue`/`onValueChange`/`orientation`/`activationMode`; no variants | `variant` × `size` × `edge`, `vertical`, route mode, shorthand `tabs` + `#tab-*` slots |
| MobileNavItem | `route`/`href`/`active`/`onClick` | adds `aria-current`, current-route scroll-to-top |
| ItemListRow | adds `type`/`href` props | `#prefix`/`#label`/`#suffix` slots |
| **ours-only** | `Card`, `List` (+`ListRow`/`ListCell`/`ListHeader`), `PageBody`, `AppShell` (as a distinct name) | no frappe counterpart |

---

## Badge

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| base | `inline-flex select-none items-center gap-1 overflow-clip whitespace-nowrap rounded-full` | same **+ `leading-tighter`** | unintended |
| size sm | `h-4 px-1.5 text-xs` | `h-4 px-1.5 text-xs` | match |
| size md | `h-5 px-1.5 text-xs` | `h-5 px-1.5 text-xs` | match |
| size lg | `h-6 px-2 text-sm tracking-[0.02em]` | `h-6 px-2 text-[13px] tracking-[0.02em]` | match (`text-sm` = 13px; `tracking-[0.02em]` confirmed) |
| icon box | `size-3` (lg) / `size-2.5` | `size-3` / `size-2.5` | match |
| gray solid | `text-ink-base bg-surface-gray-10` | `text-ink-base bg-surface-gray-10` | match |
| gray subtle | `text-ink-gray-6 bg-surface-gray-2` | `text-ink-gray-6 bg-surface-gray-2` | match |
| gray outline | `text-ink-gray-6 border border-outline-gray-2` | same | match |
| gray ghost | `text-ink-gray-6` | `text-ink-gray-6` | match |
| coloured solid | `text-ink-base bg-surface-<theme>-8` (amber `-9`) | `text-white bg-surface-<theme>-7` | intentional (ADR 0005) |
| coloured subtle | `text-ink-<theme>-8 bg-surface-<theme>-2` | `text-ink-<theme>-7 bg-surface-<theme>-2` | intentional |
| coloured outline | `text-ink-<theme>-8 border border-outline-<theme>-3` | `text-ink-<theme>-7 …` | intentional |
| coloured ghost | `text-ink-<theme>-8` | `text-ink-<theme>-7` | intentional |

**Badge `lg` confirmed**: our `tracking-[0.02em]` now matches frappe's, and
`text-sm` is the same 13px as frappe's `text-[13px]`.

---

## Avatar

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| sizes | `size-4`/`size-5`/`size-6`/`size-7`/`size-8`/`size-10`/`size-11.5` | `w-4 h-4` … `w-11.5 h-11.5` | match |
| shape circle | `rounded-full` | `rounded-full` | match |
| shape square radii | `rounded-[4px]`…`rounded-[10px]` | identical map | match |
| label size | `text-2xs`/`text-sm`/`text-base`/`text-base`/`text-lg`/`text-2xl`/`text-3xl` | identical map | match |
| label weight | `font-medium` | `font-medium` | match |
| gray fallback text | `text-ink-gray-6` | `text-ink-gray-5` | intentional (ADR: muted text = `ink-gray-6`) |
| coloured fallback text | `text-ink-<theme>-7` | `text-ink-<theme>-7` | match |
| fallback bg | `bg-surface-<theme>-2` | `bg-surface-<theme>-2` | match |
| root | `relative inline-block shrink-0` | same | match |
| default-slot icon | children rendered directly in the fallback | wrapped in a per-size `iconClasses` box (`h-2.5 w-2.5` … `h-5 w-5`) | unintended |
| indicator | none | `#indicator` slot + per-size container/dot classes | ours-only (gap) |
| class size override | enum size always applied | enum dropped when a `size-*`/`w-*` utility is passed | unintended |

---

## Alert

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| container | `flex gap-2 rounded-5 p-3` | `rounded-6 bg-surface-gray-1` | unintended (radius + bg model) |
| row layout | `items-center` + `p-3` | `flex h-10 items-center py-1.5 pl-3.5 pr-1.5` | unintended (height/padding) |
| banner layout | `items-start` + `p-3` | `relative p-3` | match (padding) / unintended (positioning) |
| theme colour | tints the container: `bg-surface-<theme>-2`, `border-outline-<theme>-3`, text `ink-<theme>-8` | container is always `bg-surface-gray-1`; only the icon (`ink-<theme>-5`) and action label carry theme colour | unintended |
| title | `text-base-medium` | `text-base-medium text-ink-gray-8` | unintended (ours inherits container colour) |
| description | `text-sm opacity-90` | `text-p-base text-ink-gray-6` | unintended |
| icon | `Icon class="size-4 shrink-0"` (`mt-0.5` when banner) | `size-4` box, glyph coloured `ink-<theme>-5` | unintended |
| action | `Button size="sm" variant="outline" theme=<theme>` | row: ghost/sm; banner: primary outline-gray/md + secondary ghost-gray/md | unintended |
| dismiss | custom `<button>` `lucide-x size-3.5`, `-m-1 … rounded-3 p-1 … opacity-70` | `Button` ghost/gray `size="sm"` (row) or `"xs"` (banner), `icon="lucide-x"` | unintended |
| role | `red` → `alert`, else `status` | `red` **or `amber`** → `alert`, else `status` | unintended |
| default theme/variant | gray / subtle | gray / (container gray) | match |

---

## Card

Our component only. frappe-ui has no `Card`. No counterpart → **`ours-only`**.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| root | `flex flex-col rounded-6 border border-outline-gray-1 bg-surface-elevation-1 text-ink-gray-9` | — | ours-only |
| elevation | `none`/`shadow-sm`/`shadow-base`/`shadow-md`/`shadow-lg` | — | ours-only |
| padding | `none`/`p-3`/`p-4`/`p-5` | — | ours-only |
| title / description / content / footer | `text-lg-medium text-ink-gray-9` / `text-sm text-ink-gray-6` / `text-base text-ink-gray-8` / `mt-4 flex items-center gap-2` | — | ours-only |

---

## Divider

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| plain rule | `m-0 border-0 border-outline-gray-2` + `w-full border-t` / `h-full border-l` | `border-0 border-outline-gray-2` + `border-t-[1px] w-full` / `border-l-[1px]` + `h-full` | match |
| flexItem | `self-stretch` | `self-stretch h-auto` | match |
| labelled divider | `label` prop → two `<hr>` + `span.text-xs text-ink-gray-6` | no `label` | ours-only |
| action divider | none | `action` prop → `Button` (outline/sm) on the rule | ours-only (gap) |
| align | start/center/end | start/center/end (only with `action`) | match |

---

## List (+Row/Cell/Header) & ItemListRow

Our `List` family is new: frappe-ui has no `List`. No counterpart →
**`ours-only`** for `List`, `ListRow`, `ListCell`, `ListHeader`,
`ListHeaderCell` (`flex flex-col gap-0.5`; row `grid … gap-3 rounded-5 px-2`,
`hover:bg-surface-gray-2`, active `data-[active]:bg-surface-gray-3`).

`ItemListRow` **does** have a counterpart:

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| base | `flex w-full items-center gap-2 rounded-4 transition-colors` | same | match |
| size xs | `min-h-6 px-1.5 py-1 text-xs` | same | match |
| size sm | `min-h-7 px-2 py-1.5 text-base` | same | match |
| size md | `min-h-8 px-2.5 py-1.5 text-base` | same | match |
| size lg | `min-h-10 px-3 py-2 text-lg` | same | match |
| state inactive | `text-ink-gray-7` | `text-ink-gray-7` | match |
| state active | `bg-surface-gray-3 text-ink-gray-8` | `bg-surface-gray-3 text-ink-gray-8` | match |
| disabled | `cursor-not-allowed text-ink-gray-4` | same | match |
| label | `min-w-0 flex-1 leading-tighter` | same | match |
| default size | `sm` | `sm` | match |

---

## Progress

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| track height | `h-1.5` (fixed) | `sm h-[2px]` / `md h-1` / `lg h-2` / `xl h-3` | unintended |
| track radius | `rounded-full` | `rounded-7` | unintended |
| track bg | `bg-surface-gray-3` | `bg-surface-gray-2` | unintended |
| fill | `bg-surface-blue-6` | `bg-surface-gray-10` | unintended |
| fill animation | `transition-[width] duration-200` | `transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]` | unintended |
| label / hint | none | `text-base-medium text-ink-gray-8` label + `ink-gray-4` hint row | ours-only (gap) |
| intervals | none | segmented track (`bg-surface-gray-10` / `bg-surface-gray-2`) | ours-only (gap) |
| indeterminate | supported | not offered | ours-only |

---

## Skeleton

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| root | `flex w-full flex-col gap-2` | single block, no wrapper | unintended |
| bar | `h-4 w-full animate-pulse rounded-3 bg-surface-gray-3` | `animate-pulse bg-surface-gray-3` (no fixed size/radius) | unintended |
| `lines` | supported | not offered | ours-only |
| aria-hidden | `aria-hidden="true"` | `aria-hidden="true"` | match |

---

## Spinner & LoadingText

### Spinner

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size xs | `size-3 border-[1.5px]` (12px) | 12px / 1.5px | match |
| size sm | `size-3.5 border-2` (14px) | 14px / 2px | match |
| size md | `size-4 border-2` (16px) | 16px / 2px | match |
| size lg | `size-5 border-2` (20px) | 20px / 2px | match |
| default size | `size-4 border-2` | svg 16px | match |
| track | `border-current/15 border-t-current` | `color-mix(currentColor 15%, transparent)` | match |
| theme | inherits current text colour | `theme` → `text-ink-gray-8` (gray) / `text-ink-red-7` (red) | ours-only (gap) |
| reduced motion | none (`animate-spin`) | slows to `1.6s` under `prefers-reduced-motion` | unintended |
| implementation | border-arc `<span>` | svg conic-gradient + mask | intentional (impl only) |

### LoadingText

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| container | `inline-flex items-center gap-2` | `flex items-center text-base text-ink-gray-4` | unintended |
| spinner | `<Spinner size="sm" />` (14px) | `Spinner class="-ml-1 mr-2 h-3 w-3"` (12px) | unintended |
| text | `children` | `text` prop, default `Loading...` | ours-only (gap) |

---

## Icon

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| lucide string | `span` with the icon class **+ `size-4 shrink-0`** | `span` with the icon class only | unintended (default size) |
| component | `Dynamic` with `size-4` + `class` | `Dynamic` with `$attrs` only | unintended (default size) |
| emoji string | not handled | `inline-flex items-center justify-center leading-none` | ours-only (gap) |
| `name` alias | supported | supported | match |
| `aria-hidden` | `aria-hidden="true"` | `aria-hidden="true"` | match |

---

## Sidebar & SidebarRail

### Sidebar

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| element | `<aside>` | `<nav>` (landmark) | unintended |
| width | `14rem` | `15rem` | unintended |
| background | `bg-surface-base` | `bg-surface-sidebar` | unintended |
| border | `border-r border-outline-gray-1` | none | unintended |
| collapse | none | `collapsible` + `collapsedWidth: 3rem` + `transition-[width] duration-300` | ours-only (gap) |
| root layout | `flex h-full shrink-0 flex-col` | `flex h-full flex-shrink-0 flex-col overflow-x-hidden` | unintended (missing `overflow-x-hidden`) |

### SidebarHeader

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| container | `flex items-center justify-between gap-2 px-3 py-2.5` | `flex h-12 shrink-0 items-center px-1` | unintended |
| title | `text-base-medium leading-tighter text-ink-gray-9` | `text-base-medium leading-tighter text-ink-gray-8` | unintended |
| subtitle | `text-sm text-ink-gray-6` | `mt-0.5 truncate text-sm leading-tighter text-ink-gray-6` | unintended (ours omits `mt-0.5`/`leading-tighter`/`truncate`) |
| logo box | none | `size-7 rounded-[6px]` | ours-only (gap) |
| menu | `actions` element | `menuItems` + chevron dropdown | ours-only (gap) |

### SidebarLabel

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| label | `px-2 text-xs font-medium text-ink-gray-6` | `relative flex h-7 items-center pl-2` + `text-base leading-tighter text-ink-gray-5` | unintended |
| collapsed divider | none | `divider` prop | ours-only (gap) |

### SidebarItem

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| row | `flex h-7 w-full items-center gap-2 rounded-4 px-2 text-start text-sm text-ink-gray-7` | `flex h-7 items-center rounded-4` (inner control `pl-2`) | unintended (padding/colour placement) |
| inactive | `text-ink-gray-7`, hover `hover:bg-surface-gray-2` | `text-ink-gray-6 hover:bg-surface-gray-2` | unintended (one step darker) |
| active | `bg-surface-gray-2 font-medium text-ink-gray-9` | `bg-surface-elevation-3 text-ink-gray-8 shadow-sm` | unintended |
| prefix | `text-ink-gray-6` | icon `size-4 text-ink-gray-6` | match |
| route/tooltip/collapse | `onClick` only | `route`/`href`/`tooltip`/collapsed label + tooltip | ours-only (gap) |

### SidebarRail

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| width | `w-11` (44px) | `w-[50px]` | unintended |
| background | `bg-surface-base` | `bg-surface-sidebar` | unintended |
| border | `border-r border-outline-gray-1` | none | unintended |
| padding / gap | `py-2`, `gap-2` | `px-[11px] pb-3 pt-2.5`, no gap | unintended |
| tooltip provider | none | `TooltipProvider` (instant hover) | ours-only (gap) |

### SidebarRailItem

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| cell | `grid size-7 place-items-center rounded-4 text-ink-gray-6 transition-colors` | `relative flex size-7 … rounded-[7px]` (subtle) / `rounded-4` (ghost), `text-base` | unintended |
| subtle bg | ours has one variant: transparent → active `bg-surface-gray-3` | subtle: `bg-surface-gray-3` (inactive) / `bg-surface-gray-4` (active) | unintended |
| ghost bg | n/a | active `!bg-surface-elevation-3 shadow-sm text-ink-gray-8` / inactive `bg-transparent hover:bg-surface-gray-3` | ours-only (gap) |
| active text | `text-ink-gray-9` | `text-ink-gray-8` | unintended |
| active indicator | none | `h-7 w-1 rounded-r-4 bg-surface-gray-8` bar | ours-only (gap) |
| badge | none | `SidebarRailItemBadge` (count/dot) | ours-only (gap) |

---

## AppShell / DesktopShell / PageHeader / PageBody

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| shell root | `flex h-full w-full overflow-hidden bg-surface-base text-ink-gray-9` | `flex h-full` | unintended |
| content column | `flex min-w-0 flex-1 flex-col` | `flex min-w-0 flex-1 flex-col overflow-hidden` | unintended (missing `overflow-hidden`) |
| `scroll` axis | `scroll` default `true`; `overflow-y-auto` / `overflow-hidden` | `scroll` default `true`; `ScrollArea` / `overflow-hidden` | match (ours uses native scroll) |
| pinned header | inline; not teleported | `PageHeaderTarget` teleport | intentional (`spec/desktop-shell.md` — documented as not ported) |
| PageHeader container | `z-10 flex shrink-0 items-center justify-between gap-2 border-b border-outline-gray-1 bg-surface-base/85 px-4 py-2 backdrop-blur` | `z-10 flex min-h-12 flex-col justify-center border-b bg-surface-base px-3 sm:px-5` | unintended |
| PageHeaderTitle | `text-lg-medium leading-tighter text-ink-gray-9` | `truncate text-lg font-semibold text-ink-gray-9` | unintended (weight 500 vs 600; no `truncate`) |
| PageBody | `min-h-0 flex-1 overflow-y-auto` + inner `mx-auto w-full px-4 py-4 max-w-[940px]` | no counterpart | ours-only |

---

## MobileShell / MobileNav / PageHeaderMobile

### MobileShell

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| root | `fixed inset-0 flex touch-none flex-col overflow-hidden bg-surface-base text-ink-gray-9` + standalone height | `fixed inset-0 flex touch-none flex-col overflow-hidden` + standalone height | unintended (ours adds bg + text colour) |
| header region | `shrink-0` + standalone `pt-[env(safe-area-inset-top)]` | `PageHeaderTarget` + standalone `pt` | match |
| scroll region | `flex-1 overflow-y-auto overscroll-auto bg-surface-base` | same **+ `[-webkit-overflow-scrolling:touch]`** | unintended (missing class) |
| nav region | slot | slot | match |

### PageHeaderMobile

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| container | `relative z-10 flex h-13 shrink-0 items-center border-b border-outline-gray-1 bg-surface-base px-3` | `z-10 flex h-[52px] flex-col justify-center border-b bg-surface-base px-3` | match (`h-13` = 52px) |
| title | `w-full min-w-0 truncate px-12 text-center text-xl-semibold text-ink-gray-9` | `mx-[inset] min-w-0 flex-1 truncate text-center text-xl-semibold leading-tight text-ink-gray-9` | unintended (fixed `px-12` vs measured inset; no `leading-tight`) |
| prefix / suffix | `absolute inset-y-0 start-3` / `end-3` | `absolute start-0` / `end-0 top-1/2 max-w-[35%] -translate-y-1/2` | unintended (positioning model) |

### MobileNav

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| nav frame | `grid shrink-0 auto-cols-fr grid-flow-col border-t border-outline-gray-2 bg-surface-elevation-2` + standalone pb | identical | match |

### MobileNavItem

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| item | `flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-ink-gray-5 transition active:scale-95 data-[state=active]:text-ink-gray-8 focus-visible:ring-2 …` | `flex min-h-14 flex-col items-center justify-center gap-1 py-2 transition active:scale-95` | unintended (colour on root vs icon/label; extra focus ring) |
| icon | `Icon class="size-6"` | `size-6`, coloured active `ink-gray-8` / inactive `ink-gray-5` | match |
| label | `text-xs-medium` | `text-xs-medium leading-tighter` | unintended (missing `leading-tighter`) |
| current-route | `active` only | `aria-current` + scroll-to-top on current | ours-only (gap) |

---

## TabButtons

frappe-ui's `TabButtons` is a full segmented-control system (RadioGroup + sliding
indicator). Ours is the subtle/sm shape only.

| axis | ours | frappe-ui (subtle, sm) | classification |
| --- | --- | --- | --- |
| track | `inline-flex items-center gap-0.5 rounded-5 bg-surface-gray-2 p-0.5` | `bg-surface-gray-2 gap-1 p-px rounded-4` | unintended |
| button shell | `inline-flex min-h-7 items-center rounded-4 px-2.5 text-sm text-ink-gray-6` | `h-6.5 gap-2 px-2 py-[5px] text-sm leading-[16.1px] text-ink-gray-5` | unintended |
| hover | `hover:text-ink-gray-8` | `hover:text-ink-gray-8` | match |
| active | `data-[active]:bg-surface-base data-[active]:text-ink-gray-9 data-[active]:shadow-sm` | indicator `bg-surface-elevation-3 shadow-base`; pill active `text-ink-gray-8` | unintended |
| indicator | static background | animated sliding indicator (`duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]`) | ours-only (gap) |
| variants/sizes/vertical/edge | none | `variant` × `size` × `vertical` × `edge` | ours-only (gap) |

---

## Tabs

frappe-ui's `Tabs` defaults to the `underline` variant with a sliding 1px
indicator. Ours is a fixed horizontal/vertical style.

| axis | ours | frappe-ui (underline, sm) | classification |
| --- | --- | --- | --- |
| root | `flex flex-col` + vertical `flex-row gap-4` | `flex flex-col data-[orientation=vertical]:flex-row` | unintended (ours adds `gap-4`) |
| list | `flex items-center gap-1` + `border-b border-outline-gray-1` | `gap-6 border-b border-outline-gray-1` | unintended (gap 4px vs 24px) |
| trigger | `px-3 py-1.5 text-base text-ink-gray-6` | `h-7 gap-2 px-0 text-base leading-tighter text-ink-gray-5` | unintended |
| trigger hover | `hover:text-ink-gray-8` | `hover:text-ink-gray-8` | match |
| trigger selected | `data-[selected]:text-ink-gray-9` | `text-ink-gray-8` | unintended |
| underline | `-mb-px border-b-2 border-transparent data-[selected]:border-surface-gray-9` | 1px indicator `bg-[var(--outline-gray-8)]` | unintended |
| vertical trigger | `rounded-4 data-[selected]:bg-surface-gray-2` | vertical pill, indicator carries the active surface | unintended |
| content / panel | `pt-3` | no padding | unintended |
| disabled | `data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4` | `disabled:opacity-60 disabled:pointer-events-none` | unintended |
| variants/sizes/edge | none | `variant` × `size` × `edge` | ours-only (gap) |

---

## Unintended deltas to fix

Ordered by likely visual impact:

1. **Badge** — base is missing `leading-tighter` (line-height differs from frappe-ui).
2. **Avatar** — default-slot content is not wrapped in a per-size icon box; no `#indicator` slot; a `size-*` class does not override the enum size.
3. **Alert** — theme tints the whole container (`bg-surface-<theme>-2` / `border-outline-<theme>-3`) instead of only the icon; row geometry is `p-3` rather than `h-10 py-1.5 pl-3.5 pr-1.5`; `rounded-5` vs `rounded-6`; `amber` is not `role="alert"`; description is `text-sm opacity-90` vs `text-p-base text-ink-gray-6`; dismiss is a custom button vs `Button` ghost.
4. **Progress** — fixed `h-1.5` / `rounded-full` / `bg-surface-gray-3` track and `bg-surface-blue-6` fill vs frappe's `size` set, `rounded-7`, `bg-surface-gray-2` track and `bg-surface-gray-10` fill; no `label`/`hint`/`intervals`.
5. **Skeleton** — fixed `h-4`/`rounded-3`/`gap-2` bars and a `lines` prop vs frappe's class-sized single block.
6. **Spinner** — no reduced-motion handling (`animate-spin` vs frappe's slowed `1.6s`); no `theme` prop.
7. **LoadingText** — missing `text-base text-ink-gray-4`; spinner is `size="sm"` (14px) vs frappe's `h-3 w-3` (12px) with `-ml-1 mr-2`.
8. **Icon** — injects a default `size-4 shrink-0` where frappe has none; no emoji-string support.
9. **Sidebar** — `<aside>` vs `<nav>`, `14rem` vs `15rem`, `bg-surface-base` vs `bg-surface-sidebar`, extra `border-r`, no collapse.
10. **SidebarHeader** — `px-3 py-2.5` vs `h-12 px-1`; title `text-ink-gray-9` vs `-8`; no logo box.
11. **SidebarLabel** — `text-xs font-medium text-ink-gray-6` vs `text-base text-ink-gray-5`.
12. **SidebarItem** — inactive `text-ink-gray-7` vs `-6`; active `bg-surface-gray-2 font-medium text-ink-gray-9` vs `bg-surface-elevation-3 shadow-sm text-ink-gray-8`.
13. **SidebarRail** — `w-11`/`border-r`/`bg-surface-base`/`py-2`/`gap-2` vs `w-[50px]`/`bg-surface-sidebar`/`px-[11px] pt-2.5 pb-3`.
14. **SidebarRailItem** — `rounded-4` vs `rounded-[7px]`; active model differs; no indicator bar, badge or `variant`.
15. **AppShell** — root adds `w-full bg-surface-base text-ink-gray-9`; content column missing `overflow-hidden`.
16. **PageHeader** — `px-4 py-2` + `bg-surface-base/85 backdrop-blur` vs `min-h-12 px-3 sm:px-5` + solid `bg-surface-base`.
17. **PageHeaderTitle** — `text-lg-medium` (500) vs `text-lg font-semibold` (600); no `truncate`.
18. **PageHeaderMobile** — hardcoded `px-12` vs a measured title inset; no `leading-tight`; prefix/suffix `start-3`/`end-3` vs `start-0`/`end-0 max-w-[35%]`.
19. **MobileShell** — root adds `bg-surface-base text-ink-gray-9`; scroll region missing `[-webkit-overflow-scrolling:touch]`.
20. **MobileNavItem** — label missing `leading-tighter`.
21. **TabButtons** — subtle/sm track (`gap-0.5`/`rounded-5`/`p-0.5` vs `gap-1`/`rounded-4`/`p-px`) and pill (`min-h-7`/`px-2.5`/`rounded-4`/`text-ink-gray-6` vs `h-6.5`/`px-2`/`rounded-[7px]`/`text-ink-gray-5`); active `bg-surface-base` vs `bg-surface-elevation-3`.
22. **Tabs** — list `gap-1` vs `gap-6`; underline `border-b-2 border-surface-gray-9` vs a 1px `outline-gray-8` indicator; trigger `text-ink-gray-6` vs `-5`; selected `text-ink-gray-9` vs `-8`; content `pt-3` vs no padding.
