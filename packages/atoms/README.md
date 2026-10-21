# @newui/atoms

The smallest visual units in the atomic package graph: controls and marks that
do not compose another kit component. Import compound interactions from
`@newui/molecules`, page regions from `@newui/organisms`, and frames from
`@newui/templates`.

```tsx
import { Button, Icon, TextInput } from '@newui/atoms'
```

Install `@newui/atoms`, `@newui/tailwind` and `solid-js`. Import
`@newui/tailwind/style.css` once and mount `UIProvider` plus one `Toaster` from
the package entrypoints documented in `/docs`.

The package also owns shared low-level runtime helpers under its internal
subpath. Application authors should import components from the root entry, not
from `@newui/atoms/internal`.
