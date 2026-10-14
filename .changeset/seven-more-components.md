---
'@newui/ui': minor
'@newui/tailwind': patch
---

Seven components, and two more merge-config gaps found on the way.

**New** — each from Zag's machine where one exists, following solid-ui's
inventory rather than Kobalte's implementation (one primitive layer, one
definition of focus and keyboard):

- `Accordion` / `Collapsible` — `@zag-js/accordion`, `@zag-js/collapsible`.
  `Item` owns the value and the disabled flag and hands both to its parts, so a
  trigger and its panel cannot disagree about which item they belong to.
- `ToggleGroup` — `@zag-js/toggle-group`. Distinct from `TabButtons`: a set of
  pressed states (`radiogroup` when one value is allowed, `group` when several),
  railed by the machine's roving focus.
- `Pagination` — `@zag-js/pagination`, plus a `Range` part that owns the
  off-by-one (Zag's `pageRange.start` is the rows *before* the page).
- `ProgressCircle` — `@zag-js/progress`. The viewBox is fixed and the box
  scales, so each size converts its intended on-screen stroke width into
  viewBox units; passing a width straight through draws a 3px ring at `sm` and a
  6.75px one at `xl`.
- `EmptyState` — plain markup: icon, one line of what is missing, one action.
- `Timeline` — plain markup; the rail is two half-lines per row, so the first
  and last markers have no dangling stub.

A shared `disclosure-panel` utility carries the disclosure animation: the panel
clips, `grid-template-rows: 0fr → 1fr` gives it a height without measuring the
content, and a delayed `visibility` keeps a collapsed panel out of the tab order
and the accessibility tree. Zag's own `hidden` is dropped for this reason — it
would win over all of it and snap.

**Merge config** — the all-pairs sweep caught two more gaps the moment the new
recipes used the classes, both of which let a same-property pair survive and be
decided by the cascade instead of by `cn()`:

- named `tracking-*` (`wide`, `tight`, …) were not recognised at all;
- `inset-x` did not conflict with the logical `start`/`end`.

Agreement with the extended default now covers 402,590 ordered pairs.
