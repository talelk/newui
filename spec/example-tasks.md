# Task workspace

Routes: `/examples/tasks` and `/examples/tasks`. Adapted from
Frappe's TasksDesktop/TasksMobile recipes and solid-ui's Tasks application, using
newui's semantic palette, compact controls and Field contract.

## Interactions

One deterministic repository owns 1000 tasks. TanStack Solid Query loads it,
reports loading/errors, retries explicitly and updates its cache after mutations.
Refreshing preserves local creations and status updates for the page lifetime.
Navigating to a fresh document starts a fresh example. No request leaves the app.

TanStack Solid Table owns stable row identities, searching, sorting, row selection,
column visibility and pagination. Status and priority are independent filters.
Complete selected acts on the filtered selection, then clears selection. Search
resets the page; filter changes let the table reset an out-of-range page.

TanStack Solid Form validates the title (at least three non-space characters)
before creating a task. Field exposes the message and invalid semantics. The
form remains in the Dialog until the mutation succeeds.

The Activity view uses TanStack Solid Virtual with fixed 72px rows and six rows
of overscan. All 1000 records remain reachable with a bounded DOM. The paginated
semantic table is available as the regular accessible view. Desktop and mobile
share domain behavior; the mobile route keeps its navigation collapsed.

## Verification

`e2e/tasks.spec.ts` covers query reload/error/retry, validation and mutation,
filtering/sorting/pagination/column visibility, bulk updates, bounded DOM and
keyboard scrolling, plus mobile overflow and axe in both colour schemes.
`examples/tasks-data.test.ts` independently checks repository identity and
immutable snapshots. Route budgets protect both variants.
