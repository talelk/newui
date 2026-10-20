# Avatar

Identifies a person using an image, initials from label, or an icon.

## Usage and anatomy

Import `Avatar` from `@newui/ui`. The executable example and its copyable
source on `/atoms/avatar` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Set label to the person name; image failures fall back to initials. Sizes range from xs through 3xl. Supply an accessible label when the surrounding text does not identify the person.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
