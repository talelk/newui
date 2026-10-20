# AppShell

Composes a desktop workspace without owning navigation state.

## Usage and anatomy

Import `AppShell` from `@newui/ui`. The executable example and its copyable
source on `/templates/app-shell` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

AppShell contains navigation and PageBody. PageHeader and PageHeaderTitle establish the content heading. Use a single main landmark; navigation belongs in an explicitly named nav. Adapt the sidebar at narrow widths rather than squeezing the content.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
