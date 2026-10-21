# Spinner

Shows ongoing activity in a compact space.

## Usage and anatomy

Import `Spinner` from `@talelk/newui-atoms`. The executable example and its copyable
source on `/atoms/spinner` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

size accepts xs, sm, md or lg; track toggles the background ring. Provide nearby status text or an accessible label for meaningful loading. LoadingText pairs a spinner with children. Reduced motion must not hide the loading state.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
