# Reference application and component examples

The examples translate Frappe's business workflows and solid-ui's compositions
into newui's Solid, Zag and semantic-token vocabulary. The source checkouts under
`references/` are read-only. They are design and behaviour references, not runtime
dependencies. The site owns the examples; packages never import application code.

## Application inventory

Each Frappe family has `/examples/<name>` documentation and a bare
`/examples/<name>/fullscreen` application. The persistent preview supplies
390×844, 768×900 and 1440×900 viewports. Layouts share local domain state;
the mobile variant starts with collapsed workspace navigation. Layout also
responds to viewport width on either destination.

| Frappe source family | Local workflow | Browser evidence |
| --- | --- | --- |
| Discussions | Community rail, space feeds, local creation/replies, search, read state and settings | `e2e/discussions-settings.spec.ts`, `e2e/interaction.spec.ts` |
| Compose | Rich text, preview, draft save/restore, Markdown export, local validated publication confirmation | `e2e/compose.spec.ts` |
| Deals | Pipeline board and list, filters, sorting, creation, stage moves and undo | `e2e/business-recipes.spec.ts` |
| Tickets | Service targets, priority/agent filters, sortable table, replies, assignment, resolution and creation | `e2e/business-recipes.spec.ts` |
| Mail | Folders, categories, search, unread state, stars, drafts, replies, forwarding to validated recipients, archive/trash and undo | `e2e/mail.spec.ts` |
| Files | Folder tree, grid/list, filters, favourites, local file selection, preview, download, trash/restore | `e2e/business-recipes.spec.ts` |
| Tasks | Validated creation, query lifecycle, table operations, bulk completion, virtual activity | `e2e/tasks.spec.ts` |
| Accounting | Shared ledger, date filters, cashflow/expenses/payroll/profit report, local mutations and CSV export | `e2e/business-recipes.spec.ts` |

solid-ui's five application examples map to `/examples/analytics`, mail, tasks,
`/examples/authentication` and `/examples/cards`. The eight card compositions
cover account creation, payments, team membership, sharing, notifications,
support reports, project information and cookie preferences.

All example datasets are deterministic and local. Authentication and publication
create page-local demo state. Files retain selected `File` objects in memory;
downloads preserve their contents. No email, credential, transaction or file is
sent to a remote service. Reloading starts a fresh example session.

## Individual solid-ui registry examples

The checked-out registry contains **68** `.tsx` examples. Their source names and
destinations live in `apps/playground/src/lib/reference-examples.ts`, and the
complete linked directory is `/examples/patterns`. The coverage test compares
that inventory with the read-only checkout when it is available, checks every
destination, and requires an isolated demo for every shipped reference component.

Existing controls retain newui names: TextInput/Textarea for text fields,
NumberInput for number fields, Divider for separator, BottomSheet for sheet and
drawer, and the existing toast service for toast/sonner examples. Data table
examples use the private application table composition; charts use `@newui/charts`.

Additional isolated patterns cover:

- Carousel orientation, size, spacing, position API and optional playback. Native
  scroll snapping owns the track; automatic playback pauses for interaction and
  reduced motion. Only the track scrolls during button/keyboard navigation.
- Inline command search and a keyboard-opened command dialog, built on Combobox.
- Aspect ratio, flex, grid and adjustable panels with a native keyboard-operable
  range control. Panel resizing introduces no library or persistent cookie.
- Grouped navigation, menu actions, dialog and drawer forms.
- A single paste-friendly numeric verification field with a six-cell visual
  readout, validation and demo resend feedback.
- Delta badges, change bars, ranked bar lists and dismissible analytical callouts.

These are application compositions, not additional public component vocabulary.
Each pattern loads through its own dynamic import.

## Acceptance boundaries

Example route presence is checked separately from interaction and rendered
acceptance. A directory entry alone does not establish feature parity. The browser
suites exercise local workflows, keyboard behaviour, both colour schemes and
narrow layouts. Screenshots are reviewed at 390/768/1440px. Deterministic visual
baselines cover analytics, reference, form and overlay states; the remaining
example screenshots are review artifacts from `pnpm shots`.

The accounting report's prior comparison is an explicitly labelled fixed demo
cohort. Payroll recording is idempotent per employee and updates the local ledger.
Snoozed mail lives in the Snoozed folder until moved back; the demo does not run a
background scheduler. File preview reads at most 64 kB of supported local text.

## Source inventory and open acceptance

`apps/playground/src/generated/surface-inventory.json` enumerates package exports,
including compound parts and public helpers. `reference-inventory.json` records
source hashes and control locations from the sixteen Frappe recipes, 68 solid-ui
registry examples and two registered blocks. Source checkouts remain optional in
CI; the generated inventory retains their last observed source metadata.

A pending acceptance marker is deliberate: a source-to-documentation mapping or
nearby test file does not prove every state and reference behavior. Complete
per-control parity review remains required before closing the redesign. The
current execution record is `spec/redesign-progress.md`.
