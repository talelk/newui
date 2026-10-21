import { Route, Router } from '@solidjs/router'
import { Button } from '@talelk/newui-atoms'
import { DataProvider } from '@talelk/newui-data/query'
import { Toaster } from '@talelk/newui-molecules'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { SolidQueryDevtoolsPanel } from '@tanstack/solid-query-devtools'
import type { JSX } from 'solid-js'
import { StarterDevtoolsPanel } from './devtools/StarterDevtoolsPanel'
import { Records } from './pages/Records'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'

/**
 * The app, and the four decisions that make it one.
 *
 * 1. **One data provider** at the root: every screen shares a cache, and the
 *    provider clears it when the app unmounts.
 * 2. **The router owns the screen**: `/`, `/settings` and `/sign-in`. The
 *    starter keeps them eager because there are three and they share the frame;
 *    a large app splits them (the playground's `routes.tsx` shows how).
 * 3. **The toast host** is mounted once, beside the router, so a mutation can
 *    report from anywhere.
 * 4. **Devtools mount once**, beside them, in development only: the library
 *    query panel and the starter's typed event panel.
 */
function NotFound(): JSX.Element {
  return (
    <main class="grid min-h-dvh place-items-center bg-surface-gray-1 p-6 text-center text-interface text-ink-gray-9">
      <div class="flex flex-col items-center gap-3">
        <p class="text-caption text-ink-gray-7">404</p>
        <h1 class="text-heading">Nothing here</h1>
        <p class="text-ink-gray-7">
          The starter has three screens: projects, settings and sign-in.
        </p>
        <Button route="/" variant="solid" theme="blue">
          Back to projects
        </Button>
      </div>
    </main>
  )
}

export function App(): JSX.Element {
  return (
    <DataProvider>
      <Router>
        <Route path="/" component={Records} />
        <Route path="/settings" component={Settings} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="*" component={NotFound} />
      </Router>
      <Toaster />
      {/*
       * One adapter mount for the whole app. The library panel inspects the
       * query cache; the product panel reads the typed event log in
       * `src/devtools/events.ts`. In a production build
       * `@tanstack/devtools-vite` removes this element and every devtools
       * import above, so neither panel (nor the event panel's module) ships.
       */}
      <TanStackDevtools
        eventBusConfig={{ connectToServerBus: true }}
        plugins={[
          {
            id: 'tanstack-query',
            name: 'TanStack Query',
            render: <SolidQueryDevtoolsPanel style={{ height: '100%' }} />,
          },
          {
            id: 'acme-runtime',
            name: 'Acme runtime',
            defaultOpen: true,
            render: <StarterDevtoolsPanel />,
          },
        ]}
      />
    </DataProvider>
  )
}
