import { Toaster, UIProvider } from '@newui/ui'
import {
  Route,
  Router,
  type RouteSectionProps,
  useLocation,
} from '@solidjs/router'
import {
  type Component,
  createEffect,
  createSignal,
  type JSX,
  lazy,
  onCleanup,
  onMount,
} from 'solid-js'
import { BareLayout, SiteLayout } from './shell/SiteLayout'

/**
 * The route table.
 *
 * Every page is a dynamic import, so Rollup gives it a chunk of its own and the
 * browser fetches a page's code when — and only when — you visit it. Two
 * consequences worth stating, because together they are the site's performance
 * contract:
 *
 *  1. The shell — this file, `shell/*`, the stylesheet — must never import a
 *     page or a component. Whatever is imported here ships on *every* route.
 *  2. A page imports only what it renders. `/` is the one to watch: the old
 *     playground mounted all six sections on a single route and paid 219 kB
 *     gzip for the privilege.
 *
 * The harness routes (`/spec` and the full-screen mobile recipe)
 * render outside the site chrome on purpose: a docs embed must not carry a
 * masthead, and a screenshot must not move because one loaded.
 */

/** Solid's `lazy` needs a default export; our pages use named ones. */
function page<T extends Record<string, Component>>(
  loader: () => Promise<T>,
  name: keyof T & string,
) {
  return lazy(() =>
    loader().then((module) => ({ default: module[name] as Component })),
  )
}

const ComponentsLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.ComponentsLayout,
  })),
)
const BlocksLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.BlocksLayout,
  })),
)
const LayoutsLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.LayoutsLayout,
  })),
)

const RegistryExamplePage = page(
  () => import('./pages/RegistryExamplePage'),
  'RegistryExamplePage',
)
const Patterns = page(() => import('./pages/Patterns'), 'Patterns')
const Deals = page(() => import('./pages/Deals'), 'Deals')
const Tickets = page(() => import('./pages/Tickets'), 'Tickets')
const Files = page(() => import('./pages/Files'), 'Files')
const Accounting = page(() => import('./pages/Accounting'), 'Accounting')
const Mail = page(() => import('./pages/Mail'), 'Mail')
const Compose = page(() => import('./pages/Compose'), 'Compose')
const Settings = page(() => import('./pages/Settings'), 'Settings')
const Cards = page(() => import('./pages/Cards'), 'Cards')
const Authentication = page(
  () => import('./pages/Authentication'),
  'Authentication',
)
const Tasks = page(() => import('./pages/Tasks'), 'Tasks')
const Analytics = page(() => import('./pages/Analytics'), 'Analytics')
const Home = page(() => import('./pages/Home'), 'Home')
const Docs = page(() => import('./pages/Docs'), 'Docs')
const Foundations = page(() => import('./pages/Foundations'), 'Foundations')
const Architecture = page(() => import('./pages/Architecture'), 'Architecture')
const Kit = page(() => import('./pages/Kit'), 'Kit')
const BlocksIndex = page(() => import('./pages/BlocksIndex'), 'BlocksIndex')
const LayoutsIndex = page(() => import('./pages/LayoutsIndex'), 'LayoutsIndex')
const ComponentsIndex = page(
  () => import('./pages/ComponentsIndex'),
  'ComponentsIndex',
)
const ComponentPage = page(
  () => import('./pages/ComponentPage'),
  'ComponentPage',
)
const ApplicationPage = page(
  () => import('./pages/ApplicationPage'),
  'ApplicationPage',
)
const CompositionPage = page(
  () => import('./pages/CompositionPage'),
  'CompositionPage',
)
const Examples = page(() => import('./pages/Examples'), 'Examples')
const NotFound = page(() => import('./pages/NotFound'), 'NotFound')
const Discussions = page(() => import('./pages/Discussions'), 'Discussions')
const Spec = page(() => import('./pages/Spec'), 'Spec')

/**
 * Wraps every route: the UI context each overlay and input reads, and the one
 * toast host (so a page may call `toast.success()` without mounting its own).
 */
function Root(props: RouteSectionProps): JSX.Element {
  const [direction, setDirection] = createSignal<'ltr' | 'rtl'>('ltr')
  onMount(() => {
    const sync = () =>
      setDirection(document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    })
    onCleanup(() => observer.disconnect())
  })
  return (
    <UIProvider dir={direction()}>
      <RouteTitle />
      {props.children}
      <Toaster />
    </UIProvider>
  )
}

/**
 * Every route the site answers, in nav order, with the title the route sets on
 * `document.title`. `routes.test.ts` asserts this table and `shell/nav.ts`
 * describe the same paths in both directions, so a sidebar link always has a
 * route behind it and no page is reachable only by typing its URL.
 */
export const ROUTES: { path: string; title: string }[] = [
  { path: '/', title: 'Introduction' },
  { path: '/docs', title: 'Installation' },
  { path: '/foundations', title: 'Design tokens' },
  { path: '/architecture', title: 'Architecture' },
  { path: '/kit', title: 'Build an app' },
  { path: '/components', title: 'Components' },
  { path: '/components/:name', title: 'Component' },
  { path: '/charts', title: 'Charts' },
  { path: '/charts/:name', title: 'Chart' },
  { path: '/editors', title: 'Editors' },
  { path: '/editors/:name', title: 'Editor' },
  { path: '/blocks', title: 'All blocks' },
  { path: '/blocks/compositions/:name', title: 'Site composition' },
  { path: '/blocks/:name', title: 'Block' },
  { path: '/layouts', title: 'All layouts' },
  { path: '/layouts/:name', title: 'Layout' },
  { path: '/examples', title: 'Examples' },
  { path: '/examples/registry/:name', title: 'Registry example' },
  { path: '/examples/patterns', title: 'Component recipes' },
  { path: '/examples/patterns/:name', title: 'Reference pattern' },
  { path: '/examples/analytics/fullscreen', title: 'Analytics' },
  { path: '/examples/analytics', title: 'Analytics dashboard' },
  { path: '/examples/authentication/fullscreen', title: 'Authentication' },
  { path: '/examples/authentication', title: 'Authentication' },
  { path: '/examples/cards/fullscreen', title: 'Cards' },
  { path: '/examples/cards', title: 'Cards' },
  { path: '/examples/settings/fullscreen', title: 'Settings' },
  { path: '/examples/settings', title: 'Settings' },
  { path: '/examples/deals', title: 'Deals' },
  { path: '/examples/deals/fullscreen', title: 'Deals' },

  { path: '/examples/tickets', title: 'Tickets' },
  { path: '/examples/tickets/fullscreen', title: 'Tickets' },

  { path: '/examples/files', title: 'Files' },
  { path: '/examples/files/fullscreen', title: 'Files' },

  { path: '/examples/accounting', title: 'Accounting' },
  { path: '/examples/accounting/fullscreen', title: 'Accounting' },

  { path: '/examples/mail', title: 'Mail' },
  { path: '/examples/mail/fullscreen', title: 'Mail' },

  { path: '/examples/compose', title: 'Compose' },
  { path: '/examples/compose/fullscreen', title: 'Compose' },

  { path: '/examples/tasks', title: 'Tasks' },
  { path: '/examples/tasks/fullscreen', title: 'Tasks' },

  { path: '/examples/discussions', title: 'Discussions' },
  { path: '/examples/discussions/fullscreen', title: 'Discussions' },

  { path: '/spec', title: 'Component spec' },
]

const TITLES = new Map(ROUTES.map((route) => [route.path, route.title]))

/**
 * Per-route `document.title`.
 *
 * Rendered once inside the router (not an effect per page) so a page cannot
 * forget it. An effect rather than a render-time assignment: writing to
 * `document.title` while rendering is a side effect in the render phase, and
 * Solid may render the same component more than once.
 */
function RouteTitle(): JSX.Element {
  const location = useLocation()
  createEffect(() => {
    const pathname = location.pathname
    const title = TITLES.get(pathname)
    if (title) document.title = `${title} · newui`
    else if (
      /^\/(components|blocks|layouts|charts|editors)\/[^/]+$/.test(pathname)
    ) {
      let current = true
      onCleanup(() => {
        current = false
      })
      void import('./generated/components').then(({ componentBySlug }) => {
        if (current)
          document.title = `${componentBySlug(pathname.split('/').at(-1) ?? '')?.name ?? 'Unknown component'} · newui`
      })
    }
  })
  return null
}

export function AppRoutes(): JSX.Element {
  return (
    <Router root={Root}>
      <Route path="/" component={SiteLayout}>
        <Route path="/" component={Home} />
        <Route path="/docs" component={Docs} />
        <Route path="/foundations" component={Foundations} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/kit" component={Kit} />
        {/* The two hand-written reference pages sit in the site group; the
            generated `:name` pages sit in their own group below. A static
            segment outranks a parameter, so these win for their own paths. */}

        <Route path="/examples" component={Examples} />
        <Route path="/examples/analytics" component={ApplicationPage} />
        <Route path="/examples/authentication" component={ApplicationPage} />
        <Route path="/examples/cards" component={ApplicationPage} />
        <Route path="/examples/settings" component={ApplicationPage} />
        <Route path="/examples/deals" component={ApplicationPage} />
        <Route path="/examples/tickets" component={ApplicationPage} />
        <Route path="/examples/files" component={ApplicationPage} />
        <Route path="/examples/accounting" component={ApplicationPage} />
        <Route path="/examples/mail" component={ApplicationPage} />
        <Route path="/examples/compose" component={ApplicationPage} />
        <Route path="/examples/tasks" component={ApplicationPage} />
        <Route path="/examples/discussions" component={ApplicationPage} />
        <Route
          path="/examples/registry/:name"
          component={RegistryExamplePage}
        />
        <Route path="/examples/patterns" component={Patterns} />
        <Route path="/examples/patterns/:name" component={Patterns} />
      </Route>

      {/*
        The components section brings its own sidebar (the full index), so it is
        its own layout group. Only these routes import the index — which is the
        point: the shell stays at 48 kB because a page pays for its own
        furniture.
      */}
      <Route path="/components" component={ComponentsLayout}>
        {/* Child paths are relative to the parent, so `/` is the index and
            `/:name` is one component — writing the parent's own path again
            would nest it (`/components/components/:name`). */}
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>

      {/* The layouts are the third reference section: the same generated page,
          one level up the ladder from the blocks. */}
      <Route path="/layouts" component={LayoutsLayout}>
        <Route path="/" component={LayoutsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>

      {/* The blocks are a reference section too: their own index, their own
          sidebar, and the same generated page. */}
      <Route path="/charts" component={ComponentsLayout}>
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>
      <Route path="/editors" component={ComponentsLayout}>
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>
      <Route path="/blocks" component={BlocksLayout}>
        <Route path="/compositions/:name" component={CompositionPage} />
        <Route path="/" component={BlocksIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>

      <Route component={BareLayout}>
        <Route path="/examples/settings/fullscreen" component={Settings} />
        <Route path="/examples/analytics/fullscreen" component={Analytics} />
        <Route
          path="/examples/authentication/fullscreen"
          component={Authentication}
        />
        <Route path="/examples/cards/fullscreen" component={Cards} />
        <Route path="/examples/deals/fullscreen" component={Deals} />

        <Route path="/examples/tickets/fullscreen" component={Tickets} />

        <Route path="/examples/files/fullscreen" component={Files} />

        <Route path="/examples/accounting/fullscreen" component={Accounting} />

        <Route path="/examples/mail/fullscreen" component={Mail} />

        <Route path="/examples/compose/fullscreen" component={Compose} />

        <Route path="/examples/tasks/fullscreen" component={Tasks} />

        <Route
          path="/examples/discussions/fullscreen"
          component={Discussions}
        />
        <Route path="/spec" component={Spec} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  )
}
