# Alert

Presents contextual feedback with an optional action and dismissal.

## Usage and anatomy

Import `Alert` from `@newui/ui`. The executable example and its copyable
source on `/components/alert` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Provide title and description; theme chooses the semantic colour and icon the prefix. dismissible enables the close button. Dismissal calls onDismiss; the caller owns hiding. Action callbacks belong to the caller. Avoid placing urgent information only in a transient alert.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
