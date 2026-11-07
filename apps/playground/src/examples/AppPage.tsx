import { A } from '@solidjs/router'
import { Avatar, Icon } from '@talelk/newui-atoms'
import { Dropdown, Menu } from '@talelk/newui-molecules'
import { SidebarItem } from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
import { createMemo, createSignal, For, type JSX } from 'solid-js'
import { assetUrl, sitePath } from '../lib/base'
import { EXAMPLES } from '../lib/examples'
import { ThemeMenu, ThemeMenuCompact } from '../shell/ThemeMenu'
import { BackToExamples } from './BackToExamples'

/**
 * The page-level composition used by the application recipes.
 *
 * It is intentionally not another template: all frame behavior lives in
 * `@talelk/newui-templates/AppShell`. This file supplies this site's Acme brand,
 * tenant picker, shared menu footer and user identity; each page supplies its
 * own grouped navigation and content.
 */
export function AppPage(props: {
  title: string
  description: string
  section: string
  /** Custom sidebar list; a render function so it can read `useSidebar`. */
  navigation?: () => JSX.Element
  actions?: JSX.Element
  /** Compact actions for the mobile bar; defaults to the page actions. */
  headerActions?: JSX.Element
  /** Title in the mobile bar; defaults to the section name. */
  mobileTitle?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  const [tenant, setTenant] = createSignal('production')
  const applicationNavigation = createMemo(() => [
    {
      label: 'Applications',
      // Settings is the pinned footer destination, so it is not repeated in
      // Applications; listing it here too gave every page two Settings links.
      items: EXAMPLES.filter(
        (example) => example.href !== '/pages/settings',
      ).map((example) => ({
        label: example.name,
        icon: example.icon,
        route: sitePath(`${example.href}/fullscreen`),
        active: example.name.toLowerCase() === props.section.toLowerCase(),
      })),
    },
  ])
  const tenantOptions = [
    {
      label: 'Acme · Production',
      value: 'production',
      icon: 'lucide-building-2',
    },
    { label: 'Acme · Staging', value: 'staging', icon: 'lucide-flask-conical' },
  ]
  const accountOptions = [
    {
      label: 'Account settings',
      value: 'account',
      icon: 'lucide-user-round-cog',
    },
    { label: 'Sign out (demo)', value: 'sign-out', icon: 'lucide-log-out' },
  ]

  return (
    <AppShell
      title={props.title}
      description={props.description}
      breadcrumbs={[
        { label: 'Workspace', route: sitePath('/pages') },
        { label: props.section },
      ]}
      mobileTitle={props.mobileTitle ?? props.section}
      headerActions={props.headerActions}
      actions={props.actions}
      navLabel={`${props.section} navigation`}
      brand={
        <A
          href="/pages"
          class="flex min-h-10 items-center gap-2 rounded-control px-2 font-semibold focus-visible:focus-ring"
        >
          <img
            src={assetUrl('favicon.svg')}
            alt=""
            class="size-6 rounded-control"
          />
          <span>Acme workspace</span>
        </A>
      }
      brandCollapsed={
        <A
          href="/pages"
          aria-label="Acme workspace home"
          class="grid size-10 place-items-center rounded-control focus-visible:focus-ring"
        >
          <img
            src={assetUrl('favicon.svg')}
            alt=""
            class="size-7 rounded-control"
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
              class="lucide-building-2 size-4 shrink-0"
              aria-hidden="true"
            />
            <span class="truncate">
              {tenant() === 'staging' ? 'Acme · Staging' : 'Acme · Production'}
            </span>
          </span>
        </Dropdown>
      }
      tenantCollapsed={
        <RailMenu
          label="Choose tenant"
          options={tenantOptions}
          onSelect={setTenant}
        >
          <Icon icon="lucide-building-2" class="size-4" />
        </RailMenu>
      }
      navigation={props.navigation ? undefined : applicationNavigation()}
      navigationContent={props.navigation}
      settings={() => (
        <SidebarItem
          label="Settings"
          icon="lucide-settings"
          route={sitePath('/pages/settings/fullscreen')}
          active={props.section === 'Settings'}
        >
          Settings
        </SidebarItem>
      )}
      account={
        <Dropdown options={accountOptions} class="w-full justify-start">
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <Avatar size="xs" theme="blue" label="Rhea Kapoor" />
            <span class="truncate">Rhea Kapoor</span>
          </span>
        </Dropdown>
      }
      accountCollapsed={
        <RailMenu label="Rhea Kapoor, account" options={accountOptions}>
          <Avatar size="xs" theme="blue" label="Rhea Kapoor" />
        </RailMenu>
      }
      utilities={<ThemeMenu />}
      utilitiesCollapsed={<ThemeMenuCompact />}
      footer={<BackToExamples />}
    >
      {props.children}
    </AppShell>
  )
}

/**
 * A menu whose trigger is one square rail control: no chevron (it would not
 * fit a 56px rail beside the glyph) and a name, since the glyph alone carries
 * none.
 */
function RailMenu(props: {
  label: string
  options: { label: string; value: string; icon?: string }[]
  onSelect?: (value: string) => void
  children: JSX.Element
}): JSX.Element {
  return (
    <Menu.Root onSelect={props.onSelect}>
      <Menu.Trigger
        aria-label={props.label}
        title={props.label}
        class="grid size-8 place-items-center rounded-control text-ink-gray-7 transition-colors hover:bg-surface-gray-3 hover:text-ink-gray-9 focus-visible:focus-ring motion-reduce:transition-none"
      >
        {props.children}
      </Menu.Trigger>
      <Menu.Content>
        <For each={props.options}>
          {(option) => (
            <Menu.Item value={option.value}>
              <Icon
                icon={option.icon}
                class="size-4 shrink-0 text-ink-gray-6"
              />
              <span>{option.label}</span>
            </Menu.Item>
          )}
        </For>
      </Menu.Content>
    </Menu.Root>
  )
}
