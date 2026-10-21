# @talelk/newui-atoms

The smallest visual units in the atomic package graph: controls and marks that
do not compose another kit component. Import compound interactions from
`@talelk/newui-molecules`, page regions from `@talelk/newui-organisms`, and frames from
`@talelk/newui-templates`.

```tsx
import { Button, Icon, TextInput } from '@talelk/newui-atoms'
```

Install `@talelk/newui-atoms`, `@talelk/newui-tailwind` and `solid-js`. Import
`@talelk/newui-tailwind/style.css` once and mount `UIProvider` plus one `Toaster` from
the package entrypoints documented in `/docs`.

The package also owns shared low-level runtime helpers under its internal
subpath. Application authors should import components from the root entry, not
from `@talelk/newui-atoms/internal`.
