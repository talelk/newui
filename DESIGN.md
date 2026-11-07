---
name: newui
description: A compact, data-dense SolidJS component library and the documentation site that proves it.
colors:
  canvas: "oklch(0.954 0.005 247.9)"
  sheet: "oklch(1 0 0)"
  canvas-dark: "oklch(0.171 0.012 254.2)"
  sheet-dark: "oklch(0.203 0.016 256.8)"
  panel: "oklch(0.976 0.003 264.5)"
  ink: "oklch(0.189 0.019 255.8)"
  ink-secondary: "oklch(0.241 0.024 256.4)"
  ink-muted: "oklch(0.489 0.028 256.2)"
  ink-faint: "oklch(0.612 0.025 254.5)"
  ink-on-dark: "oklch(0.966 0.005 247.9)"
  border: "oklch(0.923 0.008 253.9)"
  border-dark: "oklch(0.375 0.025 253.1)"
  petrol: "oklch(0.443 0.079 224.9)"
  petrol-deep: "oklch(0.389 0.069 224.6)"
  petrol-wash: "oklch(0.968 0.009 214.3)"
  success: "oklch(0.53 0.122 156.15)"
  warning: "oklch(0.612 0.136 63.758)"
  danger: "oklch(0.497 0.185 27.335)"
  accent-violet: "oklch(0.545 0.18 287.523)"
typography:
  hero:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
    letterSpacing: "-0.015em"
  section:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "-0.005em"
  metric:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.02em"
  interface:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 420
    lineHeight: "18px"
    letterSpacing: "0em"
  caption:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 420
    lineHeight: "16px"
    letterSpacing: "0em"
rounded:
  control: "4px"
  card: "6px"
  overlay: "8px"
  pill: "9999px"
spacing:
  control-gap: "8px"
  control-pad: "8px"
  field-gap: "12px"
  card-gap: "16px"
  card-pad-compact: "12px"
  card-pad: "16px"
  card-pad-wide: "20px"
  section-gap: "24px"
  page-gutter-compact: "16px"
  page-gutter: "24px"
  page-gutter-wide: "32px"
  page-stack: "32px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.sheet}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "{colors.petrol-deep}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  button-secondary-hover:
    backgroundColor: "{colors.border}"
  button-outline:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  badge:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "1px 6px"
    height: "20px"
  overlay:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.overlay}"
    padding: "16px"
  nav-item:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "28px"
---

# Design System: newui

## Overview

**Creative North Star: "The Instrument Panel"**

newui is a working surface, not a showcase. It is built for people who spend
the day inside business software — ledgers, queues, dashboards, settings — and
it assumes the screen is a tool they operate rather than a page they admire.
Density is the default: controls are 28px, interface text is 13px, captions are
12px, every gap lands on a 4px rhythm, and a table row is 28px — about 26 rows
on a 900px screen. Structure is drawn with 1px borders and type.
Colour is a signal, not an atmosphere.

The mood is compact and workmanlike. Nothing is decorative for its own sake:
there are no gradient meshes, no glass panels, no illustration holding up a
product claim. The application sits in a cool Mist frame, and data lives on
white sheets inside it, so the eye goes to the records rather than the chrome.
Petrol marks action, selection, focus and the row being worked on, and almost
nothing else; a reader should be able to find the one thing they can do on a
screen by following the Petrol. Headings tighten as they grow, numbers are
tabular, and motion is a state change rather than an entrance.

The same system runs the library and the documentation site that demonstrates
it. A reference page is not a special case of the brand: it is the product's
card, row, badge and field vocabulary applied to prose and code. That is why
the site's chrome imports no component — the shell is plain markup over the
same semantic tokens a consumer uses.

**Key Characteristics:**

- **Density as the default.** 28px controls, 28px navigation and table rows,
  13/18 interface text; compact is the normal setting, `comfortable` the
  opt-out.
- **Frame and sheets.** The Mist canvas holds navigation and page chrome;
  white sheets hold data. KPIs share one ruled strip instead of a card each.
- **One working accent.** Petrol is reserved for action, selection, focus and
  the active row; status has its own three colours and data can borrow violet.
- **Border-first depth.** Cards are flat with a 1px outline; only genuinely
  floating surfaces carry a shadow.
- **IBM Plex Sans at 420.** One variable family: tabular figures by default,
  a semi-condensed width for table headers, hierarchy from weight before size.
- **States are visible without colour alone.** Error carries a message,
  selection carries `aria-current` or `data-state`, focus carries an outline.
- **Documentation chrome equals product chrome.** The site is built from the
  same tokens, radii and spacing roles it documents.

## Colors

A cool Mist frame, white data sheets, one Petrol accent and three status
accents. The values live in `packages/tokens/src/tokens/instrument.js`, a
hand-authored layer over the Figma export (ADR-0016); the `blue` theme name is
kept and resolves to Petrol.

### Primary

- **Petrol** (oklch(0.443 0.079 224.9), `#0E5C74`): the action and selection
  colour. Solid primary buttons, current links, selected rows, checked
  controls, the focus ring and the active row's leading edge. It never appears
  as decoration, and a screen should rarely carry more than one Petrol-filled
  control.
- **Petrol Deep** (oklch(0.389 0.069 224.6)): the hover and pressed step under a
  solid Petrol surface, and the text colour for inline links.
- **Petrol Wash** (oklch(0.968 0.009 214.3)): selected rows, the active row,
  subtle accent buttons and selected chips.

### Secondary

Status accents, each with a wash, an ink and a solid fill drawn from the same
ramp:

- **Success Green** (oklch(0.53 0.122 156.15)): completed, paid, healthy,
  positive delta. Paired with a label or icon; green alone is not a status.
- **Warning Amber** (oklch(0.612 0.136 63.758)): attention, pending, degraded,
  due soon. The least saturated accent, deliberately.
- **Danger Red** (oklch(0.497 0.185 27.335)): invalid, destructive, failed,
  overdue. Always accompanied by text — a red border alone is not an error.
- **Accent Violet** (oklch(0.545 0.18 287.523)): categorical data and a fourth
  theme for charts and badges. It is not an action colour.

### Neutral

- **Mist** (oklch(0.954 0.005 247.9), `#EDF0F3`, `surface-canvas`): the frame —
  the app shell's background and the sidebar. Navigation and page chrome live
  here.
- **Sheet** (oklch(1 0 0)): where data lives — tables, the stat strip, filter
  bars, forms, dialogs, the current navigation item.
- **Panel Gray** (oklch(0.976 0.003 264.5)): the subtle fill — table headers,
  hovered rows, code chips.
- **Graphite** (oklch(0.241 0.024 256.4), `#18202B`): primary text and headings.
- **Pewter** (oklch(0.489 0.028 256.2), `#566170`): secondary text — column
  headers, captions, descriptions, metadata.
- **Ink Faint** (oklch(0.612 0.025 254.5)): placeholders and quiet icons. It is
  deliberately below AA on white; text that must be read uses Pewter.
- **Rule** (oklch(0.883 0.012 252.1), `#D3D9E0`) and the lighter outline step:
  the 1px lines on sheets, dividers, table rules and fields.

Dark mode keeps the same semantic names and its own tuned palette rather than
an inversion: the canvas `oklch(0.171 0.012 254.2)` sits below the sheet
`oklch(0.203 0.016 256.8)`, and Petrol lifts to `oklch(0.732 0.087 216.9)` so it
stays legible. A solid blue surface also inverts its text:
`ink-base` is white in light mode and near-black in dark mode, so contrast holds
without a second set of button classes.

### Named Rules

**The One Signal Rule.** Petrol is for action and selection. If a Petrol
element cannot be clicked, cannot be selected, or does not indicate where the
reader is, it is the wrong colour. Status uses green, amber or red; category
uses violet.

**The No Raw Ramp Rule.** Components reference semantic roles — `surface-*`,
`ink-*`, `outline-*` — never a palette step such as `blue-700` or a hex value.
A component that needs a new colour needs a semantic token first.

**The AA Pairing Rule.** Every foreground/background pairing a recipe can ship
is asserted against WCAG AA in both themes. A pairing that fails is a
legibility bug, not a taste call.

## Typography

**Display Font:** IBM Plex Sans (variable, self-hosted; ui-sans-serif,
system-ui, sans-serif fallback)
**Body Font:** IBM Plex Sans (same stack)
**Label/Mono Font:** the same family for labels; code uses the platform mono
stack, not a second brand face.

**Character:** one family, two widths, four working weights, and a default
weight of 420. Plex's figures are tabular by default, so money, counts and dates
line up in a column without a feature flag; its width axis gives table headers
a semi-condensed face (`font-stretch-semi-condensed`) that fits more columns
without dropping size. Headings lean on weight rather than size: a 20px
semibold page title is the loudest thing in the product.

### Hierarchy

- **Hero** (600, 32/38, -0.025em): the home page statement and an application's
  marketing panel. One per page; it never appears inside a card.
- **Heading** (600, 20/26, -0.015em): page titles, dialog titles, the largest
  in-product heading.
- **Section** (600, 15/20, -0.005em): card titles and section headings; the
  workhorse heading of a dense screen.
- **Metric** (600, 22/28, -0.02em): a single KPI value in the stat strip.
  Always paired with a caption naming the measure.
- **Interface** (420, 13/18, 0): body copy, controls, navigation, table cells —
  the default for almost everything a person reads or clicks.
- **Column header** (500, 12/16, semi-condensed, Pewter): table headers.
- **Caption** (420, 12/16, 0): metadata, helper text, badges, timestamps. This
  is the floor; nothing informative ships below 12px.

### Named Rules

**The 420 Rule.** Body text is 420, not 400. Medium is 500 and semibold is 600.
Do not fake weight with `text-shadow` or synthetic bolding; the variable font
already carries the steps.

**The Tight Heading Rule.** Negative tracking belongs to 15px and above. Body
and caption text stay at 0; shrinking a small label with negative tracking is
how dense interfaces become unreadable.

**The Tabular Metric Rule.** Any number that can sit in a column — money,
counts, percentages, durations — must line up. Plex's default figures are
tabular; keep `tabular-nums` on metric and table cells anyway, so a fallback
face behaves the same.

## Layout

Layout is a 4px rhythm expressed through named roles. The documentation shell
is a 48px sticky masthead over a 224px contextual sidebar at 1024px and above;
the sidebar collapses to a 48px icon rail, and below 1024px the same navigation
model becomes a 288px modal drawer. Content is capped at 1440px, with a 16px
compact gutter on narrow screens, 24px at standard widths and 32px at wide
widths. The page stack is 32px, section gaps are 24px, card padding is 12, 16
or 20px, control groups are 8px apart, and fields sit 12px from their label.

Controls follow a four-step height scale — 24, 28, 32 and 40px — with 28px as
the default. Mobile navigation and primary icon actions keep 40–44px touch
targets even when the visual control is smaller. Application previews are
rendered at exact 390×844, 768×900 and 1440×900 documents, without scaling, and
the site is reviewed at 390, 768 and 1440 in both themes.

Dense does not mean cramped: a card's padding is a role, not a leftover, and a
table's row height comes from its 13/18 text plus 4px of vertical padding each
side (about 28px; `density="comfortable"` gives about 36px). Application pages
fold their header into one band — trail, then title with its description and
the actions — so data starts about 60px from the top. The first thing to check on a narrow screen is not whether it fits, but
whether the primary action is still reachable without horizontal scrolling.

Long-form prose is the exception to the full column: body copy holds a 30rem
measure — about 75 characters at 14px — while tables, code blocks and live
previews keep the full width. Measure is set on the paragraph, not on the
article, so a wide table never forces a wide sentence.

### Named Rules

**The Named Rhythm Rule.** Use the role — `gap-section-gap`,
`p-card-pad-compact`, `gap-control-gap` — not a one-off `p-4`. A new spacing
value is a token decision, not a component decision.

**The Reading Measure Rule.** Long-form prose stays at or under 30rem (≈78
characters at 14px). A paragraph that runs the full 768px column is a bug;
tables, code and previews are not prose and keep the column.

**The Two-Rail Rule.** The 224px sidebar and the 48px rail present the same
navigation model. Collapsing changes the presentation, never the destinations
or the reading order.

## Elevation & Depth

Border-first. A resting card is flat: 1px Border outline, Sheet surface,
no shadow. Depth is reserved for surfaces that genuinely float above the page —
dialogs, popovers, menus, the mobile drawer — and it is always paired with an
opaque surface and a border, so the panel still reads in forced-colours mode.
The shadows themselves are soft, low-contrast and short-throw; they suggest a
plane, not a drop.

### Shadow Vocabulary

- **`shadow-sm`** (`inset 0 0.25px 1.5px #ffffff29, 0 0 1px #00000033, 0 1px 3px #00000024`):
  the hover lift on an input or popup trigger, and the first step of a menu.
- **`shadow-base`** (`inset 0 0.25px 1.5px #ffffff29, 0 0 1.5px #00000029, 0 2px 5px #00000024`):
  a raised inline surface that is not yet an overlay.
- **`shadow-md`** (`…, 0 6px 12px -2px #00000014`): popovers and hover cards.
- **`shadow-lg`** (`…, 0 18px 22px -6px #0000001a`): larger floating panels.
- **`shadow-xl`** (`…, 0 24px 30px -8px #0000001a`): the dialog and menu panel;
  the default float in the component recipes.
- **`shadow-2xl`** (`…, 0 44px 52px -10px #0000001a`): the rare, large modal.

Dark mode swaps each step for its dark counterpart rather than reusing the
light shadow, because a light-mode shadow disappears on a dark canvas.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow means the
element floats; if it does not overlap the page, it does not get one.

**The Focus-Is-Outline Rule.** Focus is a 2px outline (3px in dark mode), not a
box-shadow. It therefore survives forced-colours mode, never collides with a
`shadow-*` utility, and stays visible on every surface — including a solid blue
button.

## Shapes

Controls are nearly square: 4px radius on a 28px control, 6px on a sheet or
card, 8px on an overlay, and a full pill only for badges. The restricted scale is the point —
a reader should be able to tell a control from a card from a dialog by silhouette
alone. Borders are 1px and always semantic; there are no 2px decorative frames.

Clipping follows the same roles: cards and overlays clip their contents to their
radius, menus and popovers clip to the overlay radius, and nothing else clips.
Rows are separated by 1px rules rather than nested boxes or zebra fills. Icon
buttons are square at every size (24, 28, 32, 40px) so a row of them aligns with
the text baseline. Avatars and status dots are the only perfect circles.

### Named Rules

**The Three-Radius Rule.** 4, 6, 8 — control, card, overlay. A fourth radius is
specialized geometry (a chart mark, an avatar), not a surface decision. When in
doubt, use the role name rather than a number.

## Components

The feel is crisp and utilitarian: small, square-ish, quiet at rest, and
explicit when state changes. Buttons shift a background or border step; they do
not scale, glow or bounce. Inputs own their focus; popup controls own their open
state. Every interactive component is reachable and legible with the keyboard
alone.

### Buttons

- **Shape:** 4px radius, 28px default height, 8px horizontal padding, 2px
  vertical padding, 13px interface text at 500.
- **Primary:** Petrol solid with white text; hover and press move one ramp step
  to Petrol Deep. Used once per region for the action the screen
  exists for.
- **Secondary:** Panel Gray fill with Ink Secondary text; hover steps to Border.
  This is the default button (`variant="subtle"`, `theme="gray"`), not the blue
  one — most actions should not compete with the primary.
- **Outline / Ghost:** Sheet with a Border outline, or transparent with a
  hover wash. Both keep the same geometry and text colour.
- **Hover / Focus:** a background or border step over `transition-colors`;
  focus-visible draws the outline and nothing else. Disabled keeps its label,
  drops to Ink Muted and stops the pointer; loading swaps the leading glyph for
  a 2px spinner and sets `aria-busy`.
- **Icon buttons:** square at the same four heights, no horizontal padding.

### Fields

- **Style:** 28px default height, 4px radius, 1px Border (or Panel Gray for the
  subtle variant), Sheet background, 13px text. The outline variant is
  the default for text entry.
- **Focus:** border steps to the darker gray and a `shadow-sm` lift appears; the
  focus outline is solid Petrol. The caret and selection use Petrol.
- **Label / Error:** labels sit above the control with a 12px gap; helper text
  is 12px Ink Muted. An invalid field gets a red border and a red message, and
  `aria-invalid` — colour never carries the error alone. Disabled fields keep
  their label and expose disabled semantics.
- **Adornments:** prefix and suffix glyphs sit in an 8px inset and do not change
  the control height. The field never grows to fit a long value; it scrolls.

### Cards / Containers

- **Corner Style:** 6px radius.
- **Background:** Sheet (or the elevated surface in dark mode), on the Mist
  canvas.
- **Shadow Strategy:** none at rest. Elevation is opt-in per card and follows
  the shadow vocabulary above.
- **Border:** 1px Border, always. A card without a border must earn it with a
  tonal surface, and most do not.
- **Internal Padding:** 12px compact, 16px standard, 20px wide; chart cards
  use the same three roles and do not invent their own.
- **Stat strip:** KPIs share one sheet divided by 1px rules (the sheet's
  outline through a 1px grid gap), not a card per number. Deltas are toned
  text, not pills.

### Badges

- **Style:** full pill, 20px default height, 12px text, 6px horizontal padding;
  Panel Gray fill with Ink Muted text at rest.
- **State:** subtle is the default, solid is for emphasis on a single status,
  outline is for a filter that can be removed. Themes map to the status and
  category colours; the label always names the state.
- **Behaviour:** a badge is read-only. If it can be clicked it becomes a button
  or a chip with a 24px minimum target.

### Overlays

- **Style:** 8px radius, Sheet, 1px Border, `shadow-xl`, 16px padding;
  the backdrop is a black overlay at 27% in light mode and 72% in dark, and the
  panel itself is opaque.
- **Behaviour:** focus is trapped, Escape closes, the trigger regains focus on
  dismissal, and the panel is portalled above the page. Mobile bottom sheets use
  the same surface and radius, anchored to the bottom edge.
- **Density:** dialog titles are Heading (20/26); body copy is 13/18; the footer
  is a right-aligned button row with an 8px control gap.

### Navigation

- **Masthead:** 48px sticky header on the Mist frame, 1px bottom border; the
  product mark is 24px beside a semibold wordmark. Primary links are 13px Ink
  Secondary; the current one is a piece of Sheet, as in the sidebar.
- **Documentation sheet:** the docs read like an application — masthead and
  sidebar on the Mist frame, the page and its "On this page" index on one
  white sheet. On the sheet, the current index entry carries the Petrol
  leading rule (white on white cannot mark a place).
- **Sidebar (application and docs):** on the Mist frame, 28px rows, 4px
  radius, 13px text, 8px horizontal padding. The current destination is a piece of Sheet
  with a Petrol icon and Graphite text; hover is one gray step darker than
  Mist. Counts are plain right-aligned figures. Section
  headings are sentence case — never tracked uppercase.
- **Rail:** collapsed to 56px, the sidebar is two columns of square 32px
  controls — brand, tenant and destinations above; Expand, preferences,
  Settings and the account avatar in the footer. Menus in the rail open from
  the glyph alone (no chevron) and carry a name and a tooltip.
- **Footer:** expanded, Settings and the theme switch share one row; the
  account takes the row below.
- **Mobile:** below 1024px the sidebar becomes a 288px modal drawer with 40px
  touch targets; its brand row is the header, with Close at the end. The top
  bar sits on the Mist frame with a ghost menu button; the same navigation
  model, breadcrumbs and reading order.
- **Footer:** a compact previous/next row, 8px radius, separated by a 1px top
  border and 24px of space.

### Reference page

- **Character:** the signature composition. A generated demo sits above the
  source, the prop table and the contract, in one reading column.
- **Structure:** page title at Heading; a lead paragraph at 16/24 Ink Secondary;
  sections separated by 24px and ruled with 1px borders; code in a Panel Gray
  chip or a bordered block at 13px; the prop table uses the same 32px rows and
  1px rules as any data table.
- **Rule:** the demo is the shipped component, never a mock. If the page and the
  package disagree, the page is wrong.

## Do's and Don'ts

### Do:

- **Do** use semantic roles — `bg-surface-base`, `text-ink-gray-9`,
  `border-outline-gray-1` — for every colour.
- **Do** use the named rhythm roles (`p-card-pad`, `gap-section-gap`,
  `gap-control-gap`) instead of arbitrary spacing utilities.
- **Do** keep Petrol for the action, the selection, focus and the current
  location; let everything else be neutral.
- **Do** pair every error with a message and `aria-invalid`, and every status
  with a label or icon.
- **Do** keep the 28px default control and the 24/28/32/40 height scale; use
  40–44px targets for primary touch actions.
- **Do** set metrics and table figures in tabular numerals.
- **Do** hold long-form prose to the 30rem reading measure, and let tables,
  code and demos keep the full column.
- **Do** verify both themes and the 390 / 768 / 1440 widths before calling a
  screen done.

### Don't:

- **Don't** use a raw palette step, hex, `rgb()` or `hsl()` value in a
  component; add a semantic token first.
- **Don't** use `theme` to mean light/dark. `theme` is the colour axis;
  `colorScheme` owns the mode.
- **Don't** put a shadow on a resting card or use elevation as decoration.
- **Don't** add a second accent for visual interest, or use Petrol for a
  non-interactive label.
- **Don't** use glassmorphism, gradient meshes, glow, or hero illustration as
  product chrome.
- **Don't** shrink informative text below 12px or touch targets below 40px.
- **Don't** set navigation labels in tracked uppercase, or tighten small text
  with negative tracking.
- **Don't** invent a radius, a control height or a one-off spacing value when a
  role already exists.
