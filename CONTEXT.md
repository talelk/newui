# Vocabulary

The shared names the library's APIs use. Pairs with `PRINCIPLES.md` (rules) and
`spec/` (per-component contracts).

## Lifecycle & control

**open** — the visibility state of an overlay (Dialog, Popover, Dropdown,
Tooltip), a boolean bound with `open` + `onOpenChange`.
_Avoid_: visible, show, isOpen.

**value** — the primary value a control represents (selected option, text).
_Avoid_: modelValue.

**dismissible** — whether an overlay closes on outside click / Escape.
Default `true`.

## Color axes

Only two, by design:

- **variant** — `solid | subtle | outline | ghost`
- **theme** — drawn from `gray | blue | green | amber | red | violet`. A
  component ships the subset it supports (Button stops at red; Badge, Avatar
  and KanbanBoard add `violet`). Chart palettes additionally use `orange` and
  `yellow`, but those are chart-only — never component `theme` values.

The warning tone is **`amber`** everywhere. Never `yellow`/`orange`.
State (error/disabled/loading) is a state prop, never a theme.

**colorScheme** — the light/dark axis (`light | dark | system`), owned by the
color-scheme composable; `theme` never means light/dark.
_Avoid_: using `theme` for light/dark.

## Shared vocabulary

**route / href** — navigation destinations. `route` is in-app, `href` external.
_Avoid_: `to`, `link`.

**action** — a button declared via a component's `action` prop. Typed either
as an element (`JSX.Element`) or a config object (`label`, `icon?`,
`onClick`); where the component owns the dismissal, `onClick` receives a
context callback (Alert's `{ close }`, `{ dismiss }`).

**side** — the edge a component attaches to (`top | bottom | left | right`).
Distinct from `dir` (writing direction). _Avoid_: direction, placement.

**align** — placement along a side (`start | center | end`).

**bare** — a prop that suppresses default chrome so content fills the shell.
Currently only Dialog (`bare?: boolean` drops the body padding).

**fluid** — a prop that makes items stretch to fill the container.
_Avoid_: fullWidth, block, grow.

## Solid specifics

**controllable** — a value that works controlled (prop) or uncontrolled
(`default`). Provided by `createControllableSignal`.

**compound part** — a subcomponent of a family (`Dialog.Trigger`). This is the
Solid replacement for a named slot.

**machine** — a Zag state machine. Components never reimplement keyboard/ARIA
that Zag provides.
