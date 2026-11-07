# Dialog

Presents a focused modal task.

## Usage and anatomy

Import `Dialog` from `@talelk/newui-molecules`. The executable example and its copyable
source on `/molecules/dialog` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger, Content, Header, Title, Description, Footer and Close. Root supports open/onOpenChange and defaultOpen. dismissible defaults to true and controls Escape and outside dismissal. The modal traps focus and restores it on close; always give it a title. Keep scrollable content inside the viewport.

`Content` takes `size` (`sm | md | lg | full`, default `lg`), `position`
(`center | top | end`, default `center`) and `bare` — drop the default card
padding so custom content fills the shell.

`position="end"` is a **side sheet**: full height on the inline-end edge (the
left edge in RTL), no corner radius, a short slide from that edge
(`animate-sheet-in`, mirrored for RTL; reduced motion skips it). The content
scrolls as one region and `Dialog.Footer` pins to the bottom edge on the sheet's
surface, ruled from the body. Use it to read or edit a record without leaving
the list behind it; `size` caps its width (`xl` suits a two-column property
grid). Focus trap, Escape and outside dismissal are the dialog's own.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
