# Tooltip

Labels supplementary information on hover and keyboard focus.

## Usage and anatomy

Import `Tooltip` from `@talelk/newui-atoms`. The executable example and its copyable
source on `/atoms/tooltip` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger and Content. Root accepts open/defaultOpen/onOpenChange, placement, openDelay (500ms) and closeDelay (150ms). Escape dismisses. Never put interactive controls inside a tooltip. Supply a visible or accessible trigger name independently of the tooltip.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
