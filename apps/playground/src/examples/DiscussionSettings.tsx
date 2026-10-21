import { Avatar, Button, Icon, Switch, Textarea, TextInput } from '@newui/atoms'
import { Dialog, List, ListCell, ListRow, Select } from '@newui/molecules'
import { SettingsDialog } from '@newui/organisms'
import { createEffect, createSignal, For, type JSX, Show } from 'solid-js'
import { colorScheme, setColorScheme } from '../shell/theme'
import { Notice } from './Notice'

const MANAGED_COMMUNITIES = [
  {
    name: 'Design',
    spaces: 7,
    members: 18,
  },
  {
    name: 'Engineering',
    spaces: 12,
    members: 34,
  },
  {
    name: 'Marketing',
    spaces: 5,
    members: 11,
  },
]

const MEMBERS = [
  {
    name: 'Rhea Kapoor',
    email: 'rhea@example.com',
    role: 'Admin',
  },
  {
    name: 'Evan You',
    email: 'evan@example.com',
    role: 'Member',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'Member',
  },
  {
    name: 'Sam Rivera',
    email: 'sam@example.com',
    role: 'Guest',
  },
]

const CUSTOM_EMOJIS = ['🎉', '🚀', '👀', '💡', '✅', '🔥']

export function DiscussionSettings(props: {
  open: boolean
  section?: string
  onOpenChange: (open: boolean) => void
}): JSX.Element {
  const [settingsTab, setSettingsTab] = createSignal('profile')
  createEffect(() => {
    if (props.section) setSettingsTab(props.section)
  })

  const [firstName, setFirstName] = createSignal('Rhea')
  const [lastName, setLastName] = createSignal('Kapoor')
  const [bio, setBio] = createSignal(
    'Product designer. I care about type scales and empty states.',
  )
  const fullName = () => `${firstName()} ${lastName()}`.trim()

  const theme = colorScheme
  const setTheme = (value: string) =>
    setColorScheme(value === 'light' || value === 'dark' ? value : 'system')
  const [badgeStyle, setBadgeStyle] = createSignal('Unread count')
  const [hideInactiveSpaces, setHideInactiveSpaces] = createSignal(false)
  const [emailDigest, setEmailDigest] = createSignal(true)
  const [digestFrequency, setDigestFrequency] = createSignal('Weekly')

  const [communities, setCommunities] = createSignal(MANAGED_COMMUNITIES)
  const [members, setMembers] = createSignal(MEMBERS)
  const [action, setAction] = createSignal('')
  const [name, setName] = createSignal('')
  const [target, setTarget] = createSignal('')
  const [role, setRole] = createSignal('Member')
  const [notice, setNotice] = createSignal('')
  const [error, setError] = createSignal('')
  function start(kind: string, value = '') {
    setAction(kind)
    setName(value)
    setTarget(value)
    setError('')
  }
  function save() {
    if (action() === 'new-community' || action() === 'community') {
      if (name().trim().length < 3) {
        setError('Enter a name with at least 3 characters.')
        return
      }
      if (action() === 'new-community')
        setCommunities((previous) => [
          ...previous,
          { name: name().trim(), spaces: 0, members: 1 },
        ])
      else
        setCommunities((previous) =>
          previous.map((item) =>
            item.name === target() ? { ...item, name: name().trim() } : item,
          ),
        )
      setNotice(`Saved community ${name().trim()}.`)
    } else if (action() === 'member') {
      setMembers((previous) =>
        previous.map((member) =>
          member.email === target() ? { ...member, role: role() } : member,
        ),
      )
      setNotice('Member role updated locally.')
    } else if (action() === 'customize') {
      setBio(name())
      setNotice('Profile bio updated locally.')
    }
    setAction('')
  }
  return (
    <>
      {' '}
      <SettingsDialog.Root
        open={props.open}
        onOpenChange={props.onOpenChange}
        value={settingsTab()}
        onValueChange={setSettingsTab}
      >
        <SettingsDialog.Sidebar>
          <SettingsDialog.NavGroup label="User settings">
            <SettingsDialog.NavItem
              value="profile"
              prefix={<Avatar size="xs" label={fullName()} class="shrink-0" />}
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
          <Show when={notice()}>
            <div class="m-4">
              <Notice text={notice()} onDismiss={() => setNotice('')} />
            </div>
          </Show>
          <SettingsDialog.Panel value="profile">
            <SettingsDialog.Header title="Profile" />
            <SettingsDialog.Body>
              <div class="flex flex-col gap-11 pt-6">
                <section class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <Avatar label={fullName()} class="size-16" />
                    <div>
                      <div class="text-base-medium text-ink-gray-8">
                        Profile picture
                      </div>
                      <p class="text-p-sm text-ink-gray-7">
                        Helps people recognise you
                      </p>
                    </div>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2">
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
                        <Button
                          iconLeft="lucide-user"
                          onClick={() => start('profile')}
                        >
                          View
                        </Button>
                        <Button
                          iconLeft="lucide-layout-dashboard"
                          onClick={() => start('customize', bio())}
                        >
                          Customize
                        </Button>
                      </div>
                    </SettingsDialog.Row>
                    <SettingsDialog.Row
                      title="Password"
                      description="Manage password and account access"
                    >
                      <Button onClick={() => start('password')}>
                        Update Password
                      </Button>
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
                        value={theme()}
                        onValueChange={(value) => setTheme(value ?? 'system')}
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
                        value={badgeStyle()}
                        onValueChange={(value) =>
                          setBadgeStyle(value ?? 'Unread count')
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
                          value={digestFrequency()}
                          onValueChange={(value) =>
                            setDigestFrequency(value ?? 'Weekly')
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
              actions={
                <Button
                  iconLeft="lucide-plus"
                  onClick={() => start('new-community')}
                >
                  New community
                </Button>
              }
            />
            <SettingsDialog.Body>
              <List class="-mx-3 pt-4">
                <For each={communities()}>
                  {(item) => (
                    <ListRow height="h-14">
                      <ListCell>
                        <Avatar label={item.name} size="xl" shape="square" />
                      </ListCell>
                      <ListCell>
                        <div class="min-w-0">
                          <div class="truncate text-base text-ink-gray-8">
                            {item.name}
                          </div>
                          <div class="mt-0.5 truncate text-sm text-ink-gray-7">
                            {item.spaces} spaces · {item.members} members
                          </div>
                        </div>
                      </ListCell>
                      <ListCell class="justify-end">
                        <Button
                          variant="ghost"
                          icon="lucide-ellipsis"
                          aria-label={`Community options for ${item.name}`}
                          onClick={() => start('community', item.name)}
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
                    <span class="text-sm text-ink-gray-7">Member</span>
                  </ListCell>
                  <ListCell>
                    <span class="text-sm text-ink-gray-7">Role</span>
                  </ListCell>
                  <ListCell />
                </ListRow>
                <For each={members()}>
                  {(member) => (
                    <ListRow height="h-14">
                      <ListCell>
                        <Avatar label={member.name} size="xl" />
                        <div class="ms-3 min-w-0">
                          <div class="truncate text-base text-ink-gray-8">
                            {member.name}
                          </div>
                          <div class="mt-0.5 truncate text-sm text-ink-gray-7">
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
                          aria-label={`Member options for ${member.name}`}
                          onClick={() => {
                            start('member', member.email)
                            setRole(member.role)
                          }}
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
      <Dialog.Root
        open={!!action()}
        onOpenChange={(value) => {
          if (!value) setAction('')
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {action() === 'new-community'
                ? 'New community'
                : action() === 'community'
                  ? 'Manage community'
                  : action() === 'member'
                    ? 'Manage member'
                    : action() === 'password'
                      ? 'Account security'
                      : 'Public profile'}
            </Dialog.Title>
          </Dialog.Header>
          <Show when={action() === 'profile'}>
            <div class="my-4">
              <Avatar label={fullName()} size="2xl" />
              <h2 class="mt-3 text-section">{fullName()}</h2>
              <p class="mt-3">{bio()}</p>
            </div>
          </Show>
          <Show when={action() === 'password'}>
            <p class="my-4 text-ink-gray-7">
              Password changes require an authentication service. This local
              example has no connected account and does not store passwords.
            </p>
          </Show>
          <Show
            when={[
              'new-community',
              'community',
              'member',
              'customize',
            ].includes(action())}
          >
            <form
              class="my-4 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                save()
              }}
            >
              <Show
                when={action() !== 'member'}
                fallback={
                  <Select
                    label="Member role"
                    value={role()}
                    options={['Admin', 'Member', 'Guest'].map((value) => ({
                      value,
                      label: value,
                    }))}
                    onValueChange={(value) => setRole(value ?? 'Member')}
                  />
                }
              >
                <TextInput
                  label={
                    action() === 'customize' ? 'Profile bio' : 'Community name'
                  }
                  value={name()}
                  onInput={(event) => setName(event.currentTarget.value)}
                  error={error()}
                />
              </Show>
              <Button type="submit" variant="solid" theme="blue">
                Save local changes
              </Button>
              <Show when={action() === 'community' || action() === 'member'}>
                <Button
                  theme="red"
                  onClick={() => {
                    if (action() === 'community')
                      setCommunities((previous) =>
                        previous.filter((item) => item.name !== target()),
                      )
                    else
                      setMembers((previous) =>
                        previous.filter((member) => member.email !== target()),
                      )
                    setNotice('Removed locally.')
                    setAction('')
                  }}
                >
                  {action() === 'community'
                    ? 'Archive community'
                    : 'Remove member'}
                </Button>
              </Show>
            </form>
          </Show>
          <Button onClick={() => setAction('')}>Close account action</Button>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
