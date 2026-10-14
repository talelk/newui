import { Toaster, UIProvider } from '@newui/ui'
import {
  Route,
  Router,
  type RouteSectionProps,
  useLocation,
} from '@solidjs/router'
import { type Component, createEffect, type JSX, lazy } from 'solid-js'
import { BareLayout, ComponentsLayout, SiteLayout } from './shell/SiteLayout'

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
 * The harness routes (`/spec`, `/play`, and the full-screen mobile recipe)
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

const Home = page(() => import('./pages/Home'), 'Home')
const Docs = page(() => import('./pages/Docs'), 'Docs')
const Foundations = page(() => import('./pages/Foundations'), 'Foundations')
const Atoms = page(() => import('./pages/Atoms'), 'Atoms')
const Feedback = page(() => import('./pages/Feedback'), 'Feedback')
const Blocks = page(() => import('./pages/Blocks'), 'Blocks')
const ComponentsIndex = page(
  () => import('./pages/ComponentsIndex'),
  'ComponentsIndex',
)
const ComponentPage = page(
  () => import('./pages/ComponentPage'),
  'ComponentPage',
)
const Examples = page(() => import('./pages/Examples'), 'Examples')
const NotFound = page(() => import('./pages/NotFound'), 'NotFound')
const DiscussionsDesktop = page(
  () => import('./pages/DiscussionsDesktop'),
  'DiscussionsDesktop',
)
const DiscussionsMobile = page(
  () => import('./pages/DiscussionsMobile'),
  'DiscussionsMobile',
)
const Spec = page(() => import('./pages/Spec'), 'Spec')
const Play = page(() => import('./pages/Play'), 'Play')

/**
 * Wraps every route: the UI context each overlay and input reads, and the one
 * toast host (so a page may call `toast.success()` without mounting its own).
 */
function Root(props: RouteSectionProps): JSX.Element {
  return (
    <UIProvider dir="ltr">
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
  { path: '/components', title: 'Components' },
  { path: '/components/atoms', title: 'Anatomy & variants' },
  { path: '/components/feedback', title: 'Feedback & state' },
  { path: '/components/:name', title: 'Component' },
  { path: '/blocks', title: 'All blocks' },
  { path: '/examples', title: 'Examples' },
  { path: '/examples/discussions/desktop', title: 'Discussions · desktop' },
  { path: '/examples/discussions/mobile', title: 'Discussions · mobile' },
  { path: '/spec', title: 'Component spec' },
  { path: '/play', title: 'Single demo' },
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
    const title = TITLES.get(location.pathname)
    if (title) document.title = `${title} · newui`
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
        {/* The two hand-written reference pages sit in the site group; the
            generated `:name` pages sit in their own group below. A static
            segment outranks a parameter, so these win for their own paths. */}
        <Route path="/components/atoms" component={Atoms} />
        <Route path="/components/feedback" component={Feedback} />
        <Route path="/blocks" component={Blocks} />
        <Route path="/examples" component={Examples} />
        <Route
          path="/examples/discussions/desktop"
          component={DiscussionsDesktop}
        />
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

      <Route component={BareLayout}>
        <Route
          path="/examples/discussions/mobile"
          component={DiscussionsMobile}
        />
        <Route path="/spec" component={Spec} />
        <Route path="/play" component={Play} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  )
}
