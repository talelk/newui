# MobileNav

Provides persistent mobile destinations.

## Usage and anatomy

Import `MobileNav` from `@talelk/newui-organisms`. The executable example and its copyable
source on `/organisms/mobile-nav` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose MobileNavItem entries with route or href, or onClick for local navigation. active communicates the current destination. Label every icon-only destination. Keep content clear of the fixed navigation and safe-area inset.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.

Custom icon content, including avatar initials, is decorative beside the visible
item label. The label remains the accessible name.
