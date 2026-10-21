# @newui/vite

Vite plugins for newui apps. Three concerns, each usable on its own:

1. **Backend dev-server proxy** — proxy `/api` (and `/app`, `/assets`, …) to a
   local backend, with the port auto-detected from a bench.
2. **Lucide auto-import** *(optional)* — `~icons/lucide/*` imports and bare
   `<LucideName />` tags, resolved to Solid components.
3. **DocType types** — fetch DocType metadata and emit TypeScript interfaces for
   `useDoc`/`useDoctype`.

Requires Vite 8.3.4 or later in the Vite 8 release line.

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { newuiVite } from '@newui/vite'

export default defineConfig({
  plugins: [
    newuiVite({
      // On by default: proxy the backend during `vite dev`.
      frappeProxy: true,
      // Off by default.
      lucideIcons: true,
      // Off unless configured.
      doctypeTypes: {
        doctypes: ['Task', 'Task Item'],
        output: 'src/types/doctypes.ts',
      },
    }),
    solid(),
  ],
})
```

`newuiVite()` returns the enabled sub-plugins, so you can also import one
directly:

```ts
import { frappeProxy, lucideIcons, generateDocTypes } from '@newui/vite'
```

### Proxy

```ts
frappeProxy({
  target: 'http://127.0.0.1:8000', // or omit to auto-detect / route per site
  port: 8080, // Vite dev-server port (default: 8080 + (backendPort - 8000))
  source: '^/(desk|app|login|api|assets|files|private)',
})
```

The backend port comes from `FRAPPE_WEB_SERVER_PORT`, then
`sites/common_site_config.json`, then `8000`. When no `target` is given,
requests are routed to `<Host>:<backendPort>`, so a multi-site bench works.

### Lucide

Requires `lucide-static` to be installed (`pnpm add -D lucide-static`). Then:

```tsx
import ArrowRight from '~icons/lucide/arrow-right' // explicit
const el = <LucideArrowRight class="size-4" /> // auto-imported
```

The generated component is built on `solid-js/h`, so it needs no JSX transform
of its own. Pass `lucideIcons: false` (the default) if your app uses newui's
`lucide-*` class strings, which need no Vite support at all.

### DocTypes

From a script:

```ts
import { generateDocTypes } from '@newui/vite'

await generateDocTypes({
  doctypes: ['Task', 'Task Item'],
  url: 'http://127.0.0.1:8000',
  output: 'src/types/doctypes.ts',
})
```

or via the dev plugin (`doctypeTypes`), which regenerates on server start and
only rewrites the file when its content changed. Generated interfaces extend the
emitted `DocType` / `ChildDocType` bases:

```ts
import type { Task } from './types/doctypes'
const task = useDoc<Task>({ doctype: 'Task', name: 'T-1' })
```
