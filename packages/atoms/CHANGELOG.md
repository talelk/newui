# @newui/atoms

This history predates the atomic package split. New atoms are released under
`@newui/atoms`; molecules and page regions are now separate packages.

## 0.1.0

### Minor Changes

- 5e84078: Seven components, and two more merge-config gaps found on the way.

  **New** — each from Zag's machine where one exists, keeping one primitive
  layer and one definition of focus and keyboard:

  - `Accordion` / `Collapsible` — `@zag-js/accordion`, `@zag-js/collapsible`.
    `Item` owns the value and the disabled flag and hands both to its parts, so a
    trigger and its panel cannot disagree about which item they belong to.
  - `ToggleGroup` — `@zag-js/toggle-group`. Distinct from `TabButtons`: a set of
    pressed states (`radiogroup` when one value is allowed, `group` when several),
    railed by the machine's roving focus.
  - `Pagination` — `@zag-js/pagination`, plus a `Range` part that owns the
    off-by-one (Zag's `pageRange.start` is the rows _before_ the page).
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

### Patch Changes

- 4cadb5f: Two more classes the merge config mis-classified, both found by the all-pairs
  sweep rather than by a bug report:

  - `border-collapse` / `border-separate` matched the `border-<anything>` colour
    validator, so `cn('border-outline-gray-2', 'border-collapse')` dropped the
    colour and left the table utility standing alone. They are now declared as the
    table-layout pair they are.
  - Named `tracking-*` steps (`wide`, `tight`, …) were not recognised at all, so a
    consumer's `tracking-wide` and a recipe's `tracking-[0.02em]` both survived and
    the cascade decided.

  `pnpm css:check` also stopped throwing on the second one: its utility resolver
  read only the function form of a validator, while the stock configuration (which
  this config mirrors) also uses bare strings.

- 06f2b7c: Recognise Tailwind's named `tracking-*` steps in the merge config.

  `cn()` resolved `tracking-<length>` (our recipes' vocabulary) but not
  `tracking-wide`, `tracking-tight` and the other named steps Tailwind ships.
  A class the config does not recognise is kept unconditionally, so a consumer
  writing `className="tracking-wide"` alongside a recipe's `tracking-[0.02em]`
  got **both** declarations and the cascade decided — the recipe's value silently
  lost.

  The all-pairs equivalence sweep caught it the moment the site used
  `tracking-wide`; it now agrees with the extended default across 382,542 cases.
