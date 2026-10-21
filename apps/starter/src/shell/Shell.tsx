import { Avatar, Button } from '@newui/atoms'
import { type BreadcrumbItem, Dropdown } from '@newui/molecules'
import { SidebarItem } from '@newui/organisms'
import { AppShell } from '@newui/templates'
import { A, useLocation, useNavigate } from '@solidjs/router'
import { createSignal, type JSX, Show } from 'solid-js'
import { session, signOut } from '../data/session'
import { emitStarterEvent } from '../devtools/events'
import { ThemeToggle } from './ThemeToggle'

/** The starter app's brand, menu groups, tenant, and account actions. */
export function Shell(props: {
  title: string
  description?: string
  sections?: BreadcrumbItem[]
  actions?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const [tenant, setTenant] = createSignal('production')
  const tenantOptions = [
    {
      label: 'Acme · Production',
      value: 'production',
      icon: 'lucide-building-2',
    },
    { label: 'Acme · Staging', value: 'staging', icon: 'lucide-flask-conical' },
  ]
  const accountOptions = [
    { label: 'Sign out', value: 'sign-out', icon: 'lucide-log-out' },
  ]
  const account = () => session()?.name ?? 'Guest'
  const navigation = [
    {
      label: 'Workspace',
      items: [
        {
          label: 'Projects',
          icon: 'lucide-folder-kanban',
          route: '/',
          active: location.pathname === '/',
        },
      ],
    },
  ]
  const signOutAndNavigate = () => {
    const current = session()
    signOut()
    if (current) emitStarterEvent('session:sign-out', { name: current.name })
    navigate('/sign-in')
  }

  return (
    <AppShell
      title={props.title}
      description={props.description}
      breadcrumbs={props.sections}
      actions={props.actions}
      mobileTitle="Projects"
      navLabel="Starter navigation"
      navigation={navigation}
      brand={
        <A
          href="/"
          class="flex min-h-10 items-center gap-2 rounded-3 px-2 font-semibold focus-visible:focus-ring"
        >
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
          <span>Acme workspace</span>
        </A>
      }
      brandCollapsed={
        <A
          href="/"
          aria-label="Acme workspace home"
          class="grid size-10 place-items-center rounded-3 focus-visible:focus-ring"
        >
          <span
            aria-hidden="true"
            class="lucide-boxes size-5 text-ink-blue-6"
          />
        </A>
      }
      tenant={
        <Dropdown options={tenantOptions} onSelect={setTenant}>
          <span class="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              class="lucide-building-2 size-4 shrink-0"
            />
            <span class="truncate">
              {tenant() === 'staging' ? 'Acme · Staging' : 'Acme · Production'}
            </span>
          </span>
        </Dropdown>
      }
      tenantCollapsed={
        <Dropdown options={tenantOptions} onSelect={setTenant}>
          <span class="grid size-9 place-items-center">
            <span class="sr-only">Choose tenant</span>
            <span aria-hidden="true" class="lucide-building-2 size-4" />
          </span>
        </Dropdown>
      }
      settings={
        <SidebarItem
          label="Settings"
          icon="lucide-settings"
          route="/settings"
          active={location.pathname === '/settings'}
        >
          Settings
        </SidebarItem>
      }
      account={
        <Dropdown
          options={accountOptions}
          onSelect={(value) => {
            if (value === 'sign-out') signOutAndNavigate()
          }}
        >
          <span class="flex min-w-0 items-center gap-2">
            <Avatar size="xs" theme="blue" label={account()} />
            <span class="truncate">{account()}</span>
          </span>
        </Dropdown>
      }
      accountCollapsed={
        <Dropdown
          options={accountOptions}
          onSelect={(value) => {
            if (value === 'sign-out') signOutAndNavigate()
          }}
        >
          <Avatar size="xs" theme="blue" label={account()} />
        </Dropdown>
      }
      headerActions={
        <>
          <ThemeToggle />
          <Show when={!session()}>
            <Button size="sm" onClick={() => navigate('/sign-in')}>
              Sign in
            </Button>
          </Show>
        </>
      }
      footer={
        <footer class="text-caption text-ink-gray-7">
          <span>Local demo data · Built with newui</span>
        </footer>
      }
    >
      {props.children}
    </AppShell>
  )
}
