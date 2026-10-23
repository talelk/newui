import { Avatar, Badge, Button, Switch, TextInput } from '@talelk/newui-atoms'
import { isEmail } from '@talelk/newui-data'
import {
  EmptyState,
  List,
  ListCell,
  ListRow,
  Menu,
  Select,
} from '@talelk/newui-molecules'
import { SettingsDialog } from '@talelk/newui-organisms'
import { createMemo, createSignal, For, type JSX, Show } from 'solid-js'
import { AppPage } from '../examples/AppPage'
import { Notice } from '../examples/Notice'
import { SettingsSummary } from './settings/SettingsSummary'
import {
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
  type MemberRole,
  NOTIFICATION_FREQUENCIES,
  type NotificationFrequency,
  type NotificationPreferences,
  type Profile,
  type WorkspaceMember,
} from './settings/settings-fixtures'

const INVITE_ROLES: { label: string; value: MemberRole }[] = [
  { label: 'Member', value: 'Member' },
  { label: 'Admin', value: 'Admin' },
]

export function Settings(): JSX.Element {
  const [open, setOpen] = createSignal(false)
  const [tab, setTab] = createSignal('profile')

  const [profile, setProfile] = createSignal<Profile>(INITIAL_PROFILE)
  const [name, setName] = createSignal(INITIAL_PROFILE.name)
  const [email, setEmail] = createSignal(INITIAL_PROFILE.email)
  const [profileAttempted, setProfileAttempted] = createSignal(false)
  const [profileNotice, setProfileNotice] = createSignal('')

  const [notifications, setNotifications] =
    createSignal<NotificationPreferences>(INITIAL_NOTIFICATIONS)
  const [digests, setDigests] = createSignal(INITIAL_NOTIFICATIONS.digests)
  const [frequency, setFrequency] = createSignal<NotificationFrequency>(
    INITIAL_NOTIFICATIONS.frequency,
  )
  const [productUpdates, setProductUpdates] = createSignal(
    INITIAL_NOTIFICATIONS.productUpdates,
  )
  const [mentions, setMentions] = createSignal(INITIAL_NOTIFICATIONS.mentions)
  const [notificationsNotice, setNotificationsNotice] = createSignal('')

  const [members, setMembers] = createSignal<WorkspaceMember[]>(INITIAL_MEMBERS)
  const [memberNotice, setMemberNotice] = createSignal('')
  const [memberNoticeTone, setMemberNoticeTone] = createSignal<'green' | 'red'>(
    'green',
  )
  const [removedMember, setRemovedMember] = createSignal<
    { member: WorkspaceMember; index: number } | undefined
  >()

  const [inviteOpen, setInviteOpen] = createSignal(false)
  const [inviteName, setInviteName] = createSignal('')
  const [inviteEmail, setInviteEmail] = createSignal('')
  const [inviteRole, setInviteRole] = createSignal<MemberRole>('Member')
  const [inviteAttempted, setInviteAttempted] = createSignal(false)

  const [pageNotice, setPageNotice] = createSignal('')
  let nextMemberId = 100

  const emailValid = () => isEmail(email().trim())
  const profileDirty = createMemo(
    () =>
      name().trim() !== profile().name || email().trim() !== profile().email,
  )
  const notificationsDirty = createMemo(
    () =>
      digests() !== notifications().digests ||
      frequency() !== notifications().frequency ||
      productUpdates() !== notifications().productUpdates ||
      mentions() !== notifications().mentions,
  )
  const hasUnsavedChanges = () =>
    profileDirty() ||
    notificationsDirty() ||
    (inviteOpen() &&
      (inviteName().trim() !== '' || inviteEmail().trim() !== ''))

  const memberCount = () => members().length + 1
  const directoryNames = () => [
    profile().name,
    ...members().map((member) => member.name),
  ]
  const memberSummary = () => {
    const names = directoryNames()
    const [first, second] = names
    if (!first) return 'No members yet'
    if (!second) return first
    return names.length === 2
      ? `${first} and ${second}`
      : `${first}, ${second} and ${names.length - 2} more`
  }

  const inviteEmailTaken = () => {
    const value = inviteEmail().trim().toLowerCase()
    if (!value) return false
    return (
      value === profile().email.toLowerCase() ||
      members().some((member) => member.email.toLowerCase() === value)
    )
  }
  const inviteNameError = () =>
    inviteAttempted() && inviteName().trim().length < 2
      ? 'Enter a name.'
      : undefined
  const inviteEmailError = () => {
    if (!inviteAttempted()) return undefined
    if (!isEmail(inviteEmail().trim())) return 'Enter a valid email.'
    if (inviteEmailTaken()) return 'Already in this workspace.'
    return undefined
  }

  const openSettings = (value = 'profile') => {
    setPageNotice('')
    setTab(value)
    setOpen(true)
  }

  const resetProfileDraft = () => {
    setName(profile().name)
    setEmail(profile().email)
    setProfileAttempted(false)
    setProfileNotice('')
  }
  const resetNotificationsDraft = () => {
    setDigests(notifications().digests)
    setFrequency(notifications().frequency)
    setProductUpdates(notifications().productUpdates)
    setMentions(notifications().mentions)
    setNotificationsNotice('')
  }
  const resetInvite = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteRole('Member')
    setInviteAttempted(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true)
      return
    }
    const discarded = hasUnsavedChanges()
    resetProfileDraft()
    resetNotificationsDraft()
    resetInvite()
    setInviteOpen(false)
    setMemberNotice('')
    setRemovedMember(undefined)
    setPageNotice(
      discarded
        ? 'Settings closed without saving. Unsaved changes were discarded.'
        : '',
    )
    setOpen(false)
  }

  const saveProfile = () => {
    if (!profileDirty()) return
    setProfileAttempted(true)
    if (name().trim().length < 2 || !emailValid()) return
    const next = { name: name().trim(), email: email().trim() }
    setProfile(next)
    setName(next.name)
    setEmail(next.email)
    setProfileAttempted(false)
    setProfileNotice('Profile saved locally.')
  }

  const discardProfile = () => {
    resetProfileDraft()
  }

  const saveNotifications = () => {
    if (!notificationsDirty()) return
    setNotifications({
      digests: digests(),
      frequency: frequency(),
      productUpdates: productUpdates(),
      mentions: mentions(),
    })
    setNotificationsNotice('Notification preferences saved locally.')
  }

  const discardNotifications = () => {
    resetNotificationsDraft()
  }

  const announceMember = (
    text: string,
    tone: 'green' | 'red' = 'green',
    undo?: { member: WorkspaceMember; index: number },
  ) => {
    setMemberNoticeTone(tone)
    setMemberNotice(text)
    setRemovedMember(undo)
  }

  const copyEmail = (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      announceMember('Copy is unavailable in this browser.', 'red')
      return
    }
    void navigator.clipboard
      .writeText(value)
      .then(() => announceMember('Email copied.'))
      .catch(() => announceMember('Could not copy the email.', 'red'))
  }

  const changeMemberRole = (member: WorkspaceMember, role: MemberRole) => {
    if (member.role === role) return
    setMembers((previous) =>
      previous.map((entry) =>
        entry.id === member.id ? { ...entry, role } : entry,
      ),
    )
    announceMember(
      `${member.name} is now ${role === 'Admin' ? 'an admin' : 'a member'}.`,
    )
  }

  const removeMember = (member: WorkspaceMember) => {
    const index = members().findIndex((entry) => entry.id === member.id)
    if (index < 0) return
    setMembers((previous) => previous.filter((entry) => entry.id !== member.id))
    announceMember(`${member.name} was removed.`, 'green', { member, index })
  }

  const undoRemove = () => {
    const removed = removedMember()
    if (!removed) return
    setMembers((previous) => {
      const next = [...previous]
      next.splice(Math.min(removed.index, next.length), 0, removed.member)
      return next
    })
    announceMember('Member restored.')
  }

  const handleMemberAction = (member: WorkspaceMember, value: string) => {
    if (value === 'copy') copyEmail(member.email)
    else if (value === 'admin') changeMemberRole(member, 'Admin')
    else if (value === 'member') changeMemberRole(member, 'Member')
    else if (value === 'remove') removeMember(member)
  }

  const toggleInvite = () => {
    const next = !inviteOpen()
    setInviteOpen(next)
    if (!next) resetInvite()
  }

  const addMember = () => {
    setInviteAttempted(true)
    if (
      inviteName().trim().length < 2 ||
      !isEmail(inviteEmail().trim()) ||
      inviteEmailTaken()
    )
      return
    const member: WorkspaceMember = {
      id: `member-${nextMemberId++}`,
      name: inviteName().trim(),
      email: inviteEmail().trim(),
      role: inviteRole(),
    }
    setMembers((previous) => [...previous, member])
    setInviteOpen(false)
    resetInvite()
    announceMember(`${member.name} was added to the workspace.`)
  }

  return (
    <AppPage
      title="Workspace settings"
      section="Settings"
      description="Manage your profile, what reaches your inbox, and who works in this workspace."
      actions={
        <Button
          variant="solid"
          theme="blue"
          iconLeft="lucide-settings-2"
          onClick={() => openSettings('profile')}
        >
          Open settings
        </Button>
      }
    >
      <Notice
        text={pageNotice()}
        tone="blue"
        onDismiss={() => setPageNotice('')}
      />

      <SettingsSummary
        name={profile().name}
        email={profile().email}
        notifications={notifications()}
        memberNames={directoryNames()}
        memberCount={memberCount()}
        memberSummary={memberSummary()}
        onEditProfile={() => openSettings('profile')}
        onEditNotifications={() => openSettings('notifications')}
        onManageMembers={() => openSettings('members')}
      />

      <SettingsDialog.Root
        open={open()}
        onOpenChange={handleOpenChange}
        value={tab()}
        onValueChange={setTab}
        title="Workspace settings"
        description="Edit your profile, notifications and workspace members."
        class="max-sm:fixed max-sm:inset-0 sm:w-[min(56rem,calc(100vw-2rem))]"
      >
        <SettingsDialog.Sidebar label="Workspace settings">
          <SettingsDialog.NavGroup label="User settings">
            <SettingsDialog.NavItem
              value="profile"
              prefix={<Avatar size="xs" label={profile().name} />}
              suffix={
                profileDirty() ? (
                  <span
                    class="block size-1.5 rounded-full bg-surface-amber-9"
                    aria-hidden="true"
                  />
                ) : undefined
              }
            >
              Profile
            </SettingsDialog.NavItem>
            <SettingsDialog.NavItem
              value="notifications"
              suffix={
                notificationsDirty() ? (
                  <span
                    class="block size-1.5 rounded-full bg-surface-amber-9"
                    aria-hidden="true"
                  />
                ) : undefined
              }
            >
              Notifications
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
          <SettingsDialog.NavGroup label="Workspace">
            <SettingsDialog.NavItem value="members">
              Members
            </SettingsDialog.NavItem>
          </SettingsDialog.NavGroup>
        </SettingsDialog.Sidebar>

        <SettingsDialog.Content>
          <SettingsDialog.Panel value="profile">
            <form
              noValidate
              class="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault()
                saveProfile()
              }}
            >
              <SettingsDialog.Header
                title="Profile"
                description={
                  profileDirty() ? (
                    <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-ink-amber-8">
                      <span
                        class="size-1.5 rounded-full bg-surface-amber-9"
                        aria-hidden="true"
                      />
                      Unsaved changes
                    </span>
                  ) : (
                    'How teammates see you.'
                  )
                }
                actions={
                  <>
                    <Show when={profileDirty()}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={discardProfile}
                      >
                        Discard
                      </Button>
                    </Show>
                    <Button
                      type="submit"
                      variant="solid"
                      theme="blue"
                      disabled={!profileDirty()}
                    >
                      Save profile
                    </Button>
                  </>
                }
              />
              <SettingsDialog.Body>
                <SettingsDialog.Row
                  class="max-sm:flex-col max-sm:items-stretch"
                  title={
                    <>
                      Display name{' '}
                      <span class="text-ink-red-5" aria-hidden="true">
                        *
                      </span>
                    </>
                  }
                  description="Shown to teammates."
                >
                  <div class="max-sm:w-full">
                    <TextInput
                      aria-label="Display name"
                      autocomplete="name"
                      name="display-name"
                      value={name()}
                      required
                      error={
                        profileAttempted() && name().trim().length < 2
                          ? 'Enter your name.'
                          : undefined
                      }
                      onInput={(event) => {
                        setName(event.currentTarget.value)
                        setProfileNotice('')
                      }}
                    />
                  </div>
                </SettingsDialog.Row>
                <SettingsDialog.Row
                  class="max-sm:flex-col max-sm:items-stretch"
                  title={
                    <>
                      Email{' '}
                      <span class="text-ink-red-5" aria-hidden="true">
                        *
                      </span>
                    </>
                  }
                  description="Used for sign-in."
                >
                  <div class="max-sm:w-full">
                    <TextInput
                      aria-label="Email"
                      type="email"
                      autocomplete="email"
                      name="email"
                      value={email()}
                      required
                      error={
                        profileAttempted() && !emailValid()
                          ? 'Enter a valid email.'
                          : undefined
                      }
                      onInput={(event) => {
                        setEmail(event.currentTarget.value)
                        setProfileNotice('')
                      }}
                    />
                  </div>
                </SettingsDialog.Row>
                <Show when={profileNotice()}>
                  <div class="mt-3">
                    <Notice
                      text={profileNotice()}
                      tone="green"
                      onDismiss={() => setProfileNotice('')}
                    />
                  </div>
                </Show>
                <p class="mt-4 text-caption text-ink-gray-7">
                  Profile changes save locally to this demo.
                </p>
              </SettingsDialog.Body>
            </form>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="notifications">
            <form
              noValidate
              class="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault()
                saveNotifications()
              }}
            >
              <SettingsDialog.Header
                title="Notifications"
                description={
                  notificationsDirty() ? (
                    <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-ink-amber-8">
                      <span
                        class="size-1.5 rounded-full bg-surface-amber-9"
                        aria-hidden="true"
                      />
                      Unsaved changes
                    </span>
                  ) : (
                    'Choose what reaches your inbox.'
                  )
                }
                actions={
                  <>
                    <Show when={notificationsDirty()}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={discardNotifications}
                      >
                        Discard
                      </Button>
                    </Show>
                    <Button
                      type="submit"
                      variant="solid"
                      theme="blue"
                      disabled={!notificationsDirty()}
                    >
                      Save notifications
                    </Button>
                  </>
                }
              />
              <SettingsDialog.Body>
                <SettingsDialog.Row
                  title="Email digests"
                  description="A summary of missed activity."
                >
                  <Switch
                    label={<span class="sr-only">Email digests</span>}
                    checked={digests()}
                    onCheckedChange={(checked) => {
                      setDigests(checked)
                      setNotificationsNotice('')
                    }}
                  />
                </SettingsDialog.Row>
                <SettingsDialog.Row
                  title="Digest frequency"
                  description={
                    digests()
                      ? 'When the summary arrives.'
                      : 'Turn on email digests first.'
                  }
                >
                  <Select
                    aria-label="Digest frequency"
                    class="w-40"
                    value={frequency()}
                    disabled={!digests()}
                    options={NOTIFICATION_FREQUENCIES.map((value) => ({
                      label: value,
                      value,
                    }))}
                    onValueChange={(value) => {
                      if (!value) return
                      setFrequency(value as NotificationFrequency)
                      setNotificationsNotice('')
                    }}
                  />
                </SettingsDialog.Row>
                <SettingsDialog.Row
                  title="Product updates"
                  description="Occasional release notes and tips."
                >
                  <Switch
                    label={<span class="sr-only">Product updates</span>}
                    checked={productUpdates()}
                    onCheckedChange={(checked) => {
                      setProductUpdates(checked)
                      setNotificationsNotice('')
                    }}
                  />
                </SettingsDialog.Row>
                <SettingsDialog.Row
                  title="Mentions"
                  description="When someone mentions you in a discussion."
                >
                  <Switch
                    label={<span class="sr-only">Mentions</span>}
                    checked={mentions()}
                    onCheckedChange={(checked) => {
                      setMentions(checked)
                      setNotificationsNotice('')
                    }}
                  />
                </SettingsDialog.Row>
                <Show when={notificationsNotice()}>
                  <div class="mt-3">
                    <Notice
                      text={notificationsNotice()}
                      tone="green"
                      onDismiss={() => setNotificationsNotice('')}
                    />
                  </div>
                </Show>
                <p class="mt-4 text-caption text-ink-gray-7">
                  Notification preferences save locally to this demo.
                </p>
              </SettingsDialog.Body>
            </form>
          </SettingsDialog.Panel>

          <SettingsDialog.Panel value="members">
            <SettingsDialog.Header
              title="Members"
              description="Roles and invitations apply immediately."
              actions={
                <Button
                  variant="outline"
                  iconLeft="lucide-user-plus"
                  onClick={toggleInvite}
                >
                  Invite member
                </Button>
              }
            />
            <SettingsDialog.Body>
              <Show when={memberNotice()}>
                <div class="mb-3">
                  <Notice
                    text={memberNotice()}
                    tone={memberNoticeTone()}
                    onUndo={removedMember() ? undoRemove : undefined}
                    onDismiss={() => {
                      setMemberNotice('')
                      setRemovedMember(undefined)
                    }}
                  />
                </div>
              </Show>

              <Show when={inviteOpen()}>
                <form
                  noValidate
                  class="mb-3 flex flex-col gap-3 rounded-card border border-outline-gray-1 bg-surface-gray-2 p-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    addMember()
                  }}
                >
                  <div class="grid gap-3 sm:grid-cols-2">
                    <TextInput
                      label="Full name"
                      autocomplete="name"
                      name="invite-name"
                      value={inviteName()}
                      required
                      error={inviteNameError()}
                      onInput={(event) =>
                        setInviteName(event.currentTarget.value)
                      }
                    />
                    <TextInput
                      label="Email"
                      type="email"
                      autocomplete="email"
                      name="invite-email"
                      value={inviteEmail()}
                      required
                      error={inviteEmailError()}
                      onInput={(event) =>
                        setInviteEmail(event.currentTarget.value)
                      }
                    />
                  </div>
                  <div class="flex flex-wrap items-end gap-3">
                    <Select
                      label="Role"
                      aria-label="Role"
                      class="w-40"
                      value={inviteRole()}
                      options={INVITE_ROLES}
                      onValueChange={(value) =>
                        setInviteRole(value === 'Admin' ? 'Admin' : 'Member')
                      }
                    />
                    <div class="ms-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setInviteOpen(false)
                          resetInvite()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="solid" theme="blue">
                        Send invite
                      </Button>
                    </div>
                  </div>
                </form>
              </Show>

              <List columns="auto minmax(0,1fr) auto auto">
                <ListRow height="h-auto" class="py-2.5">
                  <ListCell>
                    <Avatar size="md" label={profile().name} />
                  </ListCell>
                  <ListCell>
                    <div class="min-w-0">
                      <p class="truncate text-base-medium text-ink-gray-9">
                        {profile().name}{' '}
                        <span class="text-caption text-ink-gray-7">(you)</span>
                      </p>
                      <p class="truncate text-caption text-ink-gray-7">
                        {profile().email}
                      </p>
                    </div>
                  </ListCell>
                  <ListCell>
                    <Badge variant="subtle" label="Owner" />
                  </ListCell>
                  <ListCell class="justify-end">
                    <Menu.Root
                      onSelect={(value) => {
                        if (value === 'copy') copyEmail(profile().email)
                      }}
                    >
                      <Menu.Trigger
                        aria-label={`Actions for ${profile().name}`}
                        class="grid size-10 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring sm:size-8"
                      >
                        <span
                          class="lucide-ellipsis size-4"
                          aria-hidden="true"
                        />
                      </Menu.Trigger>
                      <Menu.Content class="min-w-40">
                        <Menu.Item value="copy">Copy email</Menu.Item>
                      </Menu.Content>
                    </Menu.Root>
                  </ListCell>
                </ListRow>

                <For each={members()}>
                  {(member) => (
                    <ListRow height="h-auto" class="py-2.5">
                      <ListCell>
                        <Avatar size="md" label={member.name} />
                      </ListCell>
                      <ListCell>
                        <div class="min-w-0">
                          <p class="truncate text-base-medium text-ink-gray-9">
                            {member.name}
                          </p>
                          <p class="truncate text-caption text-ink-gray-7">
                            {member.email}
                          </p>
                        </div>
                      </ListCell>
                      <ListCell>
                        <Badge
                          variant={
                            member.role === 'Admin' ? 'subtle' : 'outline'
                          }
                          theme={member.role === 'Admin' ? 'violet' : 'gray'}
                          label={member.role}
                        />
                      </ListCell>
                      <ListCell class="justify-end">
                        <Menu.Root
                          onSelect={(value) =>
                            handleMemberAction(member, value)
                          }
                        >
                          <Menu.Trigger
                            aria-label={`Actions for ${member.name}`}
                            class="grid size-10 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:bg-surface-gray-2 focus-visible:focus-ring sm:size-8"
                          >
                            <span
                              class="lucide-ellipsis size-4"
                              aria-hidden="true"
                            />
                          </Menu.Trigger>
                          <Menu.Content class="min-w-40">
                            <Menu.Item value="copy">Copy email</Menu.Item>
                            <Menu.Item
                              value="admin"
                              disabled={member.role === 'Admin'}
                            >
                              Make admin
                            </Menu.Item>
                            <Menu.Item
                              value="member"
                              disabled={member.role === 'Member'}
                            >
                              Make member
                            </Menu.Item>
                            <Menu.Item value="remove">
                              <span class="text-ink-red-7">Remove member</span>
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Root>
                      </ListCell>
                    </ListRow>
                  )}
                </For>
              </List>

              <Show when={members().length === 0 && !inviteOpen()}>
                <EmptyState
                  icon="lucide-users"
                  size="sm"
                  bordered
                  title="No other members yet"
                  description="Invite a teammate to this workspace. Invitations stay local to this demo."
                  action={
                    <Button
                      variant="outline"
                      iconLeft="lucide-user-plus"
                      onClick={() => setInviteOpen(true)}
                    >
                      Invite member
                    </Button>
                  }
                />
              </Show>

              <p class="mt-4 text-caption text-ink-gray-7">
                Invitations and role changes stay local to this demo.
              </p>
            </SettingsDialog.Body>
          </SettingsDialog.Panel>
        </SettingsDialog.Content>
      </SettingsDialog.Root>
    </AppPage>
  )
}
