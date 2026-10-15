# HoverCard

Shows supplementary information on hover or focus.

## Usage and anatomy

Import `HoverCard` from `@newui/ui`. The executable example and its copyable
source on `/components/hover-card` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger and Content. Root supports open/onOpenChange and defaultOpen. Keep essential actions available outside hover content for touch users. The content must not be the only source of an accessible name or required instructions.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
