# Menu

Presents a keyboard-navigable list of actions.

## Usage and anatomy

Import `Menu` from `@newui/ui`. The executable example and its copyable
source on `/molecules/menu` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Trigger, Content and Item; Root owns open/defaultOpen/onOpenChange and reports onSelect(value). Each item needs a unique value and can be disabled. Arrow keys navigate, Enter or Space activates, Escape closes and restores focus. The shorthand Menu accepts items. Avoid interactive elements nested in items.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
