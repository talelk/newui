import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Icon,
  List,
  ListCell,
  ListRow,
  MobileNav,
  MobileNavItem,
  MobileShell,
  PageHeaderMobile,
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
 * The mobile recipe on its own full-screen route (`/mobile`) — a port of
 * frappe-ui's `docs/components/recipes/DiscussionsMobile.vue`.
 *
 * A `MobileShell` is `fixed inset-0` by design, so it cannot be embedded inline
 * in the scrolling showcase; it takes over the viewport. Spaces live in the
 * desktop sidebar, so on mobile they surface in a bottom sheet instead.
 */

const SPACES = [
  { name: 'Announcements', icon: 'lucide-megaphone', unread: 2 },
  { name: 'Design System', icon: 'lucide-shapes', unread: 3 },
  { name: 'Website', icon: 'lucide-globe', unread: 0 },
  { name: 'Brand', icon: 'lucide-sparkles', unread: 0 },
  { name: 'Illustrations', icon: 'lucide-pen-tool', unread: 1 },
  { name: 'Research', icon: 'lucide-flask-conical', unread: 0 },
  { name: 'Archive', icon: 'lucide-archive', unread: 0 },
]

type Discussion = import('../examples/discussions').Discussion

function DiscussionRow(props: {
  discussion: Discussion
  title: string
  showReplyIcon: boolean
  onOpen: () => void
}): JSX.Element {
  return (
    <ListRow height="h-17">
      <ListCell>
        <Avatar label={props.discussion.author} size="2xl" />
      </ListCell>
      <ListCell>
        <div class="min-w-0 flex-1">
          {/* The sized text sits in an inner span so it keeps its own
              line-height; `leading-none` with `truncate` would shear off
              descenders like the tail of "g". */}
          <div class="truncate leading-none text-ink-gray-8">
            <span class={props.title}>
              <button
                type="button"
                class="max-w-full truncate rounded-3 text-start focus-visible:focus-ring-blue"
                onClick={() => props.onOpen()}
              >
                {props.discussion.title}
              </button>
            </span>
          </div>
          <div class="mt-1.5 flex min-w-0 items-center text-md text-ink-gray-7">
            <Show when={props.showReplyIcon}>
              <Icon icon="lucide-reply" class="mr-1 size-4 shrink-0" />
            </Show>
            <span class="shrink-0">{props.discussion.author}:&nbsp;</span>
            <span class="truncate">{props.discussion.excerpt}</span>
          </div>
        </div>
      </ListCell>
      <ListCell class="justify-end">
        <div>
          <div class="text-right text-sm whitespace-nowrap text-ink-gray-7">
            {props.discussion.lastActivity}
          </div>
          <div class="mt-1.5 flex items-center justify-end">
            <Show
              when={props.discussion.unread}
              fallback={<Badge>{props.discussion.comments + 1}</Badge>}
            >
              <Tooltip text={`${props.discussion.unread} unread`}>
                <Badge theme="amber" variant="solid" size="sm">
                  {props.discussion.unread}
                </Badge>
              </Tooltip>
            </Show>
          </div>
        </div>
      </ListCell>
    </ListRow>
  )
}

export function DiscussionsMobile(props: {
  store: ReturnType<typeof createDiscussions>
  space: () => string
  setSpace: (value: string) => void
  onOpenSettings: () => void
}): JSX.Element {
  const [tab, setTab] = createSignal('home')
  const [showSpaces, setShowSpaces] = createSignal(false)
  const activeSpace = () => props.space()
  const setActiveSpace = (value: string) => props.setSpace(value)
  const discussions = untrack(() => props.store)
  const rows = createMemo(() =>
    discussions
      .rows()
      .filter((post) => tab() !== 'notifications' || post.unread > 0),
  )

  const selectSpace = (name: string) => {
    setActiveSpace(name)
    setShowSpaces(false)
  }

  return (
    <>
      <div
        inert={
          discussions.creating() ||
          Boolean(discussions.current()) ||
          showSpaces()
        }
      >
        <MobileShell
          header={
            <PageHeaderMobile
              title={
                tab() === 'home'
                  ? activeSpace()
                  : tab() === 'search'
                    ? 'Search'
                    : tab() === 'notifications'
                      ? 'Notifications'
                      : 'Your profile'
              }
              prefix={
                <Button
                  variant="ghost"
                  icon="lucide-panel-left"
                  aria-label="Spaces"
                  onClick={() => setShowSpaces(true)}
                />
              }
              suffix={
                <div class="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    icon="lucide-square-pen"
                    aria-label="New discussion"
                    onClick={discussions.start}
                  />
                  {/* Not part of the recipe: `/mobile` is a route of this
                  playground, and a `MobileShell` covers the viewport, so the
                  page needs its own way back to the showcase. */}
                  <a
                    href="/"
                    aria-label="Back to playground"
                    class="grid size-8 shrink-0 place-items-center rounded-4 text-ink-gray-7 transition-colors hover:bg-surface-gray-3"
                  >
                    <Icon icon="lucide-house" class="size-5" />
                  </a>
                </div>
              }
            />
          }
          nav={
            <MobileNav aria-label="Primary">
              <MobileNavItem
                label="Home"
                icon="lucide-house"
                active={tab() === 'home'}
                onClick={() => setTab('home')}
              />
              <MobileNavItem
                label="Notifications"
                icon="lucide-bell"
                active={tab() === 'notifications'}
                onClick={() => setTab('notifications')}
              />
              <MobileNavItem
                label="Search"
                icon="lucide-search"
                active={tab() === 'search'}
                onClick={() => setTab('search')}
              />
              <MobileNavItem
                label="You"
                active={tab() === 'you'}
                onClick={() => setTab('you')}
              >
                <Avatar
                  label="Rhea Kapoor"
                  size="md"
                  class={tab() === 'you' ? 'ring-2 ring-outline-gray-4' : ''}
                />
              </MobileNavItem>
            </MobileNav>
          }
        >
          <div class="px-2 pt-3 pb-6">
            <Show
              when={tab() === 'you'}
              fallback={
                <>
                  <Show when={tab() === 'search'}>
                    <div class="px-2 pb-4">
                      <TextInput
                        label="Search discussions"
                        value={discussions.query()}
                        onInput={(event) =>
                          discussions.setQuery(event.currentTarget.value)
                        }
                      />
                      <p
                        role="status"
                        class="mt-2 text-caption text-ink-gray-7"
                      >
                        {rows().length}{' '}
                        {rows().length === 1 ? 'result' : 'results'}
                      </p>
                    </div>
                  </Show>
                  <Show when={tab() === 'notifications'}>
                    <div class="mb-3 px-2">
                      <Button variant="outline" onClick={discussions.markRead}>
                        Mark all as read
                      </Button>
                    </div>
                  </Show>
                  <List>
                    <For each={rows()}>
                      {(discussion) => (
                        <DiscussionRow
                          discussion={discussion}
                          title={
                            discussion.unread ? 'text-lg-semibold' : 'text-lg'
                          }
                          showReplyIcon
                          onOpen={() => discussions.open(discussion)}
                        />
                      )}
                    </For>
                  </List>
                  <Show when={!rows().length}>
                    <p class="p-4 text-ink-gray-7">
                      No discussions match this space and filter.
                    </p>
                  </Show>
                </>
              }
            >
              <section class="p-4">
                <Avatar label="Rhea Kapoor" size="2xl" />
                <h1 class="mt-4 text-section">Rhea Kapoor</h1>
                <p class="mt-2 text-ink-gray-7">
                  Product designer · Design workspace
                </p>
                <Button variant="ghost" onClick={() => props.onOpenSettings()}>
                  Manage workspace settings{' '}
                  <span
                    aria-hidden="true"
                    class="lucide-arrow-right inline-block size-4 align-middle"
                  />
                </Button>
              </section>
            </Show>
          </div>

          <BottomSheet
            open={showSpaces()}
            title="Spaces"
            onOpenChange={setShowSpaces}
          >
            {/* The List's default `auto minmax(0,1fr) auto` columns lay out
            icon / label / count. */}
            <List class="px-2 pb-4">
              <For each={SPACES}>
                {(space) => (
                  <ListRow
                    height="h-11"
                    class="rounded-5"
                    active={activeSpace() === space.name}
                    onClick={() => selectSpace(space.name)}
                  >
                    <ListCell>
                      <Icon
                        icon={space.icon}
                        class="size-5 shrink-0 text-ink-gray-6"
                      />
                    </ListCell>
                    <ListCell>
                      <span class="truncate text-lg text-ink-gray-8">
                        {space.name}
                      </span>
                    </ListCell>
                    <ListCell class="justify-end">
                      <Show when={space.unread}>
                        <Badge>{space.unread}</Badge>
                      </Show>
                    </ListCell>
                  </ListRow>
                )}
              </For>
            </List>
          </BottomSheet>
        </MobileShell>
      </div>
      <DiscussionDialogs store={discussions} />
    </>
  )
}
