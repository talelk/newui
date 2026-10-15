# TanStack Solid adapters in the examples

The playground uses four TanStack adapters where they add concrete behaviour.
They are application dependencies, not `@newui/ui` or `@newui/blocks` dependencies.

| Adapter | Owner | Behaviour |
| --- | --- | --- |
| `@tanstack/solid-table` | `examples/DataTable.tsx` | Typed row models, search, sorting, pagination, column visibility and selection |
| `@tanstack/solid-virtual` | `examples/ActivityList.tsx` | A bounded DOM for the 1,000-task activity stream, including keyboard scrolling |
| `@tanstack/solid-query` | `pages/Tasks.tsx` | Async local repository state, loading/error/retry, refresh and mutation cache updates |
| `@tanstack/solid-form` | Tasks and authentication pages | Field validation and submit lifecycle without losing Solid reactivity |

The existing router and Solid signals remain responsible for navigation and
simple page state. A second router or state store would duplicate those roles.
Examples use deterministic local repositories; adding Query does not introduce a
network service. Query clients and timers are disposed with their owning page.

Blocks continue to import only `@newui/ui`. ECharts belongs at the page layer.
Accounting loads its expense/payroll table adapter only when that view opens;
its initial cashflow ledger is a small semantic table. The analytics transaction
table also remains semantic HTML, without a new public table framework.

`pnpm size` protects library tree shaking. `pnpm budget` measures the built route's
actual fetched JavaScript, including shared chunks, and gives each example its
own limit. Existing limits are retained. `e2e/tasks.spec.ts` verifies selection,
mutation refresh, validation, query error recovery and fewer than 30 mounted rows
while reaching the end of the thousand-task stream.
