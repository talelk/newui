/* @refresh reload */

import { UIProvider } from '@newui/ui'
import type { Component } from 'solid-js'
import { render } from 'solid-js/web'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('playground: #root not found')
const mount: HTMLElement = root

function renderPage(Page: Component) {
  render(
    () => (
      <UIProvider dir="ltr">
        <Page />
      </UIProvider>
    ),
    mount,
  )
}

// `/spec` is the deterministic page the browser harness drives; `/mobile` is the
// full-screen mobile-shell recipe; `/play` is one component's live demo (the
// docs embed it); `/` is the showcase. Each is its own dynamic import, written
// as separate branches (not a nested ternary) so static analysis can trace which
// module exports are used.
const path = window.location.pathname

if (path.startsWith('/spec')) {
  import('./pages/Spec').then((module) => renderPage(module.Spec))
} else if (path.startsWith('/mobile')) {
  import('./pages/MobileApp').then((module) => renderPage(module.MobileApp))
} else if (path.startsWith('/play')) {
  import('./pages/Play').then((module) => renderPage(module.Play))
} else {
  import('./App').then((module) => renderPage(module.App))
}
