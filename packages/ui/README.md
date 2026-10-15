# @newui/ui

Install `@newui/ui`, `@newui/tailwind` and `solid-js`. Import
`@newui/tailwind/style.css` once and mount UIProvider plus one Toaster. Components
and compound anatomy are documented under `/components`.

## State and composition helpers

- createDisclosure owns boolean state, supporting a value accessor, defaultOpen
  and onChange. createControllableSignal handles other caller-owned values.
- createColorScheme is the single writer for light/dark/system. It persists the
  choice, watches OS changes and sets data-theme plus the native color-scheme.
- UIProvider supplies writing direction and a portalTarget; Portal renders
  overlays into that target. useUI reads the provider.
- Field and Field helpers own input labels, description/error IDs and ARIA.
  Use the same label/description/error/required vocabulary in custom controls.
- tv defines typed variants; cn resolves utility conflicts and cx joins classes.
  VariantProps recovers the public variant unions.
- createZagApi and createZagContext connect machines and compound contexts.
  Preserve machine identity across updates; do not rebuild a machine per value.
- createId supplies stable component IDs.

## Data and utilities

Public resource, document, formatting and date helpers are exported from the
curated `src/lib/index.ts` barrel. Their signatures and source files are recorded
in the generated surface inventory. Resource helpers require an application
service; the documentation examples use deterministic local repositories.

Use component contracts for input state and keyboard behavior; native DOM props
are forwarded only by components that explicitly support them.

Controls default to `size="sm"` (28px). Choose `xs` (24px), `md` (32px) or
`lg` (40px) explicitly where supported. Tabs and pagination expose their
documented subsets. Cards default to 12px padding (`padding="sm"`); use
`padding="md"` for 16px. Dialog padding remains 16px.
