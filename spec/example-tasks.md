# Task workspace

Routes: `/pages/tasks` and `/pages/tasks/fullscreen`. A complete task workspace
built with newui's semantic palette, compact controls and Field contract.

## Interactions

One deterministic repository owns 1000 tasks. TanStack Solid Query loads it,
reports loading/errors, retries explicitly and updates its cache after mutations.
Refreshing preserves local creations and status updates for the page lifetime.
Navigating to a fresh document starts a fresh example. No request leaves the app.

TanStack Solid Table owns stable row identities, searching, sorting, row selection,
column visibility and pagination. Status and priority are independent filters.
Complete selected acts on the filtered selection, then clears selection. Search
resets the page; a new filtered row set lets the table reset an out-of-range page.
Below `md` the table becomes cards driven by `meta.mobile`; the cards keep row
selection, the bulk action and the same 10-row pager as the table. The bespoke
30-row mobile list and its separate pagination are not part of the workspace.

TanStack Solid Form validates the title (at least three non-space characters)
before creating a task. Field exposes the message and invalid semantics. The
form remains in the Dialog until the mutation succeeds, and a Create/Cancel pair
is the visible dismissal path.

The detail dialog is one form: title, due date, status, priority, assignee and
project are local drafts until “Save task details”, so status does not persist
before the rest of the task. The due date uses `DatePicker` and is validated
before the single save. The dialog title is the task title; the ID is metadata.
Below `sm` the dialog fills the screen, with its own scroll region and a sticky
cancel/save footer. Comments remain a separate, immediate action.

The Activity view uses TanStack Solid Virtual with fixed 72px rows and six rows
of overscan. All 1000 records remain reachable with a bounded DOM. The paginated
semantic table is available as the regular accessible view. Both views sit in a
`Section`; `DataTable` and `VirtualList` own the shared loading, empty and error
states. Desktop and mobile share domain behaviour; the mobile route keeps its
navigation collapsed and reserves space above the fixed bottom navigation.

## Verification

`e2e/tasks.spec.ts` covers query reload/error/retry, validation and mutation,
filtering/sorting/pagination/column visibility, bulk updates, bounded DOM and
keyboard scrolling, plus mobile overflow and axe in both colour schemes.
`examples/tasks-data.test.ts` independently checks repository identity and
immutable snapshots. The mobile pager assertions in that e2e file still describe
the removed 30-row custom list and must be updated for the DataTable cards and
their 10-row pages. Route budgets protect both variants.
