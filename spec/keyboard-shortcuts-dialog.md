# KeyboardShortcutsDialog

Shows discoverable keyboard commands in a modal reference.

## Usage and anatomy

Import `KeyboardShortcutsDialog` from `@newui/molecules`. The executable example and its copyable
source on `/molecules/keyboard-shortcuts-dialog` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Pass shortcut groups and open/onOpenChange, or defaultOpen for local state. The dialog traps focus, closes on Escape and returns focus to the opener. Present the command description alongside its key sequence; showing a shortcut does not register it.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
