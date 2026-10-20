# Icon

Renders a named Lucide glyph or a supplied Solid component.

## Usage and anatomy

Import `Icon` from `@newui/ui`. The executable example and its copyable
source on `/atoms/icon` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

icon accepts a string or component; name is the string alternative. Decorative icons should be hidden from assistive technology. Put the accessible name on an icon-only action rather than on the glyph.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
