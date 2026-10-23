---
name: newui
description: A compact, data-dense SolidJS component library and the documentation site that proves it.
colors:
  canvas: "oklch(1 0 0)"
  canvas-recessed: "oklch(0.979 0.006 255)"
  canvas-dark: "oklch(0.205 0.006 255)"
  surface-dark: "oklch(0.26 0.006 255)"
  panel: "oklch(0.964 0.006 255)"
  ink: "oklch(0.168 0.006 255)"
  ink-secondary: "oklch(0.341 0.006 255)"
  ink-muted: "oklch(0.439 0.006 255)"
  ink-faint: "oklch(0.586 0.006 255)"
  ink-on-dark: "oklch(0.979 0.006 255)"
  border: "oklch(0.946 0.006 255)"
  border-dark: "oklch(0.341 0.006 255)"
  signal-blue: "oklch(0.561 0.168 252.355)"
  signal-blue-deep: "oklch(0.477 0.149 253.403)"
  signal-blue-wash: "oklch(0.96 0.021 241.348)"
  success: "oklch(0.53 0.122 156.15)"
  warning: "oklch(0.612 0.136 63.758)"
  danger: "oklch(0.497 0.185 27.335)"
  accent-violet: "oklch(0.545 0.18 287.523)"
typography:
  hero:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: "40px"
    letterSpacing: "-0.035em"
  heading:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "30px"
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.015em"
  metric:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  interface:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 420
    lineHeight: "20px"
    letterSpacing: "0em"
  caption:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 420
    lineHeight: "16px"
    letterSpacing: "0em"
rounded:
  control: "6px"
  card: "8px"
  overlay: "12px"
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
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.canvas}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-deep}"
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
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  card:
    backgroundColor: "{colors.canvas}"
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
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.overlay}"
    padding: "16px"
  nav-item:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.interface}"
    rounded: "{rounded.card}"
    padding: "0 8px"
    height: "32px"
---

# Design System: newui

## Overview

**Creative North Star: "The Instrument Panel"**

newui is a working surface, not a showcase. It is built for people who spend
the day inside business software — ledgers, queues, dashboards, settings — and
it assumes the screen is a tool they operate rather than a page they admire.
Density is the default: controls are 28px, interface text is 14px, captions are
12px, every gap lands on a 4px rhythm, and a table row earns its height from
its content rather than from air. Structure is drawn with 1px borders and type.
Colour is a signal, not an atmosphere.

The mood is compact and workmanlike. Nothing is decorative for its own sake:
there are no gradient meshes, no glass panels, no illustration holding up a
product claim. Cool Paper neutrals keep the canvas distinct from white cards
without turning the page beige. Signal Blue marks action and selection and
almost nothing else; a reader should be able to find the one thing they can do
on a screen by following the blue. Headings tighten as they grow, numbers are
tabular, and motion is a state change rather than an entrance.

The same system runs the library and the documentation site that demonstrates
it. A reference page is not a special case of the brand: it is the product's
card, row, badge and field vocabulary applied to prose and code. That is why
the site's chrome imports no component — the shell is plain markup over the
same semantic tokens a consumer uses.

**Key Characteristics:**

- **Density as the default.** 28px controls, 32px navigation rows, 14/20
  interface text; compact is the normal setting, not a "small" variant.
- **One working accent.** Signal Blue is reserved for action, selection and
  focus; status has its own three colours and data can borrow violet.
- **Border-first depth.** Cards are flat with a 1px outline; only genuinely
  floating surfaces carry a shadow.
- **Inter at 420.** Body text sits a hair above regular; hierarchy comes from
  size, weight and tracking, never from a second typeface.
- **States are visible without colour alone.** Error carries a message,
  selection carries `aria-current` or `data-state`, focus carries an outline.
- **Documentation chrome equals product chrome.** The site is built from the
  same tokens, radii and spacing roles it documents.

## Colors

A cool neutral field with one working blue and three status accents.

### Primary

- **Signal Blue** (oklch(0.561 0.168 252.355)): the action and selection
  colour. Solid primary buttons, current links, selected rows, checked
  controls, and the blue focus ring. It never appears as decoration, and a
  screen should rarely carry more than one blue-filled control.
- **Signal Blue Deep** (oklch(0.477 0.149 253.403)): the hover and pressed step
  under a solid blue surface, and the text colour for inline links. One ramp
  step, never a new hue.
- **Signal Blue Wash** (oklch(0.96 0.021 241.348)): soft selected and
  informational fills — subtle blue buttons, selected chips, inline notices.

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

- **Canvas White** (oklch(1 0 0)): page canvas, card surface, dialog surface,
  input background. The lightest plane in the system.
- **Cool Paper** (oklch(0.979 0.006 255)): the recessed plane — sidebar, page
  gutter, quiet section background. A gray with a faint blue cast, so it reads
  cool next to white rather than dirty.
- **Panel Gray** (oklch(0.964 0.006 255)): the subtle fill — default button,
  hovered row, code chip, badge. One step darker than Cool Paper.
- **Ink** (oklch(0.168 0.006 255)): primary text and headings, near-black
  without being pure black.
- **Ink Secondary** (oklch(0.341 0.006 255)): body copy, navigation labels,
  table cells — the working text colour.
- **Ink Muted** (oklch(0.439 0.006 255)): captions, placeholders, metadata,
  timestamps and card descriptions.
- **Ink Faint** (oklch(0.586 0.006 255)): disabled labels, quiet icons and the
  least important metadata. Never the only colour carrying meaning.
- **Border** (oklch(0.946 0.006 255)): the 1px outline on cards, dividers, table
  rules and fields. Structure is a line, not a shadow.

Dark mode keeps the same semantic names and inverts the planes rather than
tinting the light values: canvas becomes `oklch(0.205 0.006 255)`, an elevated
surface `oklch(0.26 0.006 255)`, primary ink `oklch(0.979 0.006 255)`, and the
border `oklch(0.341 0.006 255)`. A solid blue surface also inverts its text:
`ink-base` is white in light mode and near-black in dark mode, so contrast holds
without a second set of button classes.

### Named Rules

**The One Signal Rule.** Signal Blue is for action and selection. If a blue
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

**Display Font:** Inter Variable (with Inter, ui-sans-serif, system-ui,
sans-serif)
**Body Font:** Inter Variable (same stack)
**Label/Mono Font:** the same family for labels; code uses the platform mono
stack, not a second brand face.

**Character:** one family, four working weights, and a default weight of 420.
The system is quiet enough that a 24px semibold heading and a 36px hero can do
all the announcing; there is no display face waiting behind the interface.
Negative tracking is saved for large text, and numbers in metrics are tabular
so columns of figures line up.

### Hierarchy

- **Hero** (600, 36/40, -0.035em): the home page statement and an application's
  marketing panel. One per page; it never appears inside a card.
- **Heading** (600, 24/30, -0.025em): page titles, dialog titles, the largest
  in-product heading.
- **Section** (600, 18/24, -0.015em): card titles and section headings; the
  workhorse heading of a dense screen.
- **Metric** (600, 28/32, -0.025em, tabular numerals): a single KPI value.
  Always paired with a caption naming the measure.
- **Interface** (420, 14/20, 0): body copy, controls, navigation, table cells —
  the default for almost everything a person reads or clicks.
- **Caption** (420, 12/16, 0): metadata, helper text, badges, timestamps. This
  is the floor; nothing informative ships below 12px.

### Named Rules

**The 420 Rule.** Body text is 420, not 400. Medium is 500 and semibold is 600.
Do not fake weight with `text-shadow` or synthetic bolding; the variable font
already carries the steps.

**The Tight Heading Rule.** Negative tracking belongs to 18px and above. Body
and caption text stay at 0; shrinking a small label with negative tracking is
how dense interfaces become unreadable.

**The Tabular Metric Rule.** Any number that can sit in a column — money,
counts, percentages, durations — uses tabular numerals. Proportional figures are
for prose, not for a table or a KPI.

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
table's row height comes from its 14/20 text plus 12px of vertical padding
(44px). The first thing to check on a narrow screen is not whether it fits, but
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

Border-first. A resting card is flat: 1px Border outline, Canvas White surface,
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

Controls are nearly square: 6px radius on a 28px control, 8px on a card, 12px on
an overlay, and a full pill only for badges. The restricted scale is the point —
a reader should be able to tell a control from a card from a dialog by silhouette
alone. Borders are 1px and always semantic; there are no 2px decorative frames.

Clipping follows the same roles: cards and overlays clip their contents to their
radius, menus and popovers clip to the overlay radius, and nothing else clips.
Rows are separated by 1px rules rather than nested boxes or zebra fills. Icon
buttons are square at every size (24, 28, 32, 40px) so a row of them aligns with
the text baseline. Avatars and status dots are the only perfect circles.

### Named Rules

**The Three-Radius Rule.** 6, 8, 12 — control, card, overlay. A fourth radius is
specialized geometry (a chart mark, an avatar), not a surface decision. When in
doubt, use the role name rather than a number.

## Components

The feel is crisp and utilitarian: small, square-ish, quiet at rest, and
explicit when state changes. Buttons shift a background or border step; they do
not scale, glow or bounce. Inputs own their focus; popup controls own their open
state. Every interactive component is reachable and legible with the keyboard
alone.

### Buttons

- **Shape:** 6px radius, 28px default height, 8px horizontal padding, 2px
  vertical padding, 14px interface text at 500.
- **Primary:** Signal Blue solid with Canvas White text; hover and press move one
  ramp step to Signal Blue Deep. Used once per region for the action the screen
  exists for.
- **Secondary:** Panel Gray fill with Ink Secondary text; hover steps to Border.
  This is the default button (`variant="subtle"`, `theme="gray"`), not the blue
  one — most actions should not compete with the primary.
- **Outline / Ghost:** Canvas White with a Border outline, or transparent with a
  hover wash. Both keep the same geometry and text colour.
- **Hover / Focus:** a background or border step over `transition-colors`;
  focus-visible draws the outline and nothing else. Disabled keeps its label,
  drops to Ink Muted and stops the pointer; loading swaps the leading glyph for
  a 2px spinner and sets `aria-busy`.
- **Icon buttons:** square at the same four heights, no horizontal padding.

### Fields

- **Style:** 28px default height, 6px radius, 1px Border (or Panel Gray for the
  subtle variant), Canvas White background, 14px text. The outline variant is
  the default for text entry.
- **Focus:** border steps to the darker gray and a `shadow-sm` lift appears; the
  focus outline follows the control's theme. The caret and selection use Signal
  Blue.
- **Label / Error:** labels sit above the control with a 12px gap; helper text
  is 12px Ink Muted. An invalid field gets a red border and a red message, and
  `aria-invalid` — colour never carries the error alone. Disabled fields keep
  their label and expose disabled semantics.
- **Adornments:** prefix and suffix glyphs sit in an 8px inset and do not change
  the control height. The field never grows to fit a long value; it scrolls.

### Cards / Containers

- **Corner Style:** 8px radius.
- **Background:** Canvas White (or the elevated surface in dark mode).
- **Shadow Strategy:** none at rest. Elevation is opt-in per card and follows
  the shadow vocabulary above.
- **Border:** 1px Border, always. A card without a border must earn it with a
  tonal surface, and most do not.
- **Internal Padding:** 12px compact, 16px standard, 20px wide; data cards
  (StatGrid stats, chart cards) use the same three roles and do not invent
  their own.

### Badges

- **Style:** full pill, 20px default height, 12px text, 6px horizontal padding;
  Panel Gray fill with Ink Muted text at rest.
- **State:** subtle is the default, solid is for emphasis on a single status,
  outline is for a filter that can be removed. Themes map to the status and
  category colours; the label always names the state.
- **Behaviour:** a badge is read-only. If it can be clicked it becomes a button
  or a chip with a 24px minimum target.

### Overlays

- **Style:** 12px radius, Canvas White, 1px Border, `shadow-xl`, 16px padding;
  the backdrop is a black overlay at 27% in light mode and 72% in dark, and the
  panel itself is opaque.
- **Behaviour:** focus is trapped, Escape closes, the trigger regains focus on
  dismissal, and the panel is portalled above the page. Mobile bottom sheets use
  the same surface and radius, anchored to the bottom edge.
- **Density:** dialog titles are Heading (24/30); body copy is 14/20; the footer
  is a right-aligned button row with an 8px control gap.

### Navigation

- **Masthead:** 48px sticky header, 1px bottom border, Canvas White; the product
  mark is 24px and sits beside a 14px semibold wordmark. Primary links are 14px
  Ink Secondary; current is Ink and a Panel Gray wash.
- **Sidebar:** 224px wide, Cool Paper or Canvas White depending on the surface,
  32px rows, 8px radius, 14px text, 8px horizontal padding. Current rows use a
  Panel Gray wash and Ink; hover uses the same wash one step lighter. Section
  headings are sentence case — never tracked uppercase.
- **Mobile:** below 1024px the sidebar becomes a 288px modal drawer with 40px
  touch targets; the same navigation model, breadcrumbs and reading order.
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
- **Do** keep Signal Blue for the action, the selection and the current
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
- **Don't** add a second accent for visual interest, or use blue for a
  non-interactive label.
- **Don't** use glassmorphism, gradient meshes, glow, or hero illustration as
  product chrome.
- **Don't** shrink informative text below 12px or touch targets below 40px.
- **Don't** set navigation labels in tracked uppercase, or tighten small text
  with negative tracking.
- **Don't** invent a radius, a control height or a one-off spacing value when a
  role already exists.
