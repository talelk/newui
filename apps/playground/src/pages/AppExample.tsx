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
  Select,
  SettingsDialog,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarRailItem,
  Switch,
  TabButtons,
  Textarea,
  TextInput,
  Tooltip,
} from '@newui/ui'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'

/**
 * The flagship example: a desktop app screen composed from the shell, the
 * sidebar, a page header, the list family and the settings dialog — a port of
 * frappe-ui's `docs/components/recipes/DiscussionsDesktop.vue`, data included.
 *
 * Two deliberate differences from the reference, both about being a section of
 * a scrolling playground rather than a route of its own: the shell is framed at
 * a fixed height instead of `h-screen`, and the sidebar `ScrollArea` sits inside
 * that frame. Everything else — the rail badges and account menu, the space
 * list, the feed tabs, the row anatomy and all six settings panels — follows the
 * reference markup.
 */

interface Community {
  id: string
  name: string
  unread?: number
  image: string
}

const COMMUNITIES: Community[] = [
  { id: 'design', name: 'Design', image: 'https://i.pravatar.cc/150?img=12' },
  {
    id: 'engineering',
    name: 'Engineering',
    unread: 4,
    image: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    image: 'https://i.pravatar.cc/150?img=47',
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

interface Discussion {
  title: string
  author: string
  image: string
  excerpt: string
  comments: number
  lastActivity: string
  unread: number
}

const DISCUSSIONS: Discussion[] = [
  {
    title: 'Design review: new onboarding flow',
    author: 'Evan You',
    image: 'https://i.pravatar.cc/150?img=5',
    excerpt:
      'I went through the latest prototype and left comments on the empty states…',
    comments: 14,
    lastActivity: '2h',
    unread: 3,
  },
  {
    title: 'Proposal: consolidate icon sizes to a 4px grid',
    author: 'Priya Nair',
    image: 'https://i.pravatar.cc/150?img=9',
    excerpt:
      'We currently ship icons in 7 sizes. I propose we standardize on 16 / 20 / 24…',
    comments: 32,
    lastActivity: '5h',
    unread: 1,
  },
  {
    title: 'Dark mode tokens are ready for review',
    author: 'Sam Rivera',
    image: 'https://i.pravatar.cc/150?img=14',
    excerpt:
      'All semantic tokens now have dark values. The contrast checks pass except…',
    comments: 21,
    lastActivity: '1d',
    unread: 5,
  },
  {
    title: 'Q3 roadmap discussion',
    author: 'Ana Costa',
    image: 'https://i.pravatar.cc/150?img=20',
    excerpt:
      'Carrying over from the planning call — here are the three themes we agreed on…',
    comments: 8,
    lastActivity: '2d',
    unread: 0,
  },
  {
    title: 'Weekly design crit — notes and action items',
    author: 'Maya Iyer',
    image: 'https://i.pravatar.cc/150?img=27',
    excerpt:
      'Thanks everyone for joining. Summary of the feedback on the settings redesign…',
    comments: 5,
    lastActivity: '3d',
    unread: 0,
  },
  {
    title: 'Rethinking the empty state illustrations',
    author: 'Leo Martins',
    image: 'https://i.pravatar.cc/150?img=33',
    excerpt:
      'The current set feels dated. I sketched a lighter, more geometric direction…',
    comments: 17,
    lastActivity: '4h',
    unread: 2,
  },
  {
    title: 'Naming convention for spacing tokens',
    author: 'Nadia Haddad',
    image: 'https://i.pravatar.cc/150?img=40',
    excerpt:
      'Are we going with t-shirt sizes or numeric steps? Both have tradeoffs for…',
    comments: 26,
    lastActivity: '6h',
    unread: 4,
  },
  {
    title: 'Accessibility audit results are in',
    author: 'Tom Becker',
    image: 'https://i.pravatar.cc/150?img=47',
    excerpt:
      'We failed 6 of the WCAG AA checks, mostly around focus visibility and…',
    comments: 41,
    lastActivity: '8h',
    unread: 7,
  },
  {
    title: 'Should tooltips have a max width?',
    author: 'Yuki Tanaka',
    image: 'https://i.pravatar.cc/150?img=53',
    excerpt:
      'Long labels wrap awkwardly right now. I think capping at 240px reads better…',
    comments: 9,
    lastActivity: '10h',
    unread: 0,
  },
  {
    title: 'Migrating buttons to the new variant API',
    author: 'Chris Doyle',
    image: 'https://i.pravatar.cc/150?img=60',
    excerpt:
      'Codemod is ready. It covers ~90% of call sites; the rest need a manual pass…',
    comments: 18,
    lastActivity: '12h',
    unread: 1,
  },
  {
    title: 'Feedback wanted: revised color ramp',
    author: 'Isabel Ortiz',
    image: 'https://i.pravatar.cc/150?img=64',
    excerpt:
      'Bumped the mid-tones for better contrast. Take a look at gray-5 through 7…',
    comments: 23,
    lastActivity: '1d',
    unread: 0,
  },
  {
    title: 'Motion guidelines — first draft',
    author: 'Omar Farouk',
    image: 'https://i.pravatar.cc/150?img=68',
    excerpt:
      'Durations, easing curves, and when not to animate. Would love a sanity check…',
    comments: 12,
    lastActivity: '1d',
    unread: 3,
  },
]

const SPACE_ACTIONS = [
  { label: 'Copy link', value: 'copy-link', icon: 'lucide-link' },
  { label: 'Mark all as read', value: 'mark-read', icon: 'lucide-check' },
  { label: 'Manage access', value: 'manage-access', icon: 'lucide-users' },
  { label: 'Archive', value: 'archive', icon: 'lucide-archive' },
]

const USER_IMAGE = 'https://i.pravatar.cc/150?img=3'

const MANAGED_COMMUNITIES = [
  {
    name: 'Design',
    spaces: 7,
    members: 18,
    image: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Engineering',
    spaces: 12,
    members: 34,
    image: 'https://i.pravatar.cc/150?img=40',
  },
  {
    name: 'Marketing',
    spaces: 5,
    members: 11,
    image: 'https://i.pravatar.cc/150?img=47',
  },
]

const MEMBERS = [
  {
    name: 'Rhea Kapoor',
    email: 'rhea@example.com',
    role: 'Admin',
    image: 'https://i.pravatar.cc/150?img=53',
  },
  {
    name: 'Evan You',
    email: 'evan@example.com',
    role: 'Member',
    image: 'https://i.pravatar.cc/150?img=60',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'Member',
    image: 'https://i.pravatar.cc/150?img=64',
  },
  {
    name: 'Sam Rivera',
    email: 'sam@example.com',
    role: 'Guest',
    image: 'https://i.pravatar.cc/150?img=68',
  },
]

const CUSTOM_EMOJIS = ['🎉', '🚀', '👀', '💡', '✅', '🔥']

/** Icon-only action menu for the page header — dots trigger, no chevron. */
function SpaceActionsMenu(): JSX.Element {
  return (
    <Menu.Root>
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
function AccountMenu(props: { onOpenSettings: () => void }): JSX.Element {
  return (
    <Menu.Root
      onSelect={(value) => {
        if (value === 'settings') props.onOpenSettings()
      }}
    >
      <Menu.Trigger
        aria-label="Account"
        class="flex size-7 items-center justify-center rounded-full transition focus-visible:ring-0 focus-visible:focus-ring hover:opacity-90"
      >
        <Avatar
          image={USER_IMAGE}
          label="Rhea Kapoor"
          size="lg"
          class="size-7"
        />
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

export function AppExample(): JSX.Element {
  const [community, setCommunity] = createSignal('design')
  const [space, setSpace] = createSignal('Design System')
  const [feedTab, setFeedTab] = createSignal('All')

  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [settingsTab, setSettingsTab] = createSignal('profile')

  const [firstName, setFirstName] = createSignal('Rhea')
  const [lastName, setLastName] = createSignal('Kapoor')
  const [bio, setBio] = createSignal(
    'Product designer. I care about type scales and empty states.',
  )
  const fullName = () => `${firstName()} ${lastName()}`.trim()

  const [theme, setTheme] = createSignal('system')
  const [badgeStyle, setBadgeStyle] = createSignal('Unread count')
  const [hideInactiveSpaces, setHideInactiveSpaces] = createSignal(false)
  const [emailDigest, setEmailDigest] = createSignal(true)
  const [digestFrequency, setDigestFrequency] = createSignal('Weekly')

  const visibleDiscussions = createMemo(() =>
    feedTab() === 'Unread'
      ? DISCUSSIONS.filter((discussion) => discussion.unread > 0)
      : DISCUSSIONS,
  )

  return (
    <div class="h-[620px] overflow-hidden rounded-6 border border-outline-gray-1 shadow-md">
      <AppShell
        rail={
          <SidebarRail class="border-r border-outline-gray-1">
            {/* The logo fills the whole cell and carries no tooltip of its own. */}
            <a
              href="#example"
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
                    active={community() === item.id}
                    badge={item.unread}
                    badgeStyle="count"
                    onClick={() => setCommunity(item.id)}
                  >
                    <Avatar
                      image={item.image}
                      label={item.name}
                      size="lg"
                      shape="square"
                      class="size-7"
                    />
                  </SidebarRailItem>
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
              />
              <SidebarRailItem
                label="Settings"
                variant="ghost"
                icon="lucide-settings"
                onClick={() => setSettingsOpen(true)}
              />
              <AccountMenu onOpenSettings={() => setSettingsOpen(true)} />
            </div>
          </SidebarRail>
        }
        sidebar={
          <Sidebar width="14rem" class="border-r border-outline-gray-1">
            {/* No logo here: the rail already shows the active community's
                avatar, so a header logo would just duplicate it. */}
            <SidebarHeader
              title="Design"
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
                    aria-label="Sort spaces"
                  />
                </div>

                <div class="mt-0.5 flex flex-col gap-0.5">
                  <For each={SPACES}>
                    {(item) => (
                      <SidebarItem
                        active={space() === item.name}
                        prefix={<Icon icon={item.icon} class="size-4" />}
                        onClick={() => setSpace(item.name)}
                        suffix={
                          <Show when={item.unread}>
                            <span class="grid size-4 place-content-center text-xs text-ink-gray-5">
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
        <PageHeader>
          <div class="flex items-center gap-1">
            <PageHeaderTitle>{space()}</PageHeaderTitle>
            <SpaceActionsMenu />
          </div>
          <Button variant="solid" iconLeft="lucide-plus">
            Add new
          </Button>
        </PageHeader>

        <PageBody>
          <div class="mb-4 flex items-center justify-between">
            <TabButtons
              value={feedTab()}
              onValueChange={setFeedTab}
              options={[
                { label: 'Unread', value: 'Unread' },
                { label: 'All', value: 'All' },
              ]}
            />
            <span class="text-sm text-ink-gray-5">
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
                    <Avatar
                      image={discussion.image}
                      label={discussion.author}
                      size="2xl"
                    />
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
                          {discussion.title}
                        </span>
                      </div>
                      <div class="mt-1.5 flex min-w-0 items-center text-base text-ink-gray-5">
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
                      <div class="text-right text-sm whitespace-nowrap text-ink-gray-5">
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
        </PageBody>
      </AppShell>

      <SettingsDialog.Root
        open={settingsOpen()}
        onOpenChange={setSettingsOpen}
        value={settingsTab()}
        onValueChange={setSettingsTab}
      >
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavGroup label="User settings">
            <SettingsDialog.NavItem
              value="profile"
              prefix={
                <Avatar
                  size="xs"
                  image={USER_IMAGE}
                  label={fullName()}
                  class="shrink-0"
                />
              }
            >
              Profile
            </SettingsDialog.NavItem>
            <SettingsDialog.NavItem
              value="preferences"
              prefix={
                <Icon
                  icon="lucide-sliders-horizontal"
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              }
            >
              Preferences
            </SettingsDialog.NavItem>
            <SettingsDialog.NavItem
              value="notifications"
              prefix={
                <Icon
                  icon="lucide-bell"
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              }
            >
              Notifications
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
          <SettingsDialog.NavGroup label="App settings">
            <SettingsDialog.NavItem
              value="communities"
              prefix={
                <Icon
                  icon="lucide-building-2"
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              }
            >
              Communities
            </SettingsDialog.NavItem>
            <SettingsDialog.NavItem
              value="emojis"
              prefix={
                <Icon
                  icon="lucide-smile-plus"
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              }
            >
              Emojis
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
          <SettingsDialog.NavGroup label="Administration">
            <SettingsDialog.NavItem
              value="users"
              prefix={
                <Icon
                  icon="lucide-users"
                  class="size-4 shrink-0 text-ink-gray-6"
                />
              }
            >
              Users
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
        </SettingsDialog.Sidebar>

        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Header title="Profile" />
            <SettingsDialog.Body>
              <div class="flex flex-col gap-11 pt-6">
                <section class="flex flex-col gap-6">
                  <div class="flex items-center gap-4">
                    <Avatar
                      image={USER_IMAGE}
                      label={fullName()}
                      class="size-16"
                    />
                    <div>
                      <div class="text-base-medium text-ink-gray-8">
                        Profile picture
                      </div>
                      <p class="text-p-sm text-ink-gray-5">
                        Helps people recognise you
                      </p>
                    </div>
                  </div>

                  <div class="grid gap-6 sm:grid-cols-2">
                    <TextInput
                      label="First name"
                      class="w-full"
                      value={firstName()}
                      onInput={(event) =>
                        setFirstName(event.currentTarget.value)
                      }
                    />
                    <TextInput
                      label="Last name"
                      class="w-full"
                      value={lastName()}
                      onInput={(event) =>
                        setLastName(event.currentTarget.value)
                      }
                    />
                  </div>

                  <Textarea
                    label="Bio"
                    class="w-full"
                    value={bio()}
                    onInput={(event) => setBio(event.currentTarget.value)}
                  />
                </section>

                <section>
                  <h2 class="text-lg-semibold text-ink-gray-8">Account</h2>
                  <div class="mt-2 divide-y divide-outline-gray-1">
                    <SettingsDialog.Row
                      title="Public profile"
                      description="View your public page or customize its card layout"
                    >
                      <div class="flex gap-2">
                        <Button iconLeft="lucide-user">View</Button>
                        <Button iconLeft="lucide-layout-dashboard">
                          Customize
                        </Button>
                      </div>
                    </SettingsDialog.Row>
                    <SettingsDialog.Row
                      title="Password"
                      description="Manage password and account access"
                    >
                      <Button>Update Password</Button>
                    </SettingsDialog.Row>
                  </div>
                </section>
              </div>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="preferences">
            <SettingsDialog.Header title="Preferences" />
            <SettingsDialog.Body>
              <div class="flex flex-col gap-11 pt-6">
                <section>
                  <div class="divide-y divide-outline-gray-1">
                    <SettingsDialog.Row
                      title="Appearance"
                      description="Choose a light, dark, or system-matched interface"
                    >
                      <Select
                        value={[theme()]}
                        onValueChange={(value) =>
                          setTheme(value[0] ?? 'system')
                        }
                        options={[
                          { label: 'Light', value: 'light' },
                          { label: 'Dark', value: 'dark' },
                          { label: 'System Default', value: 'system' },
                        ]}
                      />
                    </SettingsDialog.Row>
                  </div>
                </section>

                <section>
                  <h2 class="text-lg-semibold text-ink-gray-8">Sidebar</h2>
                  <div class="mt-2 divide-y divide-outline-gray-1">
                    <SettingsDialog.Row
                      title="Unread badge"
                      description="Show unread activity as a dot or a count"
                    >
                      <Select
                        value={[badgeStyle()]}
                        onValueChange={(value) =>
                          setBadgeStyle(value[0] ?? 'Unread count')
                        }
                        options={[
                          { label: 'Dot', value: 'Dot' },
                          { label: 'Unread count', value: 'Unread count' },
                        ]}
                      />
                    </SettingsDialog.Row>
                    <SettingsDialog.Row
                      title="Inactive spaces"
                      description="Hide spaces with no activity for the last 2 months"
                    >
                      <Switch
                        checked={hideInactiveSpaces()}
                        onCheckedChange={setHideInactiveSpaces}
                      />
                    </SettingsDialog.Row>
                  </div>
                </section>
              </div>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="notifications">
            <SettingsDialog.Header title="Notifications" />
            <SettingsDialog.Body>
              <div class="flex flex-col gap-11 pt-6">
                <section>
                  <div class="divide-y divide-outline-gray-1">
                    <SettingsDialog.Row
                      title="Enable email digests"
                      description="Send a summary of missed activity"
                    >
                      <Switch
                        checked={emailDigest()}
                        onCheckedChange={setEmailDigest}
                      />
                    </SettingsDialog.Row>
                    <Show when={emailDigest()}>
                      <SettingsDialog.Row
                        title="Digest frequency"
                        description="Choose how often you receive your digest"
                      >
                        <Select
                          value={[digestFrequency()]}
                          onValueChange={(value) =>
                            setDigestFrequency(value[0] ?? 'Weekly')
                          }
                          options={[
                            { label: 'Weekly', value: 'Weekly' },
                            { label: 'Fortnightly', value: 'Fortnightly' },
                            { label: 'Monthly', value: 'Monthly' },
                          ]}
                        />
                      </SettingsDialog.Row>
                    </Show>
                  </div>
                </section>
              </div>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="communities">
            <SettingsDialog.Header
              title="Communities"
              actions={<Button iconLeft="lucide-plus">New community</Button>}
            />
            <SettingsDialog.Body>
              <List class="-mx-3 pt-4">
                <For each={MANAGED_COMMUNITIES}>
                  {(item) => (
                    <ListRow height="h-14">
                      <ListCell>
                        <Avatar
                          image={item.image}
                          label={item.name}
                          size="xl"
                          shape="square"
                        />
                      </ListCell>
                      <ListCell>
                        <div class="min-w-0">
                          <div class="truncate text-base text-ink-gray-8">
                            {item.name}
                          </div>
                          <div class="mt-0.5 truncate text-sm text-ink-gray-5">
                            {item.spaces} spaces · {item.members} members
                          </div>
                        </div>
                      </ListCell>
                      <ListCell class="justify-end">
                        <Button
                          variant="ghost"
                          icon="lucide-ellipsis"
                          aria-label="Community options"
                        />
                      </ListCell>
                    </ListRow>
                  )}
                </For>
              </List>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="emojis">
            <SettingsDialog.Header
              title="Emojis"
              description="Custom emojis are available to everyone in reactions"
            />
            <SettingsDialog.Body>
              <div class="flex flex-wrap gap-2 pt-6">
                <For each={CUSTOM_EMOJIS}>
                  {(emoji) => (
                    <div class="grid size-10 place-content-center rounded-6 border border-outline-gray-2 text-xl">
                      {emoji}
                    </div>
                  )}
                </For>
              </div>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="users">
            <SettingsDialog.Header title="Users" />
            <SettingsDialog.Body>
              <List class="-mx-3 pt-4" columns="minmax(0,1fr) 6rem 3rem">
                <ListRow height="h-14">
                  <ListCell>
                    <span class="text-sm text-ink-gray-6">Member</span>
                  </ListCell>
                  <ListCell>
                    <span class="text-sm text-ink-gray-6">Role</span>
                  </ListCell>
                  <ListCell />
                </ListRow>
                <For each={MEMBERS}>
                  {(member) => (
                    <ListRow height="h-14">
                      <ListCell>
                        <Avatar
                          image={member.image}
                          label={member.name}
                          size="xl"
                        />
                        <div class="ms-3 min-w-0">
                          <div class="truncate text-base text-ink-gray-8">
                            {member.name}
                          </div>
                          <div class="mt-0.5 truncate text-sm text-ink-gray-5">
                            {member.email}
                          </div>
                        </div>
                      </ListCell>
                      <ListCell>
                        <span class="text-base text-ink-gray-7">
                          {member.role}
                        </span>
                      </ListCell>
                      <ListCell class="justify-end">
                        <Button
                          variant="ghost"
                          icon="lucide-ellipsis"
                          aria-label="Member options"
                        />
                      </ListCell>
                    </ListRow>
                  )}
                </For>
              </List>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    </div>
  )
}
