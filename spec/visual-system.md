# Visual system

The shared standard for every package and the documentation site. Design references:
solid-ui/shadcn for restrained surfaces, composition and clear hierarchy,
and Frappe for practical business controls. No new runtime framework is introduced.

## Typography and density

Inter remains the font. Interface text is 14px/20px; supporting text 12px/16px.
Role utilities are `text-interface`, `text-caption`, `text-heading` (24/30),
`text-section` (18/24), `text-metric` (28/32), and `text-hero` (36/40).
Existing numbered utilities remain available. Metrics use tabular numerals.
Controls use xs=24, sm=28, md=32, lg=40px, default sm. Text entry defaults to
outline; Button remains neutral/subtle. Primary actions explicitly use solid/blue.
Controls have 6px radii, cards 8px, overlays 12px. Layout follows a 4px rhythm,
12px compact card padding and 16px standard card padding (data cards — StatGrid
stats and chart cards — keep the same card role; see `spec/stat-grid.md` and
`spec/charts.md`), 24px section gaps and 8px control-group gaps. Dialogs retain
16px padding. Mobile navigation and primary icon actions retain 40–44px touch
targets. Borders define cards; floating surfaces use restrained shadows. Short
transitions respect reduced motion.

## Colour and states

The existing surface, ink and outline vocabulary is retained. Cool neutral ramps
keep the canvas distinct from cards and elevated overlays in both light and dark.
Blue identifies actions and selection. Focus uses an outline, surviving forced
colours and independent of shadows. Invalid fields expose aria-invalid and a red
border plus the shared Field error message; colour never carries the error alone.
Disabled controls retain their label and expose disabled semantics. Hover and
selection use existing semantic ramps. Floating surfaces are opaque.
Invalid field boundaries use outline-red-6 (at least 3:1 on the entry surface).
Dark card borders remain distinguishable from their surface.
Chart series use the 600 ramp in light and 200 ramp in dark; grid/axis/tooltip
colours follow semantic tokens. Theme changes redraw mounted charts.

## Analytics example

`/pages/analytics` is a lazy full-viewport local demo. Region/date filters and
search select one dataset shared by every metric, all charts, transaction rows
and export. Revenue includes paid transactions only; average order value divides
by paid transactions; payment success divides paid by all selected transactions.
Sorting affects rows and CSV; pagination affects rows only. Filter/search changes
reset pagination. CSV exports all matching rows, including rows on other pages.
Loading and error previews suppress stale table values and export; retry restores
ready state. Empty state supports resetting filters. The table scrolls locally
at small widths, while the page stays within the viewport.

Typography is emitted in rem units relative to a 16px root. The documented
pixel sizes are the default computed sizes, not a restriction on user scaling.
Text-zoom checks assert that rendered font sizes actually double. Chart defaults
use 12px labels and scale with the root font; accessible data tables remain
available. Metric values and headings may wrap at enlarged text sizes.

### Layout rhythm and surfaces

Spacing uses the shared 4px scale through named roles rather than one-off
values: `control-gap` (8px), `control-pad` (8px), `field-gap` (12px),
`card-gap` (16px), `card-pad-compact` (12px), `card-pad` (16px),
`card-pad-wide` (20px), `section-gap` (24px), `page-gutter-compact` (16px),
`page-gutter` (24px), `page-gutter-wide` (32px) and `page-stack` (32px).
Page shells use the compact gutter on narrow screens and the page gutter at
standard widths; cards use the compact or normal pad, not an arbitrary `p-4`.

Radius has four semantic roles over the primitive scale: `control` 6px,
`card` 8px, `overlay` 12px and `pill` fully rounded. The numbered radius scale
remains available for specialized geometry, but recipes use the role names so
surfaces stay aligned as the scale evolves.

## Documentation navigation

The shell has a 48px header and one 224px contextual sidebar at 1024px and above.
Its remembered collapsed preference produces a 48px section-icon rail. Both
presentations and the modal mobile drawer use the same navigation model, along
with breadcrumbs and reading order. The current reference section retains its
filter and group headings (sentence case, never tracked uppercase). At large
widths the masthead also carries flat Docs / Components / Blocks / Examples
links resolved from the same navigation model, and a page may supply an
optional right-hand "On this page" column. Developer harness destinations are secondary.
Header utilities are named, focus-visible actions; the keyboard page finder
loads reference metadata only when opened. Modal navigation contains focus,
closes on Escape or navigation and restores focus when dismissed. At enlarged
text sizes the header may wrap so its actions remain accessible.

## Preview and catalog presentation

Application and block previews use exact 390×844, 768×900 and 1440×900 documents,
without scaling. The host provides internal overflow, keyboard focus visibility,
Preview/Source controls, device icons, actual dimensions and fullscreen access.
Viewport changes and Source browsing retain the iframe and application state.
Component demonstrations stay inline and remain mounted behind Source as well.
Source files load on demand; copying failures and download errors are contained
in the source panel. File selection survives Preview/Source switching. Package
setup is expandable. A different reference destination loads its own source.
Documentation links in embedded applications navigate the host; application
anchors remain in the iframe. Fullscreen routes remain bare documents.

Catalog entries are compact navigable rows with 16px icons, names, purpose and
metadata. Reference pages retain executable usage, props, contracts and section
anchors. Their footer is a compact previous/next row. Application guides and all
twelve fullscreen families share this density while retaining domain workflows.
