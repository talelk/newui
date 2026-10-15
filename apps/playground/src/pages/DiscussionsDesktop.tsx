import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Dropdown,
  Icon,
  List,
  ListCell,
  ListRow,
  Menu,
  PageBody,
  PageHeader,
  PageHeaderTitle,
  ScrollArea,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarRailItem,
  TabButtons,
  TextInput,
  Tooltip,
} from '@newui/ui'
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

/**
 * Frappe-inspired desktop workspace: community rail, spaces, local discussion
 * creation/search/replies and grouped settings, framed inside the docs site.
 * Example data and edits stay in this route's memory.
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

/** Icon-only action menu for the page header — dots trigger, no chevron. */
function SpaceActionsMenu(props: {
  onSelect: (value: string) => void
}): JSX.Element {
  return (
    <Menu.Root onSelect={props.onSelect}>
      <Menu.Trigger
        aria-label="Space actions"
        class="grid size-7 shrink-0 place-items-center rounded-4 text-ink-gray-8 transition-colors hover:bg-surface-gray-2 data-[state=open]:bg-surface-gray-3 focus-visible:ring-0 focus-visible:focus-ring"
      >
        <Icon icon="lucide-ellipsis" class="size-4" />
      </Menu.Trigger>
      <Menu.Content>
        <For each={SPACE_ACTIONS}>
          {(action) => (
            <Menu.Item value={action.value}>
              <Icon
                icon={action.icon}
                class="size-4 shrink-0 text-ink-gray-6"
              />
              {action.label}
            </Menu.Item>
          )}
        </For>
      </Menu.Content>
    </Menu.Root>
  )
}

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

  return (
    <div class="flex flex-col gap-4">
      <div class="min-h-screen overflow-hidden rounded-6 border border-outline-gray-1 shadow-md">
        <AppShell
          class="max-md:[&_[data-slot=sidebar-rail]]:hidden max-md:[&_[data-slot=sidebar]]:hidden"
          rail={
            <SidebarRail class="border-r border-outline-gray-1">
              {/* The logo fills the whole cell and carries no tooltip of its own. */}
              <a
                href="/"
                aria-label="Home"
                class="flex size-7 items-center justify-center rounded-[7px] transition focus-visible:ring-0 focus-visible:focus-ring hover:opacity-90"
              >
                <img
                  src="/favicon.svg"
                  alt=""
                  class="size-7 rounded-[7px]"
                  width="28"
                  height="28"
                />
              </a>

              <div class="flex w-full flex-1 flex-col items-center gap-3 pt-3">
                <For each={COMMUNITIES}>
                  {(item) => (
                    <SidebarRailItem
                      label={item.name}
                      icon={item.icon}
                      active={community() === item.id}
                      badge={item.unread}
                      badgeStyle="count"
                      onClick={() => setCommunity(item.id)}
                    />
                  )}
                </For>
              </div>

              {/* Bottom cluster: the extra gap keeps the utility items and the
                account avatar from crowding each other at the foot of the rail. */}
              <div class="flex flex-col items-center gap-2.5">
                <SidebarRailItem
                  label="Search"
                  variant="ghost"
                  icon="lucide-search"
                  onClick={() =>
                    document.getElementById('discussion-search')?.focus()
                  }
                />
                <SidebarRailItem
                  label="Settings"
                  variant="ghost"
                  icon="lucide-settings"
                  onClick={() => setSettingsOpen(true)}
                />
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
              </div>
            </SidebarRail>
          }
          sidebar={
            <Sidebar width="14rem" class="border-r border-outline-gray-1">
              {/* No logo here: the rail already shows the active community's
                avatar, so a header logo would just duplicate it. */}
              <SidebarHeader
                title={
                  COMMUNITIES.find((item) => item.id === community())?.name ??
                  'Design'
                }
                subtitle="18 members"
                showLogo={false}
                actions={
                  <Dropdown
                    options={[
                      {
                        label: 'Invite people',
                        value: 'invite',
                        icon: 'lucide-user-plus',
                      },
                      {
                        label: 'Community settings',
                        value: 'settings',
                        icon: 'lucide-settings-2',
                      },
                    ]}
                    onSelect={() => setSettingsOpen(true)}
                  >
                    <span class="sr-only">Community actions</span>
                  </Dropdown>
                }
              />

              <ScrollArea.Root class="min-h-0 flex-1">
                <ScrollArea.Viewport class="px-2 pt-0.5 pb-10">
                  <div class="flex flex-col gap-0.5">
                    <SidebarItem
                      prefix={<Icon icon="lucide-house" class="size-4" />}
                    >
                      Home
                    </SidebarItem>
                    <SidebarItem
                      prefix={<Icon icon="lucide-search" class="size-4" />}
                    >
                      Search
                    </SidebarItem>
                  </div>

                  <div class="mt-4 flex h-7 items-center justify-between">
                    <SidebarLabel>Spaces</SidebarLabel>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="lucide-arrow-up-down"
                      onClick={() => setSpacesReversed((value) => !value)}
                      aria-label="Sort spaces"
                    />
                  </div>

                  <div class="mt-0.5 flex flex-col gap-0.5">
                    <For
                      each={spacesReversed() ? [...SPACES].reverse() : SPACES}
                    >
                      {(item) => (
                        <SidebarItem
                          active={space() === item.name}
                          prefix={<Icon icon={item.icon} class="size-4" />}
                          onClick={() => setSpace(item.name)}
                          suffix={
                            <Show when={item.unread}>
                              <span class="grid size-4 place-content-center text-xs text-ink-gray-6">
                                {item.unread}
                              </span>
                            </Show>
                          }
                        >
                          {item.name}
                        </SidebarItem>
                      )}
                    </For>
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar />
              </ScrollArea.Root>
            </Sidebar>
          }
        >
          <PageHeader class="flex-wrap py-2">
            <div class="flex min-w-0 flex-1 items-center gap-1">
              <PageHeaderTitle>{space()}</PageHeaderTitle>
              <SpaceActionsMenu
                onSelect={(value) => {
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
                        () =>
                          setNotice(
                            'Copy the current page address to share this demo.',
                          ),
                      )
                  }
                  if (value === 'manage-access') {
                    props.onOpenSettings('users')
                  }
                  if (value === 'archive') {
                    setSpace('Archive')
                    setNotice(
                      'Viewing the archive. Original discussions are retained.',
                    )
                  }
                }}
              />
            </div>
            <Button
              variant="solid"
              theme="blue"
              iconLeft="lucide-plus"
              onClick={discussions.start}
            >
              Add new
            </Button>
          </PageHeader>

          <PageBody>
            <div class="mb-4">
              <TextInput
                id="discussion-search"
                label="Search discussions"
                value={discussions.query()}
                onInput={(event) =>
                  discussions.setQuery(event.currentTarget.value)
                }
              />
            </div>
            <Show when={notice()}>
              <p role="status" class="mb-3 text-caption text-ink-gray-6">
                {notice()}
              </p>
            </Show>
            <div class="mb-4 flex items-center justify-between">
              <TabButtons
                value={feedTab()}
                onValueChange={setFeedTab}
                options={[
                  { label: 'Unread', value: 'Unread' },
                  { label: 'All', value: 'All' },
                ]}
              />
              <span class="text-sm text-ink-gray-6">
                {visibleDiscussions().length} discussions
              </span>
            </div>

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
                        <div class="mt-1.5 flex min-w-0 items-center text-base text-ink-gray-6">
                          <Icon
                            icon="lucide-reply"
                            class="mr-1 size-4 shrink-0"
                          />
                          <span class="shrink-0">
                            {discussion.author}:&nbsp;
                          </span>
                          <span class="truncate">{discussion.excerpt}</span>
                        </div>
                      </div>
                    </ListCell>
                    <ListCell class="justify-end">
                      <div>
                        <div class="text-right text-sm whitespace-nowrap text-ink-gray-6">
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
              <p class="py-8 text-center text-ink-gray-6">
                No discussions match this space and filter.
              </p>
            </Show>
          </PageBody>
        </AppShell>

        <DiscussionDialogs store={discussions} />
      </div>
    </div>
  )
}
