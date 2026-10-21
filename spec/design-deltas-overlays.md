# Design deltas — action & overlay components

> Historical Frappe comparison from before the analytics redesign. The current
> [visual-system contract](visual-system.md) and component contracts supersede
> the old density, radius and colour targets below. The original comparison is
> retained as reference evidence.
> Package paths below predate the atomic split; see current component contracts.

A visual/design parity audit of the action/overlay family: **Button, Dropdown,
Menu, ContextMenu, Dialog, BottomSheet, Popover, HoverCard, Tooltip, Toast,
Breadcrumbs, KeyboardShortcut, KeyboardShortcutsDialog, SettingsDialog, Tree**.

Method: for each component we read our recipe/TSX class strings and frappe-ui's
class maps (`frappe-ui-main/src/components/<Name>/…`) and compared them axis by
axis — size, variant/theme colour, state (hover/active/pressed/disabled/focus),
spacing, radius, shadow and structure. The reference is read-only.

## Classification legend

| class | meaning |
| --- | --- |
| `match` | identical utilities (notation may differ, e.g. `text-lg-semibold` vs `text-lg font-semibold`) |
| `intentional` | explained by a known, deliberate divergence (contrast shift, compound-vs-config structure) |
| `unintended` | not explained by the rules below — a visual delta to fix |

Two repo-wide rules are treated as **intentional**:

1. **WCAG-AA colour shift.** Our scales move solid/subtle text one step darker
   than frappe-ui (`ink-<theme>-8` / `surface-<theme>-8`, amber `-9`) where
   frappe uses `-5/7`. Asserted by `packages/tailwind/src/contrast.test.ts`
   ("WCAG AA in both themes … a pairing that fails is a legibility bug"). Also
   covers `text-ink-base` on solid fills and the disabled tones.
2. **Identical type scale.** `text-sm`=13px, `text-base`=14px, `text-lg`=16px,
   `text-xs-medium` / `text-base-medium` / `text-lg-semibold` / `text-2xl-semibold`
   … resolve to the same sizes/weights in both libraries. A typography delta is
   only real where the **class differs** (e.g. `text-xl-semibold` vs
   `text-3xl-semibold`).

Structural choices already agreed as **intentional**: `Dropdown` is
options-based and composes `Menu`; `BottomSheet` uses the `dialog` machine, not
frappe's reka dialog; every overlay is a Solid compound over a Zag machine where
frappe is a config-object Vue component.

Radii use the same scale in both libraries (`rounded-3`=6px, `rounded-4`=8px,
`rounded-5`=10px, `rounded-6`=12px, `rounded-7`=16px), so a named-radius
difference is a real delta. `surface-elevation-1` and `surface-elevation-2` are
both white in light mode but differ in dark (`0.239` vs `0.26`), so a
`-1`↔`-2` swap is a dark-mode-only delta.

---

## 1. Size set / prop surface differences (summary)

| component | ours | frappe-ui | note |
| --- | --- | --- | --- |
| Button | theme `gray\|blue\|green\|red`, size `xs\|sm\|md\|lg`, variant `solid\|subtle\|outline\|ghost` | **same** theme/size/variant sets | no `amber`; sets match |
| Button | props: no `tooltip`, no `route`; adds `target`, `prefix`/`suffix` **props** | `tooltip`, `route`; prefix/suffix as **slots** | prop surface differs |
| Dropdown | `options`, `children`, `onSelect`, `class` | `options`, `button`, `side`, `align`, `offset`, `portalTo`, `matchTriggerWidth`, … | ours minimal/options-only (intentional) |
| Menu | compound `Root/Trigger/Content/Item/Separator/ItemGroup/Label` | options+groups: submenu, switch, `selected`, `description`, slot fns | surface differs (intentional) |
| ContextMenu | compound, same vocabulary as `Menu` | options-based, same `Menu` groups | surface differs (intentional) |
| Dialog | compound `Root/Trigger/Content/Header/Title/Description/Footer/Close`; **no** `size`, `position`, `theme`, `icon`, `bare`, `dismissible`, `actions` | config object with `size` (xs…7xl), `position`, `theme` (`amber\|blue\|red\|green`), `icon`, `bare`, `dismissible`, `actions`, `title`, `message` | largest prop-surface gap; no `theme`/`icon` in ours |
| BottomSheet | `open/defaultOpen/onOpenChange/title/dismissible/class` | `open`, `title`, `dismissible`; adds swipe-down drag | ours: no swipe gesture (documented "Not yet") |
| Popover | compound `Root/Trigger/Content/Title/Description/Close` | `side`, `align`, `offset`, `collisionPadding`, `dismissible`, `autoFocus`, `trigger`, `matchTriggerWidth`, `bare`, `arrow`, `reference` | ours lacks placement/bare/arrow-toggle; **arrow always rendered** |
| HoverCard | `openDelay` (600) / `closeDelay` (200) | `hoverDelay` (300) / `leaveDelay` (300); `side/align/offset/arrow` | delay defaults differ; arrow always rendered |
| Tooltip | `TooltipRoot/Trigger/Content`, `placement`, `openDelay` (400) / `closeDelay` (150) | `text/side/offset/hoverDelay` (500) / `bare/disabled` | delay defaults differ |
| Toast | types `success\|error\|info\|loading\|warning`; helpers `create/success/error/info/loading/dismiss` | types `success\|error\|warning\|info` (+ sonner `loading/message/promise/custom`); helpers `success/error/warning/info/loading/message/promise/custom` | ours **missing `toast.warning`**, `message`, `promise`, `custom` (though `warning` is in the union) |
| Breadcrumbs | `items[].icon`; renders `nav > ol` | `prefix`/`suffix` slots; renders `div`; overflow `…` dropdown | icon vs slots; overflow "Not ported" (intentional) |
| KeyboardShortcut | size `sm\|md\|lg` | **no `size` prop**; `useIcons`, `showPlus` | ours has size, lacks `useIcons`/`showPlus` |
| KeyboardShortcutsDialog | `shortcuts` array prop; `searchThreshold`; `title` | reads a global registry `getShortcutGroups()` (**no `shortcuts` prop**); `paddingTop` | data source differs |
| SettingsDialog | compound parts + `value`/`onValueChange` | parts; adds `size` (4xl), `keyboardShortcut`, `unmountOnHide` | ours lacks global hotkey binding |
| Tree | Zag `tree-view` compound (`Root/Tree/Node/Branch*/Item*`) | bespoke `Tree` + `TreeItem`, drag & drop, `guides` | surface differs (intentional); ours has selection, frappe does not |

---

## 2. Button

Ours: `packages/ui/src/components/Button/recipe.ts` + `Button.tsx`.
frappe: `frappe-ui-main/src/components/Button/Button.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| size (text) | `xs: h-6 text-xs px-1.5 rounded-3` · `sm: h-7 text-base px-2 rounded-4` · `md: h-8 text-base-medium px-2.5 rounded-4` · `lg: h-10 text-lg-medium px-3 rounded-5` | identical strings | `match` |
| size (icon) | `h-6 w-6 rounded-3` / `h-7 w-7 rounded-4` / `h-8 w-8 rounded-4` / `h-10 w-10 rounded-5` | identical | `match` |
| icon glyph | `size-3.5` / `size-4` / `size-4.5` / `size-5` | identical | `match` |
| base | `inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors disabled:cursor-not-allowed` | `inline-flex items-center justify-center gap-2 transition-colors shrink-0` | `intentional` (ours adds explicit cursor) |
| solid gray | `text-ink-base bg-surface-gray-10 hover:bg-surface-gray-9 active:bg-surface-gray-8` | identical | `match` |
| solid blue | `bg-surface-blue-8 hover:bg-surface-blue-9 active:bg-surface-blue-9` | `bg-surface-blue-6 hover:bg-surface-blue-7 active:bg-surface-blue-8` | `intentional` (WCAG shift) |
| solid green | `bg-surface-green-8 hover:bg-surface-green-9 active:bg-surface-green-9` | `bg-surface-green-7 hover:bg-surface-green-8 active:bg-surface-green-9` | `intentional` (WCAG shift) |
| solid red | `text-ink-base bg-surface-red-8 hover:bg-surface-red-9 active:bg-surface-red-9` | `text-ink-base dark:text-ink-red-9 bg-surface-red-7 hover:bg-surface-red-8 active:bg-surface-red-9` | `unintended` (missing `dark:text-ink-red-9`) |
| subtle blue | `text-ink-blue-8` | `text-ink-blue-5` | `intentional` (WCAG shift) |
| subtle red | `text-ink-red-8` | `text-ink-red-7` | `intentional` (WCAG shift) |
| subtle gray/green | `text-ink-gray-8` / `text-ink-green-8` | identical | `match` |
| outline (all themes) | borders/bg identical to frappe; text `ink-blue-8`/`ink-red-8` | `ink-blue-5`/`ink-red-7` | `intentional` (WCAG shift) |
| ghost | bg tokens identical; text shift as subtle | — | `intentional` |
| disabled | `disabled:bg-surface-gray-2 disabled:text-ink-gray-4` etc. | same tokens, applied as a state replacement | `match` (tones identical) |
| focus | `focus-visible:focus-ring` / `-blue` / `-green` / `-red`; gray **explicit** | gray `''` (global ring); colour themes `focus-visible:focus-ring-*` | `intentional` (ours explicit) |
| pressed (`data-state`) | gray `bg-surface-gray-8`; blue `bg-surface-blue-9`; green/red `bg-surface-*-9` | gray `bg-surface-gray-8`; blue `bg-surface-blue-8`; green/red `-9` | `intentional` (WCAG shift) |
| label line-height | span `class="truncate"` | span `'truncate leading-tighter'` | `unintended` (missing `leading-tighter`) |
| loading spinner | fixed `<span class="size-4 …">` | per-size spinner (`size-3.5/4/4.5/5`) | `unintended` (fixed vs per-size) |
| structure | `href`→`<a>`; `prefix`/`suffix` props | `route`/`href`; prefix/suffix slots | `intentional` (Solid compound) |

---

## 3. Menu

Ours: `packages/ui/src/components/Menu/Menu.tsx`.
frappe: `Menu/Menu.vue`, `Menu/MenuItemContent.vue`, `Menu/utils.ts`,
`ItemListRow/ItemListRow.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| content radius | `rounded-5` (10px) | `rounded-6` (12px) | `unintended` |
| content bg | `bg-surface-elevation-1` | `bg-surface-elevation-2` | `unintended` (dark-mode delta) |
| content edge | `border border-outline-gray-1` | `ring-1 ring-black ring-opacity-5` + `divide-y divide-outline-elevation-2` | `unintended` |
| content shadow | `shadow-lg` | `shadow-2xl` | `unintended` |
| content padding | `p-1` | group `p-1.5` | `unintended` |
| content min-width | `min-w-40` | `min-w-40` | `match` |
| item radius | `rounded-3` (6px) | ItemListRow `rounded-4` (8px) | `unintended` |
| item layout | `flex items-center gap-2 px-2 py-1.5 text-base` | ItemListRow `min-h-7 px-2 py-1.5 text-base gap-2` | `match` |
| item text | `text-ink-gray-8` | `text-ink-gray-7` | `intentional` (WCAG shift) |
| item highlight | `data-[highlighted]:bg-surface-gray-3` | `focus:bg-surface-alpha-gray-2 data-[highlighted]:bg-surface-alpha-gray-2` | `unintended` (token differs) |
| item selected | — (no checked styling) | `data-[state=checked]:bg-surface-gray-3` + hover+checked `surface-gray-4` | `intentional` (ours is options-only) |
| item disabled | `data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-gray-4` | `data-[disabled]:pointer-events-none … text-ink-gray-4` | `match` |
| group label | `px-2 py-1 text-xs text-ink-gray-6` | `flex h-7 items-center px-2 text-sm font-medium leading-tighter text-ink-gray-4` | `unintended` (size, weight, height, colour) |
| item icon | `size-4 text-ink-gray-6` (Dropdown) | `size-4 shrink-0 text-ink-gray-6` | `match` |
| separator | `my-1 h-px bg-outline-gray-1` | group `divide-y divide-outline-elevation-2` | `unintended` (token/edge differs) |
| motion | fade only (`animate` on content) | `.menu-content[data-motion=instant]` 80ms fade | `match` |

---

## 4. Dropdown

Ours: `packages/ui/src/components/Dropdown/Dropdown.tsx` (composes `Menu`).
frappe: `Dropdown/Dropdown.vue` (renders `Menu` inside `DropdownMenuContent`).

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| content shell | inherits `Menu.Content` (`rounded-5 border bg-surface-elevation-1 shadow-lg`) | `menuClasses.content` (`rounded-6 bg-surface-elevation-2 shadow-2xl ring-1`) | `unintended` (same as Menu) |
| default trigger | `inline-flex items-center gap-1.5 rounded-4 border border-outline-gray-2 bg-surface-base px-2.5 py-1.5 text-base text-ink-gray-8 hover:bg-surface-gray-2 data-[state=open]:bg-surface-gray-3` | default is `<Button>` (subtle gray): `text-ink-gray-8 bg-surface-gray-2 hover:bg-surface-gray-3 active:bg-surface-gray-4`, size `sm` (`h-7 text-base px-2 rounded-4`) | `unintended` (bordered input-like vs subtle button) |
| trigger chevron | `lucide-chevron-down size-4 text-ink-gray-5` | none (Button label only) | `intentional` (ours adds affordance) |
| item `danger` | label `text-ink-red-7` | `theme: 'red'` → text `text-ink-red-7`, bg `focus:bg-surface-red-3` | `intentional` (colour matches; ours no red row bg) |
| structure | options → `Menu.Root/Trigger/Content/Item` | options → `Menu` in reka `DropdownMenuContent` | `intentional` |

---

## 5. ContextMenu

Ours: `packages/ui/src/components/ContextMenu/ContextMenu.tsx`.
frappe: `ContextMenu/ContextMenu.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| content | `min-w-40 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-1 text-ink-gray-9 shadow-lg` | `menuClasses.content` (`rounded-6 bg-surface-elevation-2 shadow-2xl ring-1`) | `unintended` (identical to Menu deltas) |
| item | `flex … rounded-3 px-2 py-1.5 text-base text-ink-gray-8` + `data-[highlighted]:bg-surface-gray-3` | `rounded-4` + `surface-alpha-gray-2` highlight | `unintended` |
| group label | `px-2 py-1 text-xs text-ink-gray-6` | `h-7 px-2 text-sm font-medium text-ink-gray-4` | `unintended` |
| positioner | `z-50` | `z-[100]` | `unintended` (stacking-order delta) |
| machine | Zag `menu` `contextTrigger` | reka `ContextMenu*` | `intentional` |

---

## 6. Dialog

Ours: `packages/ui/src/components/Dialog/Dialog.tsx`.
frappe: `Dialog/Dialog.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| backdrop | `fixed inset-0 z-50 bg-black-overlay-200 dark:bg-black-overlay-700` | identical | `match` |
| content radius / bg / shadow | `rounded-7 bg-surface-elevation-1 shadow-xl` | `rounded-7 bg-surface-elevation-1 shadow-xl` | `match` |
| content default width | `w-full max-w-md` | `w-full` + size `lg` → `max-w-lg` | `unintended` (default narrower) |
| content extras | `relative z-50 p-4 text-ink-gray-9` | `my-8 inline-block transform overflow-hidden text-start align-middle` (padding on inner wrapper `px-4 pb-6 pt-5 sm:px-6`) | `unintended` (missing `overflow-hidden`; padding model differs) |
| Title | `text-lg-medium text-ink-gray-9` | `text-2xl-semibold leading-6 text-ink-gray-8` | `unintended` (size/weight/colour) |
| Description | `text-base text-ink-gray-6` | `text-p-base text-ink-gray-7` | `unintended` (leading + colour) |
| Footer | `mt-4 flex justify-end gap-2` | actions region `px-4 pb-7 pt-4 sm:px-6` + `flex justify-end gap-2` | `unintended` (spacing model) |
| Header | `flex flex-col gap-1` | `mb-6 flex items-center justify-between` + icon badge | `intentional` (ours has no auto icon/theme) |
| structure | compound; no `size`/`position`/`theme`/`icon`/`bare`/`dismissible` | config object with all of those | `intentional` (agreed) |

---

## 7. BottomSheet

Ours: `packages/ui/src/components/BottomSheet/BottomSheet.tsx`.
frappe: `BottomSheet/BottomSheet.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| backdrop | `fixed inset-0 z-50 bg-black-overlay-200 dark:bg-black-overlay-700` | identical | `match` |
| content max height / width | `max-h-[90dvh] w-full max-w-2xl` | `max-h-[90dvh] w-full max-w-2xl` | `match` |
| content radius | `rounded-t-7` (16px) | `rounded-t-[36px] [corner-shape:squircle]` | `unintended` (radius + squircle) |
| content bg | `bg-surface-elevation-1` | `bg-surface-base` | `unintended` (dark-mode delta) |
| content shadow | `shadow-xl` | `shadow-lg` | `unintended` |
| title | `text-xl-semibold text-ink-gray-9` | `text-3xl-semibold text-ink-gray-9` | `unintended` (size) |
| title padding | `px-4 pb-3` | `px-2 pb-3 pt-2` | `unintended` (spacing) |
| handle | `flex shrink-0 justify-center pt-3 pb-2` + `h-1.5 w-10 rounded-full bg-surface-gray-3` | `shrink-0 …` + `flex justify-center pb-2 pt-3` + same bar | `match` |
| body | `min-h-0 overflow-y-auto overscroll-contain px-4 pb-4` | `min-h-0 touch-pan-y overflow-y-auto overscroll-contain` | `match` |
| machine | Zag `dialog` | reka `Dialog*` | `intentional` (documented) |

---

## 8. Popover

Ours: `packages/ui/src/components/Popover/Popover.tsx`.
frappe: `Popover/Popover.vue` + `shared/popover/PopoverPanel.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| content radius | `rounded-6` | `rounded-6` | `match` |
| content bg | `bg-surface-elevation-1` | `bg-surface-elevation-2` | `unintended` (dark-mode delta) |
| content edge | `border border-outline-gray-1` | `ring-1 ring-black ring-opacity-5` | `unintended` |
| content shadow | `shadow-lg` | `shadow-2xl` | `unintended` |
| content padding / width | hard-coded `w-64 p-3` | none (consumer adds layout) | `unintended` (baked-in size/padding) |
| arrow | always rendered, `fill-surface-elevation-1` | `arrow` default **false**, `fill-surface-elevation-2` | `unintended` (always-on arrow) |
| Title | `text-base-medium text-ink-gray-9` | no Title part (freeform panel) | `intentional` (ours adds parts) |
| Description | `text-sm text-ink-gray-6` | no Description part | `intentional` |
| positioner | `z-50` | `z-[100]` | `unintended` (stacking-order delta) |

---

## 9. HoverCard

Ours: `packages/ui/src/components/HoverCard/HoverCard.tsx`.
frappe: `HoverCard/HoverCard.vue` (renders the shared `PopoverPanel`).

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| content | `w-64 rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-3 text-ink-gray-9 shadow-lg` | panel `rounded-6 bg-surface-elevation-2 shadow-2xl ring-1` | `unintended` (same shell deltas as Popover) |
| arrow | always rendered, `fill-surface-elevation-1` | `arrow` default false | `unintended` |
| trigger | `inline-flex` | as-child, no layout class | `match` |
| open/close delay | `openDelay 600`, `closeDelay 200` | `hoverDelay 300`, `leaveDelay 300` | `unintended` (defaults) |
| positioner | `z-50` | `z-[100]` | `unintended` |

---

## 10. Tooltip

Ours: `packages/ui/src/components/Tooltip/Tooltip.tsx`.
frappe: `Tooltip/Tooltip.vue` + `Tooltip/TooltipBubble.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| bubble radius | `rounded-4` | `rounded-4` | `match` |
| bubble bg / text | `bg-surface-gray-10 text-ink-base` | `bg-surface-gray-10 text-ink-base` | `match` |
| bubble type / padding | `text-xs px-2 py-1` | `text-xs px-2 py-1` | `match` |
| bubble shadow | `shadow-md` | `shadow-xl` | `unintended` |
| bubble max width | `max-w-xs` | — | `unintended` (extra cap) |
| arrow | `fill-surface-gray-10` | `fill-surface-gray-10` (`width 8 height 4`) | `match` |
| delays | `openDelay 400`, `closeDelay 150` | `hoverDelay 500` | `unintended` (defaults) |
| positioner | `z-50` | `z-[100]` | `unintended` |

---

## 11. Toast

Ours: `packages/ui/src/components/Toast/Toast.tsx` (Zag toast).
frappe: `Toast/ToastProvider.vue` (vue-sonner) + `Toast/toast.ts`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| shell | `flex items-start gap-3 rounded-5 border bg-surface-elevation-1 p-3 shadow-lg` (+ type border) | `group py-2.5 flex items-center px-4 bg-surface-gray-9 rounded-5 shadow-xl w-[360px]` | `unintended` (light card vs dark bar; width) |
| radius | `rounded-5` | `rounded-5` | `match` |
| shadow | `shadow-lg` | `shadow-xl` | `unintended` |
| title | `text-base-medium text-ink-gray-9` | `text-p-base font-medium text-ink-base` | `unintended` (colour + leading) |
| description | `text-sm text-ink-gray-6` | `text-p-base text-ink-base` | `unintended` (size + colour) |
| icon | `size-4 text-ink-gray-6` | `mr-2 text-ink-base [&_svg]:size-4` | `unintended` (colour) |
| close button | `text-ink-gray-6 hover:text-ink-gray-8`, `lucide-x size-3.5` | `text-ink-base hover:bg-surface-gray-8 size-5`, `[&_svg]:size-4` | `unintended` |
| type accents | border per type (`outline-green-3`, `outline-red-3`, `outline-amber-3`, `outline-gray-2`) | icon tint (`error [&_[data-icon]]:text-ink-red-4`, `warning …amber-4`) | `unintended` (different accent mechanism) |
| API | `toast.create/success/error/info/loading/dismiss` | `toast.success/error/warning/info/loading/message/promise/custom` | `unintended` (`toast.warning` missing) |

---

## 12. Breadcrumbs

Ours: `packages/ui/src/components/Breadcrumbs/Breadcrumbs.tsx`.
frappe: `Breadcrumbs/Breadcrumbs.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| crumb | `flex items-center rounded-4 px-0.5 py-1 text-lg-medium leading-tighter` | identical | `match` |
| current | `min-w-0 text-ink-gray-9` | `min-w-0 text-ink-gray-9` | `match` |
| non-current | `text-ink-gray-5 hover:text-ink-gray-7` | `text-ink-gray-5 hover:text-ink-gray-7` | `match` |
| separator | `mx-0.5 text-base text-ink-gray-4` (`/`) | identical | `match` |
| icon | `size-4 shrink-0` before label | prefix/suffix slots | `intentional` (ours icon field) |
| landmark | `nav > ol` with `<li>` | `div` (caller owns the landmark) | `intentional` (documented) |
| overflow | none (clips) | `…` `Dropdown` when it overflows | `intentional` ("Not ported") |

---

## 13. KeyboardShortcut

Ours: `packages/ui/src/components/KeyboardShortcut/KeyboardShortcut.tsx`.
frappe: `KeyboardShortcut/KeyboardShortcut.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| root | `inline-flex items-center gap-0.5` | `inline-flex items-center gap-0.5` (+ `text-ink-gray-5 text-sm` when `!bg`) | `match` |
| chip (`bg`) | `h-6 min-w-6 rounded-4 bg-surface-gray-2 px-1.5 text-xs-medium text-ink-gray-7` | `h-6 min-w-[1.5rem] rounded-4 bg-surface-gray-2 px-1.5 text-xs-medium text-ink-gray-7` | `match` |
| plain key | `leading-none text-ink-gray-5` | `leading-none uppercase` on root-tinted text | `match` |
| separator | `font-mono text-[10px] leading-none opacity-60` | identical | `match` |
| alt combos | `ms-1 inline-flex items-center gap-1.5` + `/` `text-xs text-ink-gray-4` | identical | `match` |
| modifiers (plain) | text glyphs `⌘ ⇧ ⌥` / `Ctrl` | lucide icons `lucide-command` / `lucide-arrow-big-up` / `lucide-option` (`size-3`) | `unintended` (glyph vs icon) |
| size prop | `sm\|md\|lg` (root + key `tv`) | none (fixed `text-sm`) | `intentional` (ours adds size) |

---

## 14. KeyboardShortcutsDialog

Ours: `packages/ui/src/components/KeyboardShortcutsDialog/KeyboardShortcutsDialog.tsx`.
frappe: `KeyboardShortcutsDialog/KeyboardShortcutsDialog.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| dialog width | `Dialog.Content class="max-w-2xl"` | `Dialog size="5xl" position="top"` | `unintended` |
| title | `Dialog.Title` → `text-lg-medium text-ink-gray-9` | `text-3xl-semibold leading-6 text-ink-gray-9` | `unintended` (size) |
| grid | `grid max-h-[60vh] grid-cols-1 gap-6 overflow-y-auto md:grid-cols-2` | `grid max-h-[70vh] grid-cols-1 gap-8 gap-x-6 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3` | `unintended` (height, gap, xl column) |
| group title | `mb-2 text-base-medium text-ink-gray-8` | `mb-3 text-base-medium tracking-wide text-ink-gray-8` | `unintended` (`mb`, `tracking-wide`) |
| row | `grid grid-cols-[1fr_auto] items-center gap-3 py-0.5` | `grid grid-cols-[1fr_auto] items-start gap-3 rounded-4 py-0.5` | `unintended` (`items-center` vs `items-start`, missing `rounded-4`) |
| row label | `text-sm text-ink-gray-6` | `text-p-base text-ink-gray-6` | `unintended` (leading) |
| empty | `py-8 text-center text-sm text-ink-gray-5` | `h-[20vh] py-8 text-center text-sm text-ink-gray-5` | `unintended` (missing `h-[20vh]`) |
| keys | `<KeyboardShortcut bg>` | `<KeyboardShortcut bg>` | `match` |
| data source | `shortcuts` prop | global registry | `intentional` (ours explicit) |

---

## 15. SettingsDialog

Ours: `packages/ui/src/components/SettingsDialog/SettingsDialog.tsx`.
frappe: `SettingsDialog/Settings*.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| sidebar | `flex max-h-[38vh] w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-outline-gray-1 bg-surface-sidebar p-2 sm:max-h-none sm:w-[220px] sm:border-b-0 sm:border-r` | same, but `space-y-4` on an inner wrapper instead of outer `gap-4` | `match` |
| nav group label | `flex h-7 items-center px-2 text-base text-ink-gray-5` | identical | `match` |
| nav item base | `flex h-7 w-full items-center gap-2 rounded-4 px-2 text-left text-base text-ink-gray-7 transition-colors` | identical | `match` |
| nav item hover | `data-[state=inactive]:hover:bg-surface-gray-2` | identical | `match` |
| nav item active | `data-[state=active]:bg-surface-elevation-3 data-[state=active]:font-medium data-[state=active]:text-ink-gray-9 data-[state=active]:shadow-sm` | `data-[state=active]:bg-surface-elevation-3 data-[state=active]:shadow-sm` | `unintended` (extra `font-medium` + `text-ink-gray-9`) |
| nav item focus | `focus-visible:focus-ring` | global `:focus-visible` | `intentional` (ours explicit) |
| content | `flex min-h-0 flex-1 justify-stretch` | identical | `match` |
| panel | `flex min-h-0 flex-1 flex-col focus-visible:outline-none data-[state=inactive]:hidden` | identical | `match` |
| header | `shrink-0 px-[4.4rem] pt-10` | identical | `match` |
| header title | `text-lg-semibold text-ink-gray-8` | `text-lg font-semibold text-ink-gray-8` | `match` (notation) |
| header description | `text-base text-ink-gray-6` | `text-base text-ink-gray-6` | `match` |
| body | `min-h-0 flex-1 overflow-y-auto overscroll-contain px-[4.4rem] pb-16` | `ScrollArea` with `viewport-class="px-[4.4rem] pb-16"` | `intentional` (plain overflow vs styled scrollbar) |
| row | `flex items-center gap-8 py-3.5` | identical | `match` |
| row title | `block text-base-medium leading-tighter text-ink-gray-8` (+ `cursor-pointer`) | identical | `match` |
| row description | `mt-1 text-base leading-5 text-ink-gray-6` | identical | `match` |
| dialog shell | `h-[calc(100dvh_-_2rem)] … sm:h-[860px] sm:max-w-4xl sm:rounded-7` | `h-[100dvh] … sm:h-[min(860px,calc(100vh-8rem))]` + Dialog `size=4xl` | `unintended` (mobile height formula) |
| hotkey | none | `keyboardShortcut: Mod+Shift+,` | `intentional` (not ported) |

---

## 16. Tree

Ours: `packages/ui/src/components/Tree/Tree.tsx`.
frappe: `Tree/Tree.vue` + `Tree/TreeItem.vue`.

| axis | ours | frappe-ui | classification |
| --- | --- | --- | --- |
| row | `flex items-center gap-1.5 rounded-4 py-1 pe-2 text-base text-ink-gray-8 ps-[calc(var(--depth)*1rem)]` | `relative flex items-center gap-1.5 rounded-5 px-1.5` + fixed `height: var(--tree-row-height, 32px)` | `unintended` (radius 4↔5, padding vs height, indent mechanism) |
| row hover | `hover:bg-surface-gray-2` | `hover:bg-surface-gray-2` | `match` |
| row selected | `data-[selected]:bg-surface-gray-3 data-[selected]:text-ink-gray-9` | — (no selection) | `intentional` (Zag adds selection) |
| row label | `truncate` | `truncate text-base leading-tighter text-ink-gray-8` | `unintended` (missing `leading-tighter`) |
| toggle | `grid size-4 shrink-0 place-items-center rounded-2 text-ink-gray-6` | `flex size-5 shrink-0 items-center justify-center rounded-4 text-ink-gray-5 hover:bg-surface-gray-3` | `unintended` (size, radius, colour, hover) |
| indicator | `lucide-chevron-right size-3.5` | inline SVG `size-3.5` | `match` |
| selected marker | `lucide-check size-3.5 text-ink-blue-6` | — | `intentional` (ours adds) |
| indent guide | `absolute inset-y-0 w-px bg-outline-gray-2` | CSS `connectors`/`lines` (elbow lines) | `intentional` (different guide model) |
| focus | `focus-visible:focus-ring` | `outline-2 outline-outline-gray-3` | `intentional` (token) |
| drag & drop | none | full DnD + live region | `intentional` (not ported) |

---

## Unintended deltas to fix

Ordered by likely user impact. "Ours → frappe-ui".

**Shells / elevation (systemic)**

1. `Menu.Content`, `ContextMenu.Content` radius `rounded-5` → `rounded-6`.
2. Same shells bg `bg-surface-elevation-1` → `bg-surface-elevation-2`
   (dark-mode delta).
3. Same shells edge `border border-outline-gray-1` → `ring-1 ring-black
   ring-opacity-5` (+ `divide-y divide-outline-elevation-2`).
4. Same shells shadow `shadow-lg` → `shadow-2xl`.
5. Menu group padding `p-1` → `p-1.5`; item radius `rounded-3` → `rounded-4`.
6. Menu/ContextMenu item highlight `bg-surface-gray-3` →
   `bg-surface-alpha-gray-2`; separator `bg-outline-gray-1` →
   `divide-outline-elevation-2`.
7. Menu/ContextMenu group label `px-2 py-1 text-xs text-ink-gray-6` →
   `h-7 px-2 text-sm font-medium leading-tighter text-ink-gray-4`.
8. `Popover`/`HoverCard` shell: bg `-1`→`-2`, `shadow-lg`→`shadow-2xl`,
   `border`→`ring-1`, and remove baked-in `w-64 p-3` (let the consumer size it).
9. `Popover`/`HoverCard` render the arrow unconditionally; frappe defaults
   `arrow=false`.
10. Overlay positioners use `z-50`; frappe uses `z-[100]` (ContextMenu, Popover,
    HoverCard, Tooltip).

**Typography**

11. `Button` label span missing `leading-tighter`.
12. `Dialog.Title` `text-lg-medium text-ink-gray-9` →
    `text-2xl-semibold leading-6 text-ink-gray-8`; `Dialog.Description`
    `text-base text-ink-gray-6` → `text-p-base text-ink-gray-7`.
13. `BottomSheet` title `text-xl-semibold` → `text-3xl-semibold`.
14. `KeyboardShortcutsDialog` title `text-lg-medium` → `text-3xl-semibold`;
    row label `text-sm` → `text-p-base`.
15. `Tree` row label missing `leading-tighter`.

**Sizing / spacing**

16. `Dialog.Content` default `max-w-md` → `max-w-lg`; add `overflow-hidden`.
17. `BottomSheet` radius `rounded-t-7` → `rounded-t-[36px]` (+ squircle); bg
    `surface-elevation-1` → `surface-base`; shadow `shadow-xl` → `shadow-lg`;
    title padding `px-4` → `px-2 … pt-2`.
18. `KeyboardShortcutsDialog` container `max-w-2xl` → `5xl`; grid
    `max-h-[60vh] gap-6` → `max-h-[70vh] gap-8 gap-x-6` + `xl:grid-cols-3`;
    row `items-center` → `items-start` (+ `rounded-4`); empty missing
    `h-[20vh]`.
19. `SettingsDialog` dialog shell mobile height `h-[calc(100dvh_-_2rem)]` →
    `h-[100dvh]` (and `sm:h-[860px]` → `sm:h-[min(860px,calc(100vh-8rem))]`).
20. `Tree` row `rounded-4 py-1 pe-2` → `rounded-5 px-1.5` + fixed row height;
    toggle `size-4 rounded-2 text-ink-gray-6` →
    `size-5 rounded-4 text-ink-gray-5 hover:bg-surface-gray-3`.

**Colour / state**

21. `Button` solid red missing `dark:text-ink-red-9`.
22. `SettingsDialog.NavItem` active adds `font-medium text-ink-gray-9` not in
    frappe.

**Toast (whole visual language)**

23. Toast shell `bg-surface-elevation-1` + border + `p-3` (light card) →
    frappe's `bg-surface-gray-9 px-4 py-2.5 w-[360px]` dark bar; title/desc
    `text-base-medium`/`text-sm` → `text-p-base`; icon/close colours
    `text-ink-gray-*` → `text-ink-base`; shadow `shadow-lg` → `shadow-xl`.
24. `toast.warning` helper missing (the `warning` type exists in the union but
    no imperative helper is exported).

**Trigger / iconography**

25. `Dropdown` default trigger is a bordered input-like button
    (`border border-outline-gray-2 bg-surface-base px-2.5 py-1.5`) → frappe's
    default subtle `Button` (`bg-surface-gray-2 hover:bg-surface-gray-3`).
26. `KeyboardShortcut` plain-mode modifiers drawn as text glyphs (`⌘ ⇧ ⌥`) →
    frappe's lucide icons (`lucide-command`, `lucide-arrow-big-up`,
    `lucide-option`).

**Defaults**

27. `HoverCard` delays `600/200` → `300/300`; `Tooltip` delays `400/150` →
    `500`; `Tooltip` shadow `shadow-md` → `shadow-xl`; extra `max-w-xs`.
28. `Button` loading spinner fixed `size-4` → per-size (`size-3.5/4/4.5/5`).
