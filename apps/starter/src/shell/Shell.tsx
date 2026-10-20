import { AppLayout } from '@newui/layouts'
import {
  Avatar,
  type BreadcrumbItem,
  Button,
  SidebarItem,
  SidebarRail,
  SidebarRailItem,
  useSidebar,
} from '@newui/ui'
import { A, useLocation, useNavigate } from '@solidjs/router'
import { For, type JSX, Show } from 'solid-js'
import { session, signOut } from '../data/session'
import { ThemeToggle } from './ThemeToggle'

/**
 * The application frame.
 *
 * `AppLayout` owns the arrangement — the rail slot, the folding navigation
 * column, the title block, the mobile bar, the content scroller. This file is
 * what is *this app's*: which destinations exist, the brand, the account, the
 * footer. A second app would share the arrangement and none of the chrome,
 * which is exactly the split the layout level exists for.
 */

interface Destination {
  label: string
  icon: string
  path: string
}

const DESTINATIONS: Destination[] = [
  { label: 'Projects', icon: 'lucide-folder-kanban', path: '/' },
  { label: 'Settings', icon: 'lucide-settings-2', path: '/settings' },
]

function isCurrent(pathname: string, path: string): boolean {
  return path === '/' ? pathname === '/' : pathname.startsWith(path)
}

/**
 * The narrow strip: the app's mark at the head, the account at the foot.
 *
 * A rail earns its place by listing *applications*, not destinations — the
 * sidebar already lists the destinations, and putting Projects in both would be
 * the same control twice. A workspace with a second app adds it between the
 * mark and the account.
 */
function Rail(): JSX.Element {
  const navigate = useNavigate()
  return (
    <SidebarRail class="border-e border-outline-gray-1">
      <SidebarRailItem
        label="Acme — projects"
        active
        route="/"
        onClick={(event) => {
          event.preventDefault()
          navigate('/')
        }}
      >
        <span aria-hidden="true" class="lucide-boxes size-6 text-ink-blue-6" />
      </SidebarRailItem>
      <div class="flex-1" />
      <div class="flex flex-col items-center pb-2">
        <SidebarRailItem label={session()?.name ?? 'Guest'}>
          <Avatar size="xs" theme="blue" label={session()?.name ?? 'Guest'} />
        </SidebarRailItem>
      </div>
    </SidebarRail>
  )
}

/** The navigation column: the same destinations with their labels. */
function Nav(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { collapsed } = useSidebar()
  return (
    <nav aria-label="Starter navigation" class="flex flex-col gap-0.5">
      <Show when={!collapsed()}>
        <p class="px-2 pb-1 text-xs font-medium text-ink-gray-7">Workspace</p>
      </Show>
      <For each={DESTINATIONS}>
        {(destination) => (
          <SidebarItem
            label={destination.label}
            icon={destination.icon}
            active={isCurrent(location.pathname, destination.path)}
            route={destination.path}
            onClick={(event) => {
              event.preventDefault()
              navigate(destination.path)
            }}
          >
            {destination.label}
          </SidebarItem>
        )}
      </For>
      <Show when={!collapsed()}>
        <p class="px-2 pt-4 text-xs leading-relaxed text-ink-gray-7">
          One collection, one table, one form. Everything on this screen is a
          public kit surface.
        </p>
      </Show>
    </nav>
  )
}

export function Shell(props: {
  title: JSX.Element
  description?: JSX.Element
  sections?: BreadcrumbItem[]
  actions?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  const navigate = useNavigate()
  return (
    <AppLayout
      title={props.title}
      description={props.description}
      breadcrumbs={props.sections}
      actions={props.actions}
      navLabel="Starter navigation"
      mobileTitle="Projects"
      rail={<Rail />}
      sidebar={<Nav />}
      sidebarFooter={
        <A
          href="/settings"
          class="block rounded-3 px-3 py-2 text-caption text-ink-gray-7 focus-visible:focus-ring"
        >
          Workspace settings
        </A>
      }
      brand={
        <A
          href="/"
          class="flex items-center gap-2 rounded-3 font-semibold focus-visible:focus-ring"
        >
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
          Acme{' '}
          <span class="hidden font-normal text-ink-gray-7 sm:inline">
            / Projects
          </span>
        </A>
      }
      headerActions={
        <>
          <ThemeToggle />
          <Show
            when={session()}
            fallback={
              <Button size="sm" onClick={() => navigate('/sign-in')}>
                Sign in
              </Button>
            }
          >
            {(current) => (
              <div class="flex items-center gap-2">
                <Avatar size="sm" theme="blue" label={current().name} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    signOut()
                    navigate('/sign-in')
                  }}
                >
                  Sign out
                </Button>
              </div>
            )}
          </Show>
        </>
      }
      footer={
        <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-7">
          <span>Local demo data · Built with newui</span>
          <A
            href="/settings"
            class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
          >
            Settings{' '}
            <span
              aria-hidden="true"
              class="lucide-arrow-right inline-block size-4 align-middle"
            />
          </A>
        </footer>
      }
    >
      {props.children}
    </AppLayout>
  )
}
