# Progress

Reports a determinate value or ongoing activity.

## Usage and anatomy

Import `Progress` from `@newui/atoms`. The executable example and its copyable
source on `/atoms/progress` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

value is measured out of max (100 by default); indeterminate reports unknown progress without a misleading percentage. Give the progressbar an accessible name. Progress does not own or update the operation it describes.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
