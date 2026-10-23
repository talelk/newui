import { A, useLocation, useNavigate } from '@solidjs/router'
import { Avatar, Button } from '@talelk/newui-atoms'
import { type BreadcrumbItem, Dropdown } from '@talelk/newui-molecules'
import { SidebarItem } from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
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
        <Dropdown
          options={tenantOptions}
          onSelect={setTenant}
          class="w-full justify-start"
        >
          <span class="flex min-w-0 flex-1 items-center gap-2">
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
        <button
          type="button"
          aria-label="Switch tenant"
          title="Switch tenant"
          onClick={() =>
            setTenant(tenant() === 'staging' ? 'production' : 'staging')
          }
          class="grid size-8 place-items-center rounded-control text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
        >
          <span aria-hidden="true" class="lucide-building-2 size-4" />
        </button>
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
          class="w-full justify-start"
        >
          <span class="flex min-w-0 flex-1 items-center gap-2">
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
