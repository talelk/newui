import { Avatar, Badge, Button, Icon } from '@talelk/newui-atoms'
import {
  Dropdown,
  List,
  ListCell,
  ListRow,
  Menu,
} from '@talelk/newui-molecules'
import {
  DataState,
  FilterBar,
  PageToolbar,
  SidebarItem,
} from '@talelk/newui-organisms'
import { AppShell } from '@talelk/newui-templates'
import {
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
  untrack,
} from 'solid-js'
import { BackToExamples } from '../examples/BackToExamples'
import { COMMUNITIES, SPACES } from '../examples/discussion-fixtures'
import {
  type createDiscussions,
  DiscussionDialogs,
  formatRelativeTime,
  lastActivityAt,
  pluralize,
  replyCount,
  unreadCount,
} from '../examples/discussions'
import { assetUrl, sitePath } from '../lib/base'
import { ThemeMenu, ThemeMenuCompact } from '../shell/ThemeMenu'

/**
 * Responsive workspace: a tenant/community switcher and all
 * navigation live in the AppShell's one sidebar. Example data and edits stay in
 * this route's memory.
 */

interface CommunityOption {
  label: string
  value: string
  icon: string
}

/**
 * The rail keeps the community switcher but not the Dropdown chevron: at 56px
 * wide the glyph and the chevron read as two unrelated icons.
 */
function CollapsedCommunityMenu(props: {
  options: CommunityOption[]
  icon: string
  current: string
  onSelect: (value: string) => void
}): JSX.Element {
  return (
    <Menu.Root onSelect={props.onSelect}>
      <Menu.Trigger
        aria-label={`Choose community, currently ${props.current}`}
        title={props.current}
        class="grid size-10 place-items-center rounded-control bg-surface-gray-2 text-ink-gray-8 transition-colors hover:bg-surface-gray-3 focus-visible:focus-ring"
      >
        <span class={`size-4 ${props.icon}`} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Content class="min-w-44">
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

/** A plain account trigger in the rail, a responsibility-ready row when open. */
function AccountMenu(props: {
  compact?: boolean
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
        aria-label={props.compact ? 'Account menu' : undefined}
        class={
          props.compact
            ? 'flex size-7 items-center justify-center rounded-full transition hover:opacity-90 focus-visible:ring-0 focus-visible:focus-ring'
            : 'flex min-h-10 w-full items-center gap-2 rounded-control px-2 text-start transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring lg:min-h-8'
        }
      >
        <span aria-hidden="true" class="shrink-0">
          <Avatar label="Rhea Kapoor" size="lg" class="size-7" />
        </span>
        <Show when={!props.compact}>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-base text-ink-gray-8">
              Rhea Kapoor
            </span>
            <span class="block truncate text-caption text-ink-gray-7">
              Admin
            </span>
          </span>
          <span class="sr-only">Account menu</span>
        </Show>
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
  community: () => string
  setCommunity: (value: string) => void
  space: () => string
  setSpace: (value: string) => void
  onOpenSettings: (section?: string) => void
}): JSX.Element {
  const space = () => props.space()
  const community = () => props.community()
  const discussions = untrack(() => props.store)
  const [feedTab, setFeedTab] = createSignal('All')
  const [spacesReversed, setSpacesReversed] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  let noticeTimer: number | undefined

  const notify = (message: string) => {
    setNotice(message)
    if (noticeTimer !== undefined) window.clearTimeout(noticeTimer)
    noticeTimer = window.setTimeout(() => setNotice(''), 4000)
  }

  onCleanup(() => {
    if (noticeTimer !== undefined) window.clearTimeout(noticeTimer)
  })

  const setSettingsOpen = (value: boolean) => {
    if (value) props.onOpenSettings()
  }

  const currentCommunity = () =>
    COMMUNITIES.find((item) => item.id === community())

  const spaces = createMemo(() =>
    SPACES.filter((item) => item.community === community()).map((item) => ({
      ...item,
      unread: discussions.unreadInSpace(item.name),
    })),
  )

  const orderedSpaces = createMemo(() =>
    spacesReversed() ? [...spaces()].reverse() : spaces(),
  )

  const communityOptions = createMemo(() =>
    COMMUNITIES.map((item) => {
      const unread = discussions.unreadInCommunity(item.id)
      return {
        label: unread > 0 ? `${item.name} · ${unread} unread` : item.name,
        value: item.id,
        icon: item.icon,
      }
    }),
  )

  const visibleDiscussions = createMemo(() =>
    feedTab() === 'Unread'
      ? discussions.rows().filter((discussion) => unreadCount(discussion) > 0)
      : discussions.rows(),
  )

  const spaceLabel = () => space() || 'this space'

  const defaultSpace = () =>
    spaces().find((item) => item.name !== 'Archive')?.name ?? 'Design System'

  const selectCommunity = (value: string) => {
    if (value === community()) return
    setFeedTab('All')
    setNotice('')
    discussions.setQuery('')
    discussions.setSelected(undefined)
    props.setCommunity(value)
  }

  const selectSpace = (value: string) => {
    if (value === space()) return
    setFeedTab('All')
    setNotice('')
    discussions.setQuery('')
    discussions.setSelected(undefined)
    props.setSpace(value)
  }

  const emptyState = createMemo(() => {
    const search = discussions.query().trim()
    if (search)
      return {
        icon: 'lucide-search',
        title: `No discussions match “${search}”`,
        description: `Clear the search or try another space.`,
        actionLabel: 'Clear search',
        onAction: () => discussions.setQuery(''),
      }
    if (space() === 'Archive')
      return {
        icon: 'lucide-archive',
        title: 'Archive is read-only',
        description:
          'Archived discussions are kept for reference. Choose another space to start a new conversation.',
        actionLabel: `Back to ${defaultSpace()}`,
        onAction: () => selectSpace(defaultSpace()),
      }
    if (discussions.spacePosts().length === 0)
      return {
        icon: 'lucide-message-square-plus',
        title: `No discussions in ${spaceLabel()} yet`,
        description: 'Start the first conversation and it will appear here.',
        actionLabel: 'Start a discussion',
        onAction: discussions.start,
      }
    if (feedTab() === 'Unread')
      return {
        icon: 'lucide-check-check',
        title: 'You’re all caught up',
        description: `There are no unread discussions in ${spaceLabel()}.`,
        actionLabel: 'View all discussions',
        onAction: () => setFeedTab('All'),
      }
    return {
      icon: 'lucide-inbox',
      title: 'Nothing here yet',
      description: 'Try another space or start a new discussion.',
      actionLabel: 'Start a discussion',
      onAction: discussions.start,
    }
  })

  const focusDiscussion = (id: string) => {
    const rows = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-discussion-id]'),
    )
    const target = rows.find((item) => item.dataset['discussionId'] === id)
    if (target) {
      target.focus()
      return
    }
    // Opening a thread from Unread removes it from that list. Move to the next
    // unread row, or back to the view switcher when the list is now empty.
    const next = rows[0]
    if (next) {
      next.focus()
      return
    }
    const all = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-slot="tab-trigger"]'),
    ).find((item) => item.textContent?.trim() === 'All')
    all?.focus()
  }

  const copyPageLink = () => {
    void navigator.clipboard.writeText(location.href.replace(/#.*$/, '')).then(
      () =>
        notify('Page address copied. Space selection stays in this session.'),
      () => notify('Copy the page address to share this demo.'),
    )
  }

  const markRead = () => {
    const unread = discussions.unreadInSpace(space())
    discussions.markRead()
    notify(
      unread > 0
        ? 'All discussions in this space are read.'
        : 'There was nothing unread in this space.',
    )
  }

  const spaceActions = createMemo(() => {
    const actions = [
      {
        label: 'Copy page link',
        icon: 'lucide-link',
        onClick: copyPageLink,
      },
      {
        label: 'Mark all as read',
        icon: 'lucide-check',
        onClick: markRead,
      },
      {
        label: 'Manage access',
        icon: 'lucide-users',
        onClick: () => props.onOpenSettings('users'),
      },
    ]
    if (space() !== 'Archive')
      actions.push({
        label: 'Open archive',
        icon: 'lucide-archive',
        onClick: () => {
          selectSpace('Archive')
          notify('Archive is read-only in this demo.')
        },
      })
    return actions
  })

  const logout = () => {
    discussions.setQuery('')
    discussions.setSelected(undefined)
    notify('Local session cleared. No external account is connected.')
  }

  return (
    <>
      <AppShell
        title="Discussions"
        mobileTitle={spaceLabel()}
        navLabel="Discussions navigation"
        brand={
          <a
            href={sitePath('/pages/discussions')}
            class="flex min-h-10 items-center gap-2 rounded-3 px-2 font-semibold focus-visible:focus-ring"
          >
            <img
              src={assetUrl('favicon.svg')}
              alt=""
              class="size-6 rounded-control"
            />
            <span>Acme Community</span>
          </a>
        }
        brandCollapsed={
          <a
            href={sitePath('/pages/discussions')}
            aria-label="Acme Community home"
            class="grid size-10 place-items-center rounded-3 focus-visible:focus-ring"
          >
            <img
              src={assetUrl('favicon.svg')}
              alt=""
              class="size-7 rounded-control"
            />
          </a>
        }
        tenant={
          <Dropdown
            options={communityOptions()}
            onSelect={selectCommunity}
            class="h-10 w-full justify-between lg:h-8"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span
                class={`size-4 shrink-0 ${currentCommunity()?.icon ?? 'lucide-shapes'}`}
                aria-hidden="true"
              />
              <span class="truncate">
                {currentCommunity()?.name ?? 'Community'}
              </span>
            </span>
          </Dropdown>
        }
        tenantCollapsed={
          <CollapsedCommunityMenu
            options={communityOptions()}
            icon={currentCommunity()?.icon ?? 'lucide-shapes'}
            current={currentCommunity()?.name ?? 'Community'}
            onSelect={selectCommunity}
          />
        }
        navigation={[
          {
            label: 'Spaces',
            action: (
              <Button
                variant="ghost"
                size="xs"
                icon="lucide-arrow-up-down"
                aria-label="Sort spaces"
                aria-pressed={spacesReversed()}
                onClick={() => setSpacesReversed((value) => !value)}
              />
            ),
            items: orderedSpaces().map((item) => ({
              label: item.name,
              icon: item.icon,
              ...(item.unread ? { count: item.unread } : {}),
              active: space() === item.name,
              onClick: () => selectSpace(item.name),
            })),
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
            onLogout={logout}
          />
        }
        accountCollapsed={
          <AccountMenu
            compact
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={logout}
          />
        }
        utilities={<ThemeMenu />}
        utilitiesCollapsed={<ThemeMenuCompact />}
        footer={<BackToExamples />}
      >
        <PageToolbar
          title={spaceLabel()}
          headingLevel={2}
          menu={spaceActions()}
        >
          <Show when={space() !== 'Archive'}>
            <Button
              variant="solid"
              theme="blue"
              iconLeft="lucide-plus"
              class="h-10 lg:h-7"
              onClick={discussions.start}
            >
              New discussion
            </Button>
          </Show>
        </PageToolbar>

        <div class="flex flex-col gap-4">
          <FilterBar
            query={{
              placeholder: 'Search discussions…',
              value: discussions.query(),
              onInput: discussions.setQuery,
            }}
            tabs={{
              label: 'Feed',
              value: feedTab(),
              onValueChange: setFeedTab,
              options: [
                { label: 'All', value: 'All' },
                { label: 'Unread', value: 'Unread' },
              ],
            }}
            chips={
              discussions.query()
                ? [
                    {
                      label: `Search: ${discussions.query()}`,
                      onRemove: () => discussions.setQuery(''),
                    },
                  ]
                : []
            }
            resultCount={visibleDiscussions().length}
            onClearAll={() => {
              discussions.setQuery('')
              setFeedTab('All')
            }}
          />

          <Show when={notice()}>
            <p role="status" class="text-caption text-ink-gray-7">
              {notice()}
            </p>
          </Show>

          <DataState
            status={visibleDiscussions().length > 0 ? 'ready' : 'empty'}
            icon={emptyState().icon}
            title={emptyState().title}
            description={emptyState().description}
            action={
              <Button variant="outline" onClick={emptyState().onAction}>
                {emptyState().actionLabel}
              </Button>
            }
          >
            {/* `-mx-3` lets the row hover surface bleed past the text edge, so the
                content stays aligned with the container. */}
            <List class="-mx-3">
              <For each={visibleDiscussions()}>
                {(discussion) => (
                  <ListRow
                    height="h-15"
                    onClick={() => discussions.open(discussion)}
                  >
                    <ListCell>
                      <div aria-hidden="true">
                        <Avatar label={discussion.author} size="2xl" />
                      </div>
                    </ListCell>
                    <ListCell>
                      <div class="min-w-0 flex-1">
                        {/* The sized text sits in an inner span so it keeps its own
                            line-height; `leading-none` together with `truncate`
                            would shear off descenders. */}
                        <div class="truncate leading-none text-ink-gray-8">
                          <span
                            class={
                              unreadCount(discussion)
                                ? 'text-base-semibold'
                                : 'text-base'
                            }
                          >
                            <button
                              type="button"
                              data-discussion-id={discussion.id}
                              class="max-w-full truncate rounded-3 text-start focus-visible:focus-ring-blue"
                              onClick={(event) => {
                                event.stopPropagation()
                                discussions.open(discussion)
                              }}
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
                          <span class="shrink-0">
                            {discussion.author}:&nbsp;
                          </span>
                          <span class="truncate">{discussion.excerpt}</span>
                        </div>
                      </div>
                    </ListCell>
                    <ListCell class="justify-end">
                      <div class="flex flex-col items-end">
                        <time
                          dateTime={new Date(
                            lastActivityAt(discussion),
                          ).toISOString()}
                          class="whitespace-nowrap text-right text-sm text-ink-gray-7"
                        >
                          {formatRelativeTime(lastActivityAt(discussion))}
                        </time>
                        <div class="mt-1.5 flex items-center justify-end gap-2">
                          <span class="inline-flex items-center gap-1 whitespace-nowrap text-caption tabular-nums text-ink-gray-7">
                            <Icon
                              icon="lucide-reply"
                              class="size-3.5"
                              aria-hidden="true"
                            />
                            <span aria-hidden="true">
                              {replyCount(discussion)}
                            </span>
                            <span class="hidden sm:inline" aria-hidden="true">
                              {pluralize(
                                replyCount(discussion),
                                'reply',
                                'replies',
                              )}
                            </span>
                            <span class="sr-only">
                              {replyCount(discussion)}{' '}
                              {pluralize(
                                replyCount(discussion),
                                'reply',
                                'replies',
                              )}
                            </span>
                          </span>
                          <Show when={unreadCount(discussion) > 0}>
                            <Badge theme="amber" variant="solid" size="sm">
                              <span aria-hidden="true">
                                {unreadCount(discussion)}
                              </span>
                              <span class="sr-only">
                                {unreadCount(discussion)} unread
                              </span>
                            </Badge>
                          </Show>
                        </div>
                      </div>
                    </ListCell>
                  </ListRow>
                )}
              </For>
            </List>
          </DataState>
        </div>
      </AppShell>
      <DiscussionDialogs
        store={discussions}
        onClosed={focusDiscussion}
        onCreated={() => {
          setFeedTab('All')
          notify('Discussion posted.')
        }}
        onPosted={() => notify('Reply posted.')}
      />
    </>
  )
}
