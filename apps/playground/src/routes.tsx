import {
  Route,
  Router,
  type RouteSectionProps,
  useLocation,
} from '@solidjs/router'
import { UIProvider } from '@talelk/newui-atoms'
import { Toaster } from '@talelk/newui-molecules'
import {
  type Component,
  createEffect,
  createSignal,
  type JSX,
  lazy,
  onCleanup,
  onMount,
} from 'solid-js'
import { BASE_PATH, stripBase } from './lib/base'
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

const AtomsLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.AtomsLayout,
  })),
)
const MoleculesLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.MoleculesLayout,
  })),
)
const OrganismsLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.OrganismsLayout,
  })),
)
const TemplatesLayout = lazy(() =>
  import('./shell/ReferenceLayout').then((module) => ({
    default: module.TemplatesLayout,
  })),
)

const KitRecipes = page(() => import('./pages/Patterns'), 'Patterns')
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
const Changelog = page(() => import('./pages/Changelog'), 'Changelog')
const Architecture = page(() => import('./pages/Architecture'), 'Architecture')
const Kit = page(() => import('./pages/Kit'), 'Kit')
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
const StoryPreview = page(() => import('./pages/StoryPreview'), 'StoryPreview')

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
  { path: '/changelog', title: 'Changelog' },
  { path: '/architecture', title: 'Atomic design' },
  { path: '/kit', title: 'Build an app' },
  { path: '/atoms', title: 'Atoms' },
  { path: '/atoms/:name', title: 'Atom' },
  { path: '/molecules', title: 'Molecules' },
  { path: '/molecules/:name', title: 'Molecule' },
  { path: '/organisms', title: 'Organisms' },
  { path: '/organisms/compositions/:name', title: 'Site composition' },
  { path: '/organisms/:name', title: 'Organism' },
  { path: '/templates', title: 'Templates' },
  { path: '/templates/:name', title: 'Template' },
  { path: '/pages', title: 'Pages' },
  { path: '/pages/accounting', title: 'Accounting' },
  { path: '/pages/files', title: 'Files' },
  { path: '/pages/tickets', title: 'Tickets' },
  { path: '/pages/deals', title: 'Deals' },
  { path: '/pages/mail', title: 'Mail' },
  { path: '/pages/compose', title: 'Compose' },
  { path: '/pages/analytics', title: 'Analytics dashboard' },
  { path: '/pages/tasks', title: 'Tasks' },
  { path: '/pages/cards', title: 'Cards' },
  { path: '/pages/authentication', title: 'Authentication' },
  { path: '/pages/discussions', title: 'Discussions' },
  { path: '/pages/settings', title: 'Settings' },
  { path: '/kit/recipes', title: 'Recipes and examples' },
  { path: '/kit/recipes/:name', title: 'Recipe' },
  { path: '/pages/settings/fullscreen', title: 'Settings' },
  { path: '/pages/analytics/fullscreen', title: 'Analytics' },
  { path: '/pages/authentication/fullscreen', title: 'Authentication' },
  { path: '/pages/cards/fullscreen', title: 'Cards' },
  { path: '/pages/deals/fullscreen', title: 'Deals' },
  { path: '/pages/tickets/fullscreen', title: 'Tickets' },
  { path: '/pages/files/fullscreen', title: 'Files' },
  { path: '/pages/accounting/fullscreen', title: 'Accounting' },
  { path: '/pages/mail/fullscreen', title: 'Mail' },
  { path: '/pages/compose/fullscreen', title: 'Compose' },
  { path: '/pages/tasks/fullscreen', title: 'Tasks' },
  { path: '/pages/discussions/fullscreen', title: 'Discussions' },
  { path: '/preview/:name', title: 'Story preview' },
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
    const pathname = stripBase(location.pathname)
    const title = TITLES.get(pathname)
    if (title) document.title = `${title} · newui`
    else if (/^\/kit\/recipes\/[^/]+$/.test(pathname)) {
      const recipe = pathname.split('/').at(-1)?.replaceAll('-', ' ')
      if (recipe) document.title = `${recipe} · Recipes · newui`
    } else if (
      /^\/(atoms|molecules|organisms|templates)\/[^/]+$/.test(pathname)
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
    <Router root={Root} base={BASE_PATH}>
      <Route path="/" component={SiteLayout}>
        <Route path="/" component={Home} />
        <Route path="/docs" component={Docs} />
        <Route path="/foundations" component={Foundations} />
        <Route path="/changelog" component={Changelog} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/kit" component={Kit} />
        <Route path="/kit/recipes" component={KitRecipes} />
        <Route path="/kit/recipes/:name" component={KitRecipes} />

        {/* Pages are complete application workflows; fullscreen routes are
            those same applications without documentation chrome. */}
        <Route path="/pages" component={Examples} />
        <Route path="/pages/accounting" component={ApplicationPage} />
        <Route path="/pages/analytics" component={ApplicationPage} />
        <Route path="/pages/authentication" component={ApplicationPage} />
        <Route path="/pages/cards" component={ApplicationPage} />
        <Route path="/pages/deals" component={ApplicationPage} />
        <Route path="/pages/tickets" component={ApplicationPage} />
        <Route path="/pages/files" component={ApplicationPage} />
        <Route path="/pages/mail" component={ApplicationPage} />
        <Route path="/pages/compose" component={ApplicationPage} />
        <Route path="/pages/tasks" component={ApplicationPage} />
        <Route path="/pages/discussions" component={ApplicationPage} />
        <Route path="/pages/settings" component={ApplicationPage} />
      </Route>

      {/*
        The four atomic levels bring their own sidebar (the full index), so
        each is its own layout group. Only these routes import the registry —
        which is the point: the shell stays small because a page pays for its
        own furniture.
      */}
      <Route path="/atoms" component={AtomsLayout}>
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>
      <Route path="/molecules" component={MoleculesLayout}>
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>
      <Route path="/organisms" component={OrganismsLayout}>
        <Route path="/compositions/:name" component={CompositionPage} />
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>
      <Route path="/templates" component={TemplatesLayout}>
        <Route path="/" component={ComponentsIndex} />
        <Route path="/:name" component={ComponentPage} />
      </Route>

      <Route component={BareLayout}>
        <Route path="/pages/settings/fullscreen" component={Settings} />
        <Route path="/pages/analytics/fullscreen" component={Analytics} />
        <Route
          path="/pages/authentication/fullscreen"
          component={Authentication}
        />
        <Route path="/pages/cards/fullscreen" component={Cards} />
        <Route path="/pages/deals/fullscreen" component={Deals} />
        <Route path="/pages/tickets/fullscreen" component={Tickets} />
        <Route path="/pages/files/fullscreen" component={Files} />
        <Route path="/pages/accounting/fullscreen" component={Accounting} />
        <Route path="/pages/mail/fullscreen" component={Mail} />
        <Route path="/pages/compose/fullscreen" component={Compose} />
        <Route path="/pages/tasks/fullscreen" component={Tasks} />
        <Route path="/pages/discussions/fullscreen" component={Discussions} />
        <Route path="/preview/:name" component={StoryPreview} />
        <Route path="/spec" component={Spec} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  )
}
