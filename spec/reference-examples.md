# Application and component examples

The examples are complete local workflows built with newui's Solid, Zag and
semantic-token vocabulary. They are design and behavior references, not runtime
dependencies. The site owns the examples; packages never import application code.

## Application inventory

Each workflow has `/pages/<name>` documentation and a bare
`/pages/<name>/fullscreen` application. The persistent preview supplies
390×844, 768×900 and 1440×900 viewports. Layouts share local domain state;
the mobile variant starts with collapsed workspace navigation. Layout also
responds to viewport width on either destination.

| Workflow | What it demonstrates | Browser evidence |
| --- | --- | --- |
| Discussions | Community rail, space feeds, local creation/replies, search, read state and settings | `e2e/discussions-settings.spec.ts`, `e2e/interaction.spec.ts` |
| Compose | Rich text, preview, draft save/restore, Markdown export, local validated publication confirmation | `e2e/compose.spec.ts` |
| Deals | Pipeline board and list, filters, sorting, creation, stage moves and undo | `e2e/business-recipes.spec.ts` |
| Tickets | Service targets, priority/agent filters, sortable table, replies, assignment, resolution and creation | `e2e/business-recipes.spec.ts` |
| Mail | Folders, categories, search, unread state, stars, drafts, replies, forwarding to validated recipients, archive/trash and undo | `e2e/mail.spec.ts` |
| Files | Folder tree, grid/list, filters, favourites, local file selection, preview, download, trash/restore | `e2e/business-recipes.spec.ts` |
| Tasks | Validated creation, query lifecycle, table operations, bulk completion, virtual activity | `e2e/tasks.spec.ts` |
| Accounting | Shared ledger, date filters, cashflow/expenses/payroll/profit report, local mutations and CSV export | `e2e/business-recipes.spec.ts` |

Five compact application views map to `/pages/analytics`, mail, tasks,
`/pages/authentication` and `/pages/cards`. The eight card compositions cover
account creation, payments, team membership, sharing, notifications, support
reports, project information and cookie preferences.

All example datasets are deterministic and local. Authentication and publication
create page-local demo state. Files retain selected `File` objects in memory;
downloads preserve their contents. No email, credential, transaction or file is
sent to a remote service. Reloading starts a fresh example session.

## Registry examples and recipes

The registry contains **68** copyable `.tsx` examples. Each example has one
canonical destination in `apps/playground/src/lib/reference-examples.ts`. When a
public component owns the behavior, the destination is its atomic reference
page (for example, `DataTable` → `/organisms/data-table`). Complete application
workflows remain under `/pages`; the recipe gallery lives under `/kit/recipes`,
not in the page catalog. The coverage test checks that every destination is
valid.

Existing controls retain newui names: TextInput/Textarea for text fields,
NumberInput for number fields, Divider for separator, BottomSheet for mobile
sheets and the existing toast service for toast examples. Charts use
`@talelk/newui-charts`.

Non-component recipes cover:

- Carousel orientation, size, spacing, position API and optional playback. Native
  scroll snapping owns the track; automatic playback pauses for interaction and
  reduced motion. Only the track scrolls during button/keyboard navigation.
- Inline command search and a keyboard-opened command dialog, built on Combobox.
- Adjustable panels with a native keyboard-operable range control. Panel
  resizing introduces no library or persistent cookie. Aspect-ratio, flex and
  grid examples are linked from the Foundations layout-rhythm section.
- Grouped navigation, menu actions, dialog and drawer forms.
- A single paste-friendly numeric verification field with a six-cell visual
  readout, validation and demo resend feedback.
- Delta badges, change bars, ranked bar lists and dismissible analytical callouts.
- A multi-step setup form with validation, review and completion states.
- Confirmation, edit-form and mobile-sheet overlay examples.

These remain Kit recipes until a pattern earns a stable public API. They load
through separate dynamic imports and do not inflate the Pages catalog or invent
component vocabulary.

## Acceptance boundaries

Example route presence is checked separately from interaction and rendered
acceptance. A directory entry alone does not establish feature completeness. The
browser suites exercise local workflows, keyboard behavior, both color schemes
and narrow layouts. Screenshots are reviewed at 390/768/1440px. Deterministic
visual baselines cover analytics, reference, form and overlay states; the
remaining example screenshots are review artifacts from `pnpm shots`.

The accounting report's prior comparison is an explicitly labeled fixed demo
cohort. Payroll recording is idempotent per employee and updates the local ledger.
Snoozed mail lives in the Snoozed folder until moved back; the demo does not run a
background scheduler. File preview reads at most 64 kB of supported local text.

## Generated inventories

`apps/playground/src/generated/surface-inventory.json` enumerates package
exports, including compound parts and public helpers. The example registry and
its destinations are generated from `apps/playground/src/lib/reference-examples.ts`;
the generated inventory is a local coverage record and CI does not require any
external checkout.
