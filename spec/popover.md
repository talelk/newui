# Popover

Anchors interactive supplementary content to a trigger.

## Usage and anatomy

Import `Popover` from `@newui/molecules`. The executable example and its copyable
source on `/molecules/popover` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger, Content, Title, Description and Close. Root supports open/onOpenChange and defaultOpen. modal opts into modal behavior. Escape closes and restores trigger focus. Use a descriptive trigger; keep content within the viewport at 320px and 200% text.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
