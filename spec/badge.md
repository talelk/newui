# Badge

Displays a short status or category.

## Usage and anatomy

Import `Badge` from `@newui/ui`. The executable example and its copyable
source on `/components/badge` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose text or label with the optional icon. variant defaults to subtle, theme to gray and size to md. Badges are non-interactive; actions belong in Button. State must be conveyed in words as well as colour.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
