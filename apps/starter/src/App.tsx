import { DataProvider } from '@newui/data/query'
import { Button, Toaster } from '@newui/ui'
import { Route, Router } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { Records } from './pages/Records'
import { Settings } from './pages/Settings'
import { SignIn } from './pages/SignIn'

/**
 * The app, and the three decisions that make it one.
 *
 * 1. **One data provider** at the root: every screen shares a cache, and the
 *    provider clears it when the app unmounts.
 * 2. **The router owns the screen**: `/`, `/settings` and `/sign-in`. The
 *    starter keeps them eager because there are three and they share the frame;
 *    a large app splits them (the playground's `routes.tsx` shows how).
 * 3. **The toast host** is mounted once, beside the router, so a mutation can
 *    report from anywhere.
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
    </DataProvider>
  )
}
