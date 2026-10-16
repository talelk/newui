# Reference restoration and design-system completion

## Current acceptance status

The reference-restoration acceptance matrix remains unfinished. The compact
visual redesign is implemented and verified in the final section below; that
work does not certify exhaustive reference parity. The per-control acceptance
matrix is **not closed**.

Existing unrelated working-tree changes were retained. Reference checkouts remain
read-only. No package publication has been performed.

## Implemented in this pass

| Surface | Implementation and documentation | Verification |
| --- | --- | --- |
| Public inventory | `scripts/sitegen.ts` emits `generated/surface-inventory.json`: 785 exported declarations and compound entries, implementation paths, documentation destinations and candidate tests | `pnpm site:check`, reference coverage tests |
| Reference inventory | `generated/reference-inventory.json`: 16 Frappe variants, five solid-ui applications, 68 registry examples and two registered blocks; source digests and control locations | Source checkout reconciliation; acceptance remains pending per source |
| Contracts and generated APIs | Menu/ScrollArea included; charts and both editors included; legacy contract names resolve explicitly; inherited local Field/recipe properties included; default annotations rendered | `pnpm api:check`, `pnpm site:check`, strict types |
| Documentation | Components, Blocks, Charts, Editors and Examples; package guides load from package README files; each application has one guide and a fullscreen route | Route/nav consistency, isolated registry and reference browser audits |
| Preview | Private ResponsivePreview used by applications and blocks; 390×844, 768×900, 1440×900; persistent iframe, URL viewport, lazy source, copy, fullscreen, theme/direction sync | `e2e/responsive-preview.spec.ts` checks dimensions, document identity, task/comment retention, keyboard controls and iframe-owned overlays |
| BottomSheet | Pointer drag, touch scrolling distinction, 96px threshold, cancellation, non-dismissible behavior and reduced-motion snap-back | Existing component tests plus real touch events through CDP in the preview scenario |
| Tasks | Project/My Tasks navigation, assignee/status/priority filtering, collapsible groups, table controls, sorted/paginated mobile list and project sheet, details editing and comments; 1,000-row scale fixture retained | `tasks-data.test.ts`, `e2e/tasks.spec.ts`, persistent-preview workflow |
| Mail | Account-local inbox switching, navigation collapse, keyboard pane resizing, mobile mailbox sheet, list/reading composition and sticky reply tools | `e2e/mail.spec.ts` including account and mailbox lifecycle |
| Files | Existing folder/upload/download/trash workflows retained; mobile contextual action sheet added; fixtures extracted | `e2e/business-recipes.spec.ts` |
| Deals | Pointer/touch drag handle, ordering, cancellation, edge scrolling, snapping board and equivalent keyboard stage control; immutable undo | `deals-data.test.ts`, pointer cancellation at 390/768/1440 and wide drop/undo scenario |
| Tickets | Mobile cards and selection, open/all/closed views, assignment/SLA queues and local bulk resolution | `e2e/business-recipes.spec.ts` |
| Accounting | Calendar monthly/quarterly aggregation, date presets and cash-account movements; fixtures extracted; dialogs/chart loaded on demand | `accounting-data.test.ts`, business recipe browser scenarios |
| Compose | Mention candidates, sticky toolbar, paragraph/link/history tools and reactive readonly controls; existing drafts/preview/export/publication retained | EditorToolbar unit tests and `e2e/compose.spec.ts`, including link/history/draft restoration at all three preview widths |
| Discussions | One responsive route with shared posts/selection/replies, lazy desktop/mobile compositions and persistent settings; local community/member/profile actions; explicit unavailable password-service explanation | `e2e/discussions-settings.spec.ts` including a settings draft across resizing |
| Editors and charts | Isolated lazy demos; chart loading/error/empty controls; CodeMirror grammars load on demand with stale-request/unmount guards | Existing chart/editor tests plus grammar/edit/readonly browser scenario |
| solid-ui blocks | Copyable `sidebar-01` and `demo-sidebar` site compositions; neither is falsely exported by the blocks package | Responsive frame and source review |

Superseded Desktop/Mobile destinations and their callers were migrated. The old
Atoms/Feedback route modules were retired after moving their demonstrations into
canonical component references, the toast demo, spinner/LoadingText demo and
foundations. `/spec` and `/play` remain harness routes.

## Verification record

- `/tmp/newui-reference-verify.log`: first full run; exposed stale route tests,
  expected reference screenshots, unused icon dependency and route overruns.
- `/tmp/newui-reference-verify-attempt2.log`: 1,015 unit/a11y tests, 40 SSR tests,
  117 real-CSS component tests and 114 browser scenarios passed. Remaining failures
  were one strict heading locator, formatting and two route budgets.
- `/tmp/newui-reference-verify-final.log` and
  `test-results/redesign/reference-verify.log`: final complete run, **all 19 steps
  passed**. 152 unit/a11y files / 1,016 tests; 23 SSR files / 40 tests; 58 component
  browser files / 117 tests; 117 application/browser scenarios. The latter
  includes all 68 registry destinations and all 85 reference pages in both
  schemes, plus interaction, preview, touch, responsiveness and visual checks.
- Two intermediate integrated component-browser runs stalled after 49 files and
  were interrupted. The independent rerun passed all 58 files / 117 tests in
  12.57 seconds. The final stable-tree full run passed that same gate in 13.3
  seconds. Interrupted logs remain investigation evidence, not passing runs.
- Both reference-page screenshot changes were inspected in light and dark before
  deliberate regeneration. Analytics, form and overlay baselines are retained.

Budgets are not raised to hide regressions. CodeMirror grammar loading isolates
unused languages. Accounting dialogs are loaded only when opened; Discussion
layouts are loaded by the actual viewport. The old 100kB mobile Discussion budget
is retained as a separate 390px measurement of the consolidated fullscreen route.

## Acceptance still open

The generated inventories are reconciliation and investigation artifacts, not a
claim that every source control has a matching behavioral assertion. Entries
remain `pending` until their individual reference state/behavior is reviewed.

Outstanding acceptance work includes complete per-control bindings between
reference behavior, implementation, executable example and assertion; exhaustive
screen-by-screen parity review of all sixteen Frappe variants; independent review
of each of the 68 registry variants; and visual/interaction review of every
public compound part, helper and state. Source files and nearby test candidates
alone do not close these rows. Some registry variants intentionally reuse a
family module and still need distinct-behavior acceptance review.

Application Source now includes local dependencies as described in the continuation
record below. Complete defaults/native inherited prop documentation still needs
a per-contract audit beyond generated declared/local inherited props. Compose's
remaining reference toolbar gaps include strike, alignment, font color, video,
blockquote, inline code and horizontal rules; the current executable editor
contract lists only the tools actually shipped.

The original Tremor-led visual-system checkpoint used `pnpm shots`, compact 32px
controls, neutral/blue semantic tokens and both colour schemes. That was the
preceding density checkpoint; the compact pass below supersedes its sizing,
typography and spacing defaults.

## Final rendered review and runtime evidence

- `/tmp/newui-reference-viewports`: 48 viewport screenshots, all eight families
  at 390/768/1440 in both schemes. Inspected representative mobile, tablet and
  desktop surfaces; these pictures are review artifacts, not exhaustive parity
  certification. The final Deals/Tickets summary-card adjustment is refreshed in
  the final-mobile set below.
- `/tmp/newui-reference-mobile-review`: 18 full-page Tasks/Mail/Discussions shots.
- `/tmp/newui-reference-business-review`: 18 full-page Files/Deals/Tickets shots.
- `/tmp/newui-reference-shots`: partial additional documentation, block, chart,
  editor and application pictures. This larger capture was interrupted; it is
  not recorded as a complete screenshot sweep.
- `/tmp/newui-reference-final-mobile`: refreshed 390px Tasks/Mail/Deals/Tickets,
  both schemes, after the final compact-layout corrections.
- Two light/dark reference navigation baselines were deliberately updated after
  inspection; the final integration passed all visual tests without updates.
- Package budgets: UI barrel 242.88 kB against 245; Button 9.88 against 11.
  Representative route results: home 54.2 against 60; Accounting 319.9 against
  330; Discussions desktop 118.7 against 140 and mobile 96.3 against 100;
  code-editor reference 268.7 against 280. The verification log is authoritative
  for exact final measurements.
- Preview scripts now share `scripts/preview-server.ts`: they own Vite directly,
  require their own startup signal, reject occupied ports and stop their server
  on normal exit or interruption. Successful screenshot capture confirmed that
  port 4182 was released. The user's development server on 5173 is untouched.

This record captures the implementation before commit. Integration success establishes this increment;
it does not close the outstanding acceptance work listed above.

## Continuation: application sources and editor controls

- Application guides expose a file selector, package requirements, single-file
  copying and whole-application copying. `scripts/sitegen.ts` follows static,
  type, re-export and literal lazy imports into per-application path manifests.
  Source text remains in the originals and is loaded only on demand. Stale
  manifests and unresolved/nonliteral local imports fail generation checks.
- All twelve application guides have source manifests. Tasks includes its
  repository, table and activity views; Discussions includes both responsive
  screens, shared store and lazy settings; Accounting includes its private
  dialogs and chart. The snippets depend on the documented site Tailwind setup
  and listed package imports; they are not standalone project scaffolds.
- Source controls preserve the same iframe and any open record. File selection
  loads only that file; Copy all files loads the complete local source graph.
  Clipboard errors produce a visible status. Source fetch errors stay inside
  the source panel so the preview remains usable.
- EditorToolbar now exposes Paragraph, Link, Undo and Redo using already installed
  TipTap capabilities. Link creates/edits/removes marks, cancellation preserves
  content, history controls reflect availability, and readonly disables all
  controls without emitting a document change. No new runtime dependency.
- Focused verification: five responsive-preview scenarios (source copying and
  persistent task/comment state included), eight Compose scenarios (link/history
  and draft restoration at 390/768/1440), and 34 editor unit tests passed before
  the final narrow-width/source-reload checks. Integration results follow below.
- `/tmp/newui-continuation-verify.log`: all 19 integration steps passed with
  1,019 unit/a11y tests, 40 SSR tests, 117 real-CSS component tests and 121
  application/browser scenarios. Existing visual baselines passed unchanged.
- `/tmp/newui-continuation-review`: fourteen fresh screenshots: Source at
  320/390/768/1440 and Compose at 390/768/1440, both themes. Inspected Source at
  320 light and 768 dark, plus Compose at 390 dark and 1440 light. Source code
  scrolls inside its panel; controls fit at 320 and the toolbar wraps at 390.
- A subsequent source-download failure probe found that a resource dependency
  could throw outside the source panel boundary. The guarded dependency read is
  fixed. All six responsive-preview scenarios now pass, including a blocked
  source manifest followed by returning to the same filtered task session.
  A final full verification is run after this correction.
- Final current-tree evidence is preserved under `test-results/redesign/`:
  `continuation-verify-final.log`, `continuation-component-rerun.log` and
  `continuation-recheck.log`. The full invocation passed 17 gates, including
  1,019 unit/a11y tests, 40 SSR tests and all 122 application/browser scenarios.
  Its component runner stalled after 43 files and the owned Vitest child was
  terminated; this is an interrupted gate, not an assertion failure or pass.
  The independent component rerun passed all 58 files / 117 tests in 14.93s.
  Lighthouse's throttled performance score was 0.54 against the unchanged 0.60
  floor during that full run; every other Lighthouse audit passed.
- `pnpm verify --only=lighthouse,test:browser` then passed both affected gates
  on the same implementation: Lighthouse in 13.2s and component browser tests
  (58 files / 117 tests) in 12.10s. All 19 gates have current passing evidence
  across the full run and this recheck. This is not represented as a clean
  single-invocation full pass. The intermittent component-runner stall remains
  an operational reliability concern; no assertion, baseline or budget was
  weakened to accommodate it.
- The fourteen inspected/captured render artifacts are also copied into
  `test-results/redesign/continuation-review/`. Existing visual baselines passed
  unchanged in both full application-suite invocations. No new runtime
  dependency was added, and every package and route budget remains unchanged.

These changes close the application-source omission and part of the Compose
toolbar gap. They do not establish exhaustive reference behavior acceptance.


## Compact solid-ui redesign — 2026-10-15

This pass implements the supplied compact library-and-site plan on top of the
uncommitted reference-restoration tree. Earlier reference-parity acceptance gaps
remain tracked above and are outside this visual refactor. Reference checkouts
remain read-only; no new framework or runtime dependency was added.

### Implemented surfaces

- `visual-system.md` now specifies 28px default controls, 24/30 page headings,
  18/24 sections, 28/32 metrics, 36/40 hero text, 12px cards and 16px section gaps.
  Explicit control sizes and checkbox/radio/avatar geometry remain available.
  Dialogs retain 16px padding; mobile navigation actions retain 40px targets.
  Editor toolbar commands also use 28px controls.
- Button, text entry, selectors, date/time triggers, Duration, tabs, toggle
  groups and pagination default to sm. NumberInput's fixed geometry is 28px.
  Identical field sizes and popup variants share private `control-styles.ts`.
  Wrappers inherit these defaults. Cards and chart cards use 12px padding.
- One navigation tree drives the contextual 224px sidebar, remembered 48px
  icon rail, modal mobile drawer, breadcrumbs and reading order. Reference
  filtering/group headings remain. The 48px header has compact utilities and
  a lazy keyboard page finder; enlarged text can wrap its actions. Developer
  links are secondary. Previous/next links form a compact footer row.
- Applications and blocks retain exact native-size iframe viewports. The shared
  private preview/source surface also serves inline component demos, which stay
  mounted while browsing Source. File selection and application state survive
  view changes. Source actions share a toolbar; package setup is expandable.
  Errors remain contained. Keyboard focus reveals controls inside the host's
  scrollport without moving overlays out of the iframe document.
- Embedded documentation links navigate the host; application anchors retain
  their iframe session. Analytics domain anchors now use local fragments.
  Standalone/fullscreen routes retain their canonical URLs and bare layouts.
- Component, block and application catalogs use icon rows. Contract-derived
  summaries supply purpose without duplicating descriptions by hand. Reference
  headers and section anchors retain executable usage, prop tables and contracts.
  Home, installation, foundations and error pages follow compact spacing.
- Shared and independent application shells were tightened across Tasks, Mail,
  Files, Deals, Tickets, Accounting, Compose, Discussions, Analytics,
  Authentication, Cards and Settings. State and responsive composition branches
  remain above layout changes. Frequent navigation/arrow glyphs use Lucide.
- Contracts, the UI package guide, migration guidance, inherited default
  annotations, generated API/site data and `.changeset/compact-controls.md`
  document the consumer-visible default changes.

### Visual evidence

- `/tmp/newui-compact-before`: 267 before screenshots from the pre-change built
  site. The sweep was interrupted near its end by a subsequent build; this is
  a partial baseline, not a complete before sweep. It includes documentation and
  every application family at all three widths; the last dark/mobile destinations
  are incomplete. Earlier baseline artifacts listed above remain available.
- `/tmp/newui-compact-state-review`: light/dark form states, overlays and
  reference screenshots inspected before deliberately refreshing visual tests.
- Analytics and reference visual differences were inspected in both themes,
  including 390/768/1440 analytics layouts. Visual baselines were deliberately
  refreshed for the changed defaults, typography and shell.
- `test-results/redesign/compact-navigation-review`: fourteen development-server
  Source/navigation screenshots, including 320px Source, mobile drawers and
  page finding. Inspection led to explicit finder centering and a full-width
  Source selector on small screens. `compact-navigation-final/` contains fourteen
  corresponding built-site captures; inspected Source at 320px, the centered
  finder and the actual 48px collapsed rail.

### Verification

- Focused unit checks: nine files / 55 tests passed.
- Focused preview/navigation/visual increment: 21 browser scenarios passed.
  The new scenarios cover rail persistence, modal focus containment/restoration,
  page finding, active links, breadcrumbs, embedded links, catalog keyboard
  access, RTL/enlarged-text overflow, inline retained drafts and clipboard errors.
- Existing rendered-size scenarios now assert 28px defaults. Real-CSS Button and
  TextInput tests retain explicit md=32px coverage. Labelled, invalid, disabled,
  loading and icon-only controls remain exercised.
- Intermediate checks passed unit/SSR tests, CSS emission and package budgets.
  Site data was regenerated after the check run observed inherited default
  annotation drift. This intermediate invocation is not final certification.
- The expanded browser run exposed three additional issues: the old mobile Menu
  scenario needed to follow the contextual section navigation; the enlarged-text
  Analytics utility group needed to wrap; and changing reference destinations
  retained a stale Source panel. The tests retain their behavioral assertions,
  and each implementation issue is corrected. Source loading now keys to the
  destination, with a route-switch regression assertion.
- The corrected focused run passed 34 scenarios, including all refreshed visual
  baselines. Navigation from authentication/cards into Analytics now targets the
  bare application route inside the iframe; documentation links leave the frame.
- Final stable-tree `rtk pnpm verify`: **all 19 steps passed in one invocation**.
  Evidence: `test-results/redesign/compact-verify.log`. This run passed 152
  unit/a11y files / 1,019 tests, 23 SSR files / 40 tests, 58 real-CSS browser
  files / 118 tests and 129 application/browser scenarios. All visual baselines
  passed without updates in this integration run. No component-runner stall.
- Every original package and route budget passed. Representative results:
  Button 9.88/11 kB, UI barrel 242.56/245 kB, home 55.9/60 kB,
  chart reference 278.0/280 kB and Accounting fullscreen 321.7/330 kB.
  Lighthouse passed every audit; throttled performance was 0.71 against 0.60.
- The browser suite includes all domain workflows, iframe/source state retention,
  host-versus-application navigation, keyboard/focus, RTL, actual 200% text,
  narrow-screen overflow, touch gestures, accessibility and reduced motion.
  Earlier reference-parity gaps remain separate from this passing visual increment.


Final capture continuation: the default after sweep received SIGTERM after 259
pictures, leaving its owned preview server orphaned on 4182. The orphan's argv
was checked and that server was stopped. A temporary copy of the screenshot
script skips existing route/theme/width files and captures the 23 missing pairs;
no acceptance or budget check was changed. The earlier failed resume correctly
rejected the occupied port. The final sweep is therefore recorded as a resumed
capture rather than one uninterrupted invocation. Compose guide/fullscreen screenshots are refreshed after final verification to
include the final 28px editor toolbar alignment.


The after sweep is now complete: **282 images, 47 routes × 3 widths × 2 themes**
in `test-results/redesign/compact-after/`. `compact-navigation-final/` contains
14 built-site navigation/Source captures; `compact-settings/` contains six open
Settings dialog captures. Comparison sheets in `compact-review/` cover all twelve
families at desktop, tablet and mobile widths in both themes. These sheets were
inspected alongside full-size reference, Source, drawer, finder, rail and Settings
pictures. The reference before/after comparison confirms the removed header
navigation, smaller defaults, compact anchors/source controls and footer.

The initial before sweep remains partial (267 pictures); no missing historical
view is represented as a freshly captured baseline. No earlier reference-parity
gap is closed solely by these visual artifacts.


Final artifact preservation: Playwright cleared its shared `test-results` output
when the full browser gate began. The final matrix was therefore recreated from
the verified build in six bounded 47-image batches under
`/tmp/newui-compact-after-final`, then copied back after testing. The corresponding
`newui-compact-final-{theme}-{width}.log` files and
`compact-capture-manifest.json` record all 282 final files and their hashes.
The navigation and open Settings captures were recreated from the same build.
This final matrix includes the 28px Compose toolbar; the earlier Compose-only
refresh and intermediate review files are not the authoritative final capture.
Source backups remain outside Playwright's output directory.

Existing source work was retained, reference
checkouts were not edited, and no approval, publication or release was performed.
The remaining historical limitation is the partial before capture; no functional,
visual-test, accessibility or budget failure remains open for this compact pass.


## README and dependency refresh — 2026-10-15

The root README includes a live Tests workflow badge, SolidJS, Tailwind CSS and
pnpm badges, workspace commands, package responsibilities and the corrected
28px control default. No license or published-package badge is asserted without
repository evidence.

Updated all external direct runtime and development dependencies across the 11
workspaces against npm's stable `latest` tags, including Vite 8.3.4, Vitest 5.0.5,
TypeScript 7.0.2, TanStack Table 9.3.1, TipTap 3.32.0 and Playwright 1.64.1.
The pnpm package manager already matches latest (12.11.2). Direct registry
comparison covers 97 distinct packages, including the two compiler aliases.
Fresh releases use package/version-specific pnpm release-age exceptions;
no global release-age policy or build/bundle budget was lowered.

Microsoft's documented side-by-side compiler arrangement keeps TypeScript 7's
`tsc` and aliases the TypeScript 6 compatibility API for typescript-eslint:
https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
There are no peer-dependency conflicts. Vitest's Playwright provider now owns
Chrome launch options. Bundle measurement uses Vite 8's Oxc minifier and
Rolldown options. The shared application table now declares only its used
features, registers sorting functions and reads reactive state atoms.

GitHub Actions dependencies now use checkout 7.0.1, setup-node 7.1.0,
upload-artifact 7.0.2, pnpm/action-setup 6.1.0 and changesets/action 2.1.2,
verified against the repositories' latest stable releases. Existing pipeline
steps, thresholds and visual baselines remain in place.

Verification evidence and final outcome are recorded below after the stable-tree
run. Runtime artifacts remain ignored; logs are preserved outside Playwright's
output directory so browser cleanup cannot erase them.

The first integrated upgrade run exposed Rolldown namespace helpers folded into
an ECharts chunk: mobile Discussions fetched 260.2 kB and the code-editor
reference fetched 432.3 kB. Docs also exceeded its 60 kB limit at 60.4 kB.
The app build now groups its existing initial dependencies and gives chart
modules entry-aware boundaries. No package code is added to the shell, routes
remain lazy, and chart families keep their separate dependency sets. Focused
browser measurements after the fix: home 53.8 kB, docs 55.2 kB, mobile Discussions
94.7 kB, code-editor reference 266.9 kB and bar-chart reference 271.1 kB. These
fit the unchanged budgets. Abandoned chunk experiments were removed.

The updated axe 4.14 label-content-name-mismatch rule exposed nine browser
failures while all other checks, including visual baselines, passed. Fixes retain
visible text in invoice and calendar action names, allow home preview/mail rows
to derive names from their visible content, and hide custom navigation avatars
from the accessibility tree beside their explicit labels. Mail rows keep a
screen-reader-only Open prefix. The existing calendar a11y scenario now audits
day, month and year views. No axe rule was disabled.

The calendar extension additionally found full-month names that omitted the
visible abbreviated month token; cell names now preserve both. Mobile navigation
uses its visible label as the native name and keeps avatar content decorative.
Discussion community navigation uses distinct Lucide glyphs with its existing
unread counts and tooltips. The existing MobileNav custom-content unit scenario
now asserts the destination name with visible avatar initials present.

### Final dependency-refresh verification

- `rtk pnpm verify`: **all 19 steps passed in one completed invocation**, on the
  final implementation and test tree. Log: `/tmp/newui-deps-final-all.log`, copied
  to `test-results/redesign/deps-verify.log`.
- 152 unit/a11y files / 1,019 tests; 23 SSR files / 40 tests; 58 real-CSS browser
  files / 118 tests; 129 application/browser scenarios.
- Every library and route budget passed without threshold changes. Lighthouse
  passed all budgets (performance 0.71, floor 0.60).
- Existing visual baselines passed unchanged. Six new Discussions screenshots
  were captured and inspected at 390/768/1440 in light/dark schemes: the new
  community glyphs preserve spacing, unread counts and responsive composition.
  Originals: `/tmp/newui-deps-discussions-shots`; restored review copy:
  `test-results/redesign/deps-discussions`, with a contact sheet alongside it.
- All 109 installed direct dependency entries match the checked stable npm
  latest tags (97 distinct registry packages); frozen-lockfile installation and
  peer checks passed. GitHub Action versions were checked against stable releases.
- Earlier failed/interrupted runs remain in `/tmp/newui-deps-*.log` as diagnostic
  evidence. The final run supersedes them. Earlier reference-parity gaps above
  remain tracked separately; no package publication was performed.

The README, completed compact redesign and dependency refresh are prepared for
commit and push together under the user's instruction. Generated API/site/CSS
files and release notes are included; runtime artifacts remain ignored.

### Transitive audit follow-up

Commit `6fda044` was pushed to `main` after the complete 19-step verification.
A follow-up audit found Typography 0.5.20's pinned postcss-selector-parser 6.0.10
under GHSA-rj75-hqrm-r3gf. A package-specific pnpm override selects patched
7.1.6 until Typography updates its own pin. The override does not alter budgets,
audit rules or the package's public API.
Advisory: https://github.com/advisories/GHSA-rj75-hqrm-r3gf
