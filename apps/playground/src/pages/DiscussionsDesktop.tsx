import { Avatar, Badge, Button, Icon, Tooltip } from '@talelk/newui-atoms'
import {
  Dropdown,
  List,
  ListCell,
  ListRow,
  Menu,
} from '@talelk/newui-molecules'
import { FilterBar, PageToolbar, SidebarItem } from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Show,
  untrack,
} from 'solid-js'
import {
  type createDiscussions,
  DiscussionDialogs,
} from '../examples/discussions'
import { assetUrl } from '../lib/base'

/**
 * Responsive workspace: a tenant/community switcher and all
 * navigation live in the AppShell's one sidebar. Example data and edits stay in
 * this route's memory.
 */

interface Community {
  id: string
  name: string
  icon: string
  unread?: number
}

const COMMUNITIES: Community[] = [
  { id: 'design', name: 'Design', icon: 'lucide-shapes' },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: 'lucide-code',
    unread: 4,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'lucide-megaphone',
  },
]

const SPACES = [
  { name: 'Announcements', icon: 'lucide-megaphone', unread: 2 },
  { name: 'Design System', icon: 'lucide-shapes', unread: 3 },
  { name: 'Website', icon: 'lucide-globe', unread: 0 },
  { name: 'Brand', icon: 'lucide-sparkles', unread: 0 },
  { name: 'Illustrations', icon: 'lucide-pen-tool', unread: 1 },
  { name: 'Research', icon: 'lucide-flask-conical', unread: 0 },
  { name: 'Archive', icon: 'lucide-archive', unread: 0 },
]

const SPACE_ACTIONS = [
  { label: 'Copy link', value: 'copy-link', icon: 'lucide-link' },
  { label: 'Mark all as read', value: 'mark-read', icon: 'lucide-check' },
  { label: 'Manage access', value: 'manage-access', icon: 'lucide-users' },
  { label: 'Archive', value: 'archive', icon: 'lucide-archive' },
]

/** A plain avatar trigger for the account menu — no chevron, no pill. */
function AccountMenu(props: {
  onOpenSettings: () => void
  onLogout: () => void
}): JSX.Element {
  return (
    <Menu.Root
      onSelect={(value) => {
        if (value === 'settings' || value === 'profile') props.onOpenSettings()
        if (value === 'logout') props.onLogout()
      }}
    >
      <Menu.Trigger
        aria-label="Account"
        class="flex size-7 items-center justify-center rounded-full transition focus-visible:ring-0 focus-visible:focus-ring hover:opacity-90"
      >
        <Avatar label="Rhea Kapoor" size="lg" class="size-7" />
      </Menu.Trigger>
      <Menu.Content class="min-w-40">
        <Menu.Item value="profile">
          <Icon icon="lucide-user" class="size-4 shrink-0 text-ink-gray-6" />
          My profile
        </Menu.Item>
        <Menu.Item value="settings">
          <Icon
            icon="lucide-settings"
            class="size-4 shrink-0 text-ink-gray-6"
          />
          Settings
        </Menu.Item>
        <Menu.Item value="logout">
          <Icon icon="lucide-log-out" class="size-4 shrink-0 text-ink-gray-6" />
          Log out
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}

export function DiscussionsDesktop(props: {
  store: ReturnType<typeof createDiscussions>
  space: () => string
  setSpace: (value: string) => void
  onOpenSettings: (section?: string) => void
}): JSX.Element {
  const [community, setCommunity] = createSignal('design')
  const space = () => props.space()
  const setSpace = (value: string) => props.setSpace(value)
  const [feedTab, setFeedTab] = createSignal('All')
  const discussions = untrack(() => props.store)
  const [spacesReversed, setSpacesReversed] = createSignal(false)
  const [notice, setNotice] = createSignal('')

  const setSettingsOpen = (value: boolean) => {
    if (value) props.onOpenSettings()
  }

  const visibleDiscussions = createMemo(() =>
    feedTab() === 'Unread'
      ? discussions.rows().filter((discussion) => discussion.unread > 0)
      : discussions.rows(),
  )

  const spaceAction = (value: string) => {
    if (value === 'mark-read') {
      discussions.markRead()
      setNotice('All discussions in this space are read.')
    }
    if (value === 'copy-link') {
      void navigator.clipboard
        .writeText(
          `${location.origin}${location.pathname}#${encodeURIComponent(space())}`,
        )
        .then(
          () => setNotice('Space link copied.'),
          () => setNotice('Copy the current page address to share this demo.'),
        )
    }
    if (value === 'manage-access') {
      props.onOpenSettings('users')
    }
    if (value === 'archive') {
      setSpace('Archive')
      setNotice('Viewing the archive. Original discussions are retained.')
    }
  }

  return (
    <>
      <AppShell
        title="Discussions"
        description="A community workspace with one sidebar, grouped spaces and account utilities."
        mobileTitle="Discussions"
        navLabel="Discussions navigation"
        brand={
          <a
            href="/pages/discussions"
            class="flex min-h-10 items-center gap-2 rounded-3 px-2 font-semibold focus-visible:focus-ring"
          >
            <img
              src={assetUrl('favicon.svg')}
              alt=""
              class="size-6 rounded-[6px]"
            />
            <span>Acme Community</span>
          </a>
        }
        brandCollapsed={
          <a
            href="/pages/discussions"
            aria-label="Acme Community home"
            class="grid size-10 place-items-center rounded-3 focus-visible:focus-ring"
          >
            <img
              src={assetUrl('favicon.svg')}
              alt=""
              class="size-7 rounded-[6px]"
            />
          </a>
        }
        tenant={
          <Dropdown
            options={COMMUNITIES.map((item) => ({
              label: item.name,
              value: item.id,
              icon: item.icon,
            }))}
            onSelect={setCommunity}
          >
            <span class="flex min-w-0 items-center gap-2">
              <span
                class={`size-4 shrink-0 ${COMMUNITIES.find((item) => item.id === community())?.icon ?? 'lucide-shapes'}`}
                aria-hidden="true"
              />
              <span class="truncate">
                {COMMUNITIES.find((item) => item.id === community())?.name ??
                  'Design'}
              </span>
            </span>
          </Dropdown>
        }
        tenantCollapsed={
          <Dropdown
            options={COMMUNITIES.map((item) => ({
              label: item.name,
              value: item.id,
              icon: item.icon,
            }))}
            onSelect={setCommunity}
          >
            <span class="grid size-9 place-items-center">
              <span class="sr-only">Choose community</span>
              <span
                class={`size-4 ${COMMUNITIES.find((item) => item.id === community())?.icon ?? 'lucide-shapes'}`}
                aria-hidden="true"
              />
            </span>
          </Dropdown>
        }
        navigation={[
          {
            label: 'Community',
            items: COMMUNITIES.map((item) => ({
              label: item.name,
              icon: item.icon,
              active: community() === item.id,
              ...(item.unread ? { count: item.unread } : {}),
              onClick: () => setCommunity(item.id),
            })),
          },
          {
            label: 'Spaces',
            action: (
              <Button
                variant="ghost"
                size="xs"
                icon="lucide-arrow-up-down"
                onClick={() => setSpacesReversed((value) => !value)}
                aria-label="Sort spaces"
              />
            ),
            items: (spacesReversed() ? [...SPACES].reverse() : SPACES).map(
              (item) => ({
                label: item.name,
                icon: item.icon,
                ...(item.unread ? { count: item.unread } : {}),
                active: space() === item.name,
                onClick: () => setSpace(item.name),
              }),
            ),
          },
        ]}
        settings={
          <SidebarItem
            label="Settings"
            icon="lucide-settings"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </SidebarItem>
        }
        account={
          <AccountMenu
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={() => {
              discussions.setQuery('')
              discussions.setSelected(undefined)
              setNotice(
                'Local session cleared. No external account is connected.',
              )
            }}
          />
        }
        accountCollapsed={
          <AccountMenu
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={() => {
              discussions.setQuery('')
              discussions.setSelected(undefined)
              setNotice(
                'Local session cleared. No external account is connected.',
              )
            }}
          />
        }
      >
        <PageToolbar
          title={space()}
          menu={SPACE_ACTIONS.map((action) => ({
            label: action.label,
            icon: action.icon,
            onClick: () => spaceAction(action.value),
          }))}
          action={{ label: 'New discussion', onClick: discussions.start }}
        />

        <div class="flex flex-col gap-4">
          <div class="mb-4">
            <FilterBar
              query={{
                placeholder: 'Search discussions…',
                value: discussions.query(),
                onInput: discussions.setQuery,
              }}
              tabs={{
                value: feedTab(),
                onValueChange: setFeedTab,
                options: [
                  { label: 'Unread', value: 'Unread' },
                  { label: 'All', value: 'All' },
                ],
              }}
              chips={[
                ...(feedTab() === 'Unread'
                  ? [
                      {
                        label: 'Unread only',
                        onRemove: () => setFeedTab('All'),
                      },
                    ]
                  : []),
                ...(discussions.query()
                  ? [
                      {
                        label: `Search: ${discussions.query()}`,
                        onRemove: () => discussions.setQuery(''),
                      },
                    ]
                  : []),
              ]}
              resultCount={visibleDiscussions().length}
              onClearAll={() => {
                discussions.setQuery('')
                setFeedTab('All')
              }}
            />
          </div>
          <Show when={notice()}>
            <p role="status" class="mb-3 text-caption text-ink-gray-7">
              {notice()}
            </p>
          </Show>

          {/* `-mx-3` lets the row hover surface bleed past the text edge, so the
              content stays aligned with the container. */}
          <List class="-mx-3">
            <For each={visibleDiscussions()}>
              {(discussion) => (
                <ListRow height="h-15">
                  <ListCell>
                    <Avatar label={discussion.author} size="2xl" />
                  </ListCell>
                  <ListCell>
                    <div class="min-w-0 flex-1">
                      {/* The sized text sits in an inner span so it keeps its own
                          line-height; `leading-none` together with `truncate`
                          would shear off descenders. */}
                      <div class="truncate leading-none text-ink-gray-8">
                        <span
                          class={
                            discussion.unread
                              ? 'text-base-semibold'
                              : 'text-base'
                          }
                        >
                          <button
                            type="button"
                            class="max-w-full truncate rounded-3 text-start focus-visible:focus-ring-blue"
                            onClick={() => discussions.open(discussion)}
                          >
                            {discussion.title}
                          </button>
                        </span>
                      </div>
                      <div class="mt-1.5 flex min-w-0 items-center text-base text-ink-gray-7">
                        <Icon
                          icon="lucide-reply"
                          class="mr-1 size-4 shrink-0"
                        />
                        <span class="shrink-0">{discussion.author}:&nbsp;</span>
                        <span class="truncate">{discussion.excerpt}</span>
                      </div>
                    </div>
                  </ListCell>
                  <ListCell class="justify-end">
                    <div>
                      <div class="text-right text-sm whitespace-nowrap text-ink-gray-7">
                        {discussion.lastActivity}
                      </div>
                      <div class="mt-1.5 flex items-center justify-end">
                        <Show
                          when={discussion.unread}
                          fallback={<Badge>{discussion.comments + 1}</Badge>}
                        >
                          <Tooltip text={`${discussion.unread} unread`}>
                            <Badge theme="amber" variant="solid" size="sm">
                              {discussion.unread}
                            </Badge>
                          </Tooltip>
                        </Show>
                      </div>
                    </div>
                  </ListCell>
                </ListRow>
              )}
            </For>
          </List>
          <Show when={!visibleDiscussions().length}>
            <p class="py-8 text-center text-ink-gray-7">
              No discussions match this space and filter.
            </p>
          </Show>
        </div>
      </AppShell>
      <DiscussionDialogs store={discussions} />
    </>
  )
}
