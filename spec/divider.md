# Divider

Separates related groups with an optional text label.

## Usage and anatomy

Import `Divider` from `@newui/ui`. The executable example and its copyable
source on `/atoms/divider` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Use horizontal or vertical orientation. A labelled separator exposes the text; do not rely on the line alone to communicate a section heading. It has no value or controlled state.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
