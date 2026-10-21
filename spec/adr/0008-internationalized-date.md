# `@internationalized/date` for the date picker

**Status**: accepted

## Context

The plan originally guessed "Zag `date-picker` + dayjs adapter". Zag's
`@zag-js/date-picker` machine does **not** have a dayjs adapter: it operates on
`DateValue` objects from `@internationalized/date` (a peer dependency of the
machine).

## Decision

Use `@internationalized/date` and convert at the boundary: the component's
`value`/`min`/`max` are ISO `YYYY-MM-DD` strings, parsed to `DateValue` on the
way in and stringified on the way out.

## Rationale

There is no dayjs path; the machine requires `DateValue`. Keeping the public
value an ISO string keeps the component's API uniform with the other inputs and
round-trippable through the model. The cost is real — the library pushed the
full barrel ~139 → 165 kB — and is visible as its own `DatePicker only` bundle
budget.

## Consequences

- `@newui/molecules` depends on `@internationalized/date` and
  `@zag-js/date-picker`.
- The barrel budget grew and a `DatePicker only` entry guards the cost.
- `DateTimePicker`/`DateRangePicker` would be separate components (P8).
