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
  Tooltip,
} from '@newui/ui'
import { createSignal, For, type JSX, Show } from 'solid-js'

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

interface Discussion {
  title: string
  author: string
  image: string
  excerpt: string
  comments: number
  lastActivity: string
  unread: number
}

const PINNED: Discussion[] = [
  {
    title: 'Welcome! Start here',
    author: 'Rhea Kapoor',
    image: 'https://i.pravatar.cc/150?img=1',
    excerpt: 'House rules, useful links, and how we work asynchronously.',
    comments: 42,
    lastActivity: '1w',
    unread: 0,
  },
]

const DISCUSSIONS: Discussion[] = [
  {
    title: 'Design review: new onboarding flow',
    author: 'Evan You',
    image: 'https://i.pravatar.cc/150?img=5',
    excerpt: 'I went through the latest prototype and left comments…',
    comments: 14,
    lastActivity: '2h',
    unread: 3,
  },
  {
    title: 'Proposal: consolidate icon sizes to a 4px grid',
    author: 'Priya Nair',
    image: 'https://i.pravatar.cc/150?img=9',
    excerpt: 'We currently ship icons in 7 sizes. I propose we standardize…',
    comments: 32,
    lastActivity: '5h',
    unread: 1,
  },
  {
    title: 'Dark mode tokens are ready for review',
    author: 'Sam Rivera',
    image: 'https://i.pravatar.cc/150?img=14',
    excerpt: 'All semantic tokens now have dark values. The contrast checks…',
    comments: 21,
    lastActivity: '1d',
    unread: 5,
  },
  {
    title: 'Q3 roadmap discussion',
    author: 'Ana Costa',
    image: 'https://i.pravatar.cc/150?img=20',
    excerpt: 'Carrying over from the planning call — here are the themes…',
    comments: 8,
    lastActivity: '2d',
    unread: 0,
  },
  {
    title: 'Weekly design crit — notes and action items',
    author: 'Maya Iyer',
    image: 'https://i.pravatar.cc/150?img=27',
    excerpt: 'Thanks everyone for joining. Summary of the feedback…',
    comments: 5,
    lastActivity: '3d',
    unread: 0,
  },
]

/** One discussion row — pinned and feed rows share the anatomy. */
function DiscussionRow(props: {
  discussion: Discussion
  title: string
  showReplyIcon: boolean
}): JSX.Element {
  return (
    <ListRow height="h-17">
      <ListCell>
        <Avatar
          image={props.discussion.image}
          label={props.discussion.author}
          size="2xl"
        />
      </ListCell>
      <ListCell>
        <div class="min-w-0 flex-1">
          {/* The sized text sits in an inner span so it keeps its own
              line-height; `leading-none` with `truncate` would shear off
              descenders like the tail of "g". */}
          <div class="truncate leading-none text-ink-gray-8">
            <span class={props.title}>{props.discussion.title}</span>
          </div>
          <div class="mt-1.5 flex min-w-0 items-center text-md text-ink-gray-5">
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
          <div class="text-right text-sm whitespace-nowrap text-ink-gray-5">
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

export function MobileApp(): JSX.Element {
  const [tab, setTab] = createSignal('home')
  const [showSpaces, setShowSpaces] = createSignal(false)
  const [activeSpace, setActiveSpace] = createSignal('Design System')

  const selectSpace = (name: string) => {
    setActiveSpace(name)
    setShowSpaces(false)
  }

  return (
    <MobileShell
      header={
        <PageHeaderMobile
          title="Home"
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
              image="https://i.pravatar.cc/150?img=1"
              label="Rhea Kapoor"
              size="md"
              class={tab() === 'you' ? 'ring-2 ring-outline-gray-4' : ''}
            />
          </MobileNavItem>
        </MobileNav>
      }
    >
      <div class="pt-3 pb-6">
        <div class="mb-5">
          <div class="mb-2 flex items-center gap-1 px-4">
            <Icon icon="lucide-pin" class="size-4 text-ink-gray-4" />
            <span class="text-base text-ink-gray-8">Pinned</span>
          </div>
          <List>
            <For each={PINNED}>
              {(discussion) => (
                <DiscussionRow
                  discussion={discussion}
                  title="text-lg"
                  showReplyIcon={false}
                />
              )}
            </For>
          </List>
        </div>

        <List>
          <For each={DISCUSSIONS}>
            {(discussion) => (
              <DiscussionRow
                discussion={discussion}
                title={discussion.unread ? 'text-lg-semibold' : 'text-lg'}
                showReplyIcon
              />
            )}
          </For>
        </List>
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
                    class="size-5 shrink-0 text-ink-gray-5"
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
  )
}
