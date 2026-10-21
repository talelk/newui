# Design principles

These are the API and composition rules the library follows. They are the
contract: if an implementation and a principle disagree, the principle wins.

## Prop design

**P1. Name events for what happened.** `onOpenChange`, `onCheckedChange`,
`onSubmit` — past-tense facts, not triggers. Never `onClickOutside`-style names
for component-level concerns.

**P2. Two-way state is a value + a change callback.** No `v-model`. An overlay
takes `open` + `onOpenChange` (via `createDisclosure`); an input takes `value` +
`onValueChange` (via `createControllableSignal`); a Zag-owned control may take
just `defaultChecked` and report through `onCheckedChange`.

**P3. Prefer primitive props.** Strings, numbers, booleans. Structured props
only for irreducibly structured data (`options`, `series`). Multi-state props
use an axis-named string enum (`size="md"`, `align="end"`), never a generic
`mode`.

**P4. Two color axes only — `variant` + `theme`.** `variant` is
`solid | subtle | outline | ghost`; `theme` is a color name
(`gray | blue | green | amber | red`). No `intent`/`severity`/`appearance`. State
(error/disabled/loading) is a state prop, not a theme.

**P5. Every input control exposes the same labelling contract** — `label`,
`description`, `error`, `required` — implemented once by `Field`
(`packages/atoms/src/lib/field.tsx`), which owns the ids and ARIA wiring.

## Composition

**P6. Shared slot vocabulary, not named slots.** Solid has no slots, so:
compound subcomponents (`Dialog.Trigger`, `Dialog.Content`) for structure, and
`prefix`/`suffix`/`icon` props for atomic adornments.

**P7. Subcomponents expose state.** A part that renders dynamic content takes
its state from context/Zag, so callers never re-derive it.

**P8. Split, don't overload.** A prop that changes the value type or shows/hides
a region means a new component (`Select` / `MultiSelect` / `Combobox`).

**P9. Imperative helpers are namespaced** (`dialog.confirm`, `toast.success`),
provider-mounted, and return a synchronous `{ close }`.

## Styling

**P10. Customize via data attributes, never class props.** Components set
`data-slot`, `data-state`, `data-disabled`, `data-variant`, `data-size`.
Forbidden: `triggerClass`, `contentStyle`, prop blobs carrying classes. Root
`class` fallthrough is fine; `cn()` merges it last.

**P11. Icon customization is uniform.** An `icon` prop accepts
`string | Component`; the string form is the `lucide-*` convention. Generic
`prefix`/`suffix` props are the override.

## Quality

**P12. Accessibility is not a follow-up.** Keyboard operation, visible
keyboard-only focus (`:focus-visible`), ARIA by props, ids auto-generated,
`sr-only` text where the UI is visual-only. Zag primitives supply most of this;
we audit and document deviations.

**P13. Deprecate, don't remove.** Old surface keeps working; removal is a major.

## Packaging

**P14/P15. Root is the default; a subpath is earned.** A subpath needs cost
isolation, an extensible registry, or a name collision — not "it feels big".
`export *` only from a curated barrel.

## Styling mechanics (Solid + Tailwind v4)

- Color utilities resolve runtime `var(--surface-*)` / `var(--ink-*)` /
  `var(--outline-*)`, so dark mode flips with no `dark:` variant.
- Recipes are `tv()` definitions with `compoundVariants`; state is `disabled:`
  and `data-[state=…]:` variants, not JS class swaps.
- Class order is authored in the recipe (no class-sorting tool).
