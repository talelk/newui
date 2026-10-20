# List

Composes aligned rows and cells for structured content.

## Usage and anatomy

Import `List` from `@newui/ui`. The executable example and its copyable
source on `/molecules/list` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Use List, ListHeader, ListHeaderCell, ListRow and ListCell. Column tracks are defined on the list; rows share them. Selection and actions are owned by the caller. Interactive rows need a button or link with keyboard focus.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
