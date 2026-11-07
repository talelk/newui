# The instrument-panel layer over the Figma export

**Status**: accepted

## Context

The kit's palette, radii and type scale are generated from a Figma export
(`packages/tokens/src/tokens/{colors,radius,typography,effects}.js`, marked "do
not edit by hand"). The export describes a general-purpose look: a near-neutral
gray, a standard blue accent, Inter at 14px, and airy tables (44px rows).

The kit's audience is narrower: people who work inside records all day —
operations, finance, support — on dense tables, filters and forms. Their job is
to scan and compare many rows at once and to act on them. The export's look
showed about 10 table rows on a 900px screen, spent about 110px on a page
header, and boxed every KPI in its own card.

Retuning the export in Figma first would block the work on a design tool round
trip; editing the generated files would break the next sync.

## Decision

Add one hand-authored module, `packages/tokens/src/tokens/instrument.js`, that
`packages/tokens/src/index.js` applies on top of the export before anything
resolves:

- **Colour.** Replace the `gray` and `blue` ramp steps (both themes). Gray
  becomes a cool family — Mist `#EDF0F3` frame, white Sheet for data, Graphite
  `#18202B` ink, Pewter `#566170` secondary ink, Rule `#D3D9E0` hairlines.
  `blue` becomes Petrol `#0E5C74`, the kit's single accent (primary actions,
  focus, the active row). Add one semantic name, `surface-canvas`, for the frame
  behind sheets; the sidebar shares it.
- **Type.** IBM Plex Sans (variable, self-hosted in `@talelk/newui-tailwind`),
  13px interface text, no positive tracking. Its default figures are tabular, so
  numbers align in columns; its width axis gives table headers a semi-condensed
  face (`font-stretch-semi-condensed`).
- **Shape and focus.** Radius by role (4px controls, 6px sheets, 8px overlays);
  a solid Petrol focus ring instead of the export's light gray one.
- **Density.** Table cell spacing tightens (`table-cell-x/y`), and `DataTable`
  defaults to `compact` (about 28px rows).

The export files stay untouched. Every value in the layer replaces a name that
already exists, except `surface-canvas`, so the token surface stays
additive-only (ADR-0010).

## Rationale

A layer keeps both sources honest: the export remains a faithful copy of the
design file, and the retune is one reviewable module with the reasons beside
the values. Retuning ramps rather than recipes means every component follows
without a sweep of class strings, and the contrast contract
(`contrast.test.ts`) checks the result, not a promise.

The muted tier is deliberate: `ink-gray-5` stays below AA so text keeps using
`ink-gray-6`; the layer retunes those two ramp steps to preserve the gap.

## Consequences

- A Figma sync that changes `gray` or `blue` has no visible effect until the
  layer is updated too. Review the layer whenever the export is synced.
- Consumers see a visual change: new colours, Plex, 13px text, tighter tables.
  `density="comfortable"` restores roomier rows per table.
- Plex has no CJK glyphs (Inter's subset did); CJK text falls back to the
  system face.
- Reversing this means deleting the layer and the font files, and restoring the
  Inter import — the export is still there.
