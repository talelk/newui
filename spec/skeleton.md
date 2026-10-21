# Skeleton

Reserves space while content loads.

## Usage and anatomy

Import `Skeleton` from `@talelk/newui-atoms`. The executable example and its copyable
source on `/atoms/skeleton` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

lines controls the number of text placeholders. Use the real content region as the loading announcement; skeleton bars are decorative. Replace placeholders when the request completes and preserve a stable layout.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
