# ScrollArea

Provides a bounded scroll viewport with custom scrollbars.

## Usage and anatomy

Import `ScrollArea` from `@talelk/newui-atoms`. The executable example and its copyable
source on `/atoms/scroll-area` show the supported composition. Generated prop
tables on that page list every declared property, callback and optional flag.

## Behavior and accessibility

Compose Root, Viewport, Scrollbar and Thumb. Set dimensions on the root and use horizontal or vertical scrollbars as needed. Preserve wheel, touch and keyboard scrolling. Give the viewport tabindex and an accessible name when it is an independent scroll region. There is no value or controlled state.

The bar is an **overlay**, not a gutter: it takes no space, so content stays flush
to the edge. It hides itself when its axis has nothing to scroll (the machine
reports that as `data-overflow-x` / `data-overflow-y`), and the thumb fades in
with the pointer or a scroll — the track is `pointer-events-none` throughout and
only a visible thumb accepts a drag, so the strip never swallows a click aimed at
the content underneath it.

## Styling and responsive behavior

Use semantic tokens and data-slot/data-state hooks. Text must remain legible in
both colour schemes and at 200% enlargement. Keep overflow inside an explicitly
scrollable region. Disabled controls must not activate. Do not communicate a
status using colour alone.
