import { Route, Router } from '@solidjs/router'
import { Button } from '@talelk/newui-atoms'
import { DataProvider } from '@talelk/newui-data/query'
import { Toaster } from '@talelk/newui-molecules'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { SolidQueryDevtoolsPanel } from '@tanstack/solid-query-devtools'
import { lazy, type JSX, Suspense } from 'solid-js'
import { StarterDevtoolsPanel } from './devtools/StarterDevtoolsPanel'
import { dataClient } from './data/client'
import { Records } from './pages/Records'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'

/**
 * The analytics screen is the starter's first lazy route. The other three
 * share the frame and cost the same bytes, so they stay eager; this one
 * carries the widget grid, the server-mode table and — behind a `lazy()` of
 * its own — the chart engine, and a screen you reach from the sidebar
 * should not be paid for by every other page.
 */
const Analytics = lazy(() =>
  import('./pages/Analytics').then((module) => ({
    default: module.Analytics,
  })),
)

/** The frame the analytics chunk slides into while it loads. */
function RouteSkeleton(): JSX.Element {
  return (
    <main class="flex flex-col gap-4 p-6" aria-busy="true">
      <span class="sr-only">Loading screen</span>
      <div class="h-8 w-64 animate-pulse rounded-control bg-surface-gray-2" />
      <div class="grid gap-4 min-[360px]:grid-cols-2 lg:grid-cols-4">
        <div class="h-20 animate-pulse rounded-card bg-surface-gray-2" />
        <div class="h-20 animate-pulse rounded-card bg-surface-gray-2" />
        <div class="h-20 animate-pulse rounded-card bg-surface-gray-2" />
        <div class="h-20 animate-pulse rounded-card bg-surface-gray-2" />
      </div>
      <div class="h-64 animate-pulse rounded-card bg-surface-gray-2" />
    </main>
  )
}

/**
 * The app, and the four decisions that make it one.
 *
 * 1. **One data provider** at the root: every screen shares a cache, and the
 *    provider clears it when the app unmounts.
 * 2. **The router owns the screen**: `/`, `/analytics`, `/settings` and
 *    `/sign-in`. The light screens stay eager; the analytics screen splits,
 *    the way the playground's `routes.tsx` splits every route.
 * 3. **The toast host** is mounted once, beside the router, so a mutation can
 *    report from anywhere.
 * 4. **Devtools mount once**, beside them, in development only: the library
 *    query panel and the starter's typed event panel.
 */
function NotFound(): JSX.Element {
  return (
    <main class="grid min-h-dvh place-items-center bg-surface-canvas p-6 text-center text-interface text-ink-gray-9">
      <div class="flex flex-col items-center gap-3">
        <p class="text-caption text-ink-gray-7">404</p>
        <h1 class="text-heading">Nothing here</h1>
        <p class="text-ink-gray-7">
          The starter has four screens: projects, analytics, settings and
          sign-in.
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
    <DataProvider client={dataClient}>
      <Router>
        <Route path="/" component={Records} />
        <Route
          path="/analytics"
          component={() => (
            <Suspense fallback={<RouteSkeleton />}>
              <Analytics />
            </Suspense>
          )}
        />
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
