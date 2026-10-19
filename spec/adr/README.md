# ADRs

Architecture decision records. Each captures a decision that is not obvious from
the code, with the reasoning, so a future change is a deliberate reversal rather
than an accident. Format mirrors frappe-ui's `spec/adr/`: **Status** →
**Context** → **Decision** → **Rationale** → **Consequences**.

Statuses: `accepted`, `superseded by ADR-XXXX`, `proposed`.

| ADR | Decision |
| --- | --- |
| [0001](./0001-solid-no-v-model.md) | No `v-model`; `value` + `onValueChange` / `open` + `onOpenChange` |
| [0002](./0002-in-house-tv.md) | In-house `tv`/`cn`/`cx` instead of `tailwind-variants` |
| [0003](./0003-pruned-tw-merge.md) | Pruned `tw-merge` config, proven by an all-pairs sweep |
| [0004](./0004-package-boundaries-over-subpaths.md) | Workspace packages, not subpaths |
| [0005](./0005-contrast-driven-color-shifts.md) | Colour scales shifted for WCAG AA |
| [0006](./0006-dropdown-is-options-based.md) | `Dropdown` is options-based, not a `Menu` alias |
| [0007](./0007-bottomsheet-dialog-machine.md) | `BottomSheet` on the `dialog` machine, not `@zag-js/drawer` |
| [0008](./0008-internationalized-date.md) | `@internationalized/date` for the date picker |
| [0009](./0009-list-stays-at-the-root.md) | `List` stays at the package root |
| [0010](./0010-tailwind-v4.md) | Tailwind v4, not v3 |
| [0011](./0011-zag-via-createzagapi.md) | Zag primitives only via `createZagApi`/`createZagContext` |
| [0012](./0012-kit-ladder.md) | The kit ladder: `@newui/layouts`, `@newui/data`, Storybook, the starter |
