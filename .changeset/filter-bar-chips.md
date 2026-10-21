---
'@newui/organisms': minor
---

`FilterBar` gains the active-filter row: optional `chips` (active filters
restated as removable pills), `resultCount` (stated under the bar and announced
politely), and `onClearAll` (a "Clear all" button shown only while a filter is
active; the caller resets its own state). The bar now sits on one quiet
surface, filled selects take the filled `subtle` surface, and the search box
honours the `/` hint it draws. `AppSidebar` counts become quiet tabular pills,
and `PageToolbar` sets its title at the `text-heading` scale.
