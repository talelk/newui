# @newui/organisms

Independent application regions and widgets composed from atoms and molecules:
the integrated application sidebar, filter bars, stat grids, boards, tables and
virtualized lists.

```tsx
import { AppSidebar, DataTable, FilterBar } from '@newui/organisms'
```

The core package depends downward on `@newui/atoms` and `@newui/molecules`.
Optional chart and editor organisms stay in their own packages so ECharts,
TipTap and CodeMirror are never installed or bundled unless a screen needs one.
