# Dialog

Presents a focused modal task.

## Usage and anatomy

Import `Dialog` from `@newui/molecules`. The executable example and its copyable
source on `/molecules/dialog` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger, Content, Header, Title, Description, Footer and Close. Root supports open/onOpenChange and defaultOpen. dismissible defaults to true and controls Escape and outside dismissal. The modal traps focus and restores it on close; always give it a title. Keep scrollable content inside the viewport.

`Content` takes `size` (`sm | md | lg | full`, default `lg`), `position`
(`center | top`, default `center`) and `bare` — drop the default card padding
so custom content fills the shell.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
