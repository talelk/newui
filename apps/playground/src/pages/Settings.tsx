import { Avatar, Badge, Button, Switch, TextInput } from '@newui/atoms'
import { isEmail } from '@newui/data'
import { SettingsDialog } from '@newui/organisms'
import { createSignal, type JSX } from 'solid-js'
import { Notice } from '../examples/Notice'
import { PageSection } from '../lib/PageSection'
import { PageIntro } from '../shell/PageIntro'

export function Settings(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [tab, setTab] = createSignal('profile')
  const [saved, setSaved] = createSignal({
    name: 'Alex Rivera',
    email: 'alex@example.com',
  })
  const [name, setName] = createSignal('Alex Rivera')
  const [email, setEmail] = createSignal('alex@example.com')
  const [digests, setDigests] = createSignal(true)
  const [attempted, setAttempted] = createSignal(false)
  const [notice, setNotice] = createSignal('')
  const emailValid = () => isEmail(email())
  const openChanged = (open: boolean) => {
    if (!open) {
      setName(saved().name)
      setEmail(saved().email)
      setAttempted(false)
      setNotice('')
    }
    setSettingsOpen(open)
  }
  const saveProfile = () => {
    setAttempted(true)
    if (name().trim().length < 2 || !emailValid()) return
    setSaved({ name: name().trim(), email: email() })
    setAttempted(false)
    setNotice('Profile saved locally for this page.')
  }
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageIntro
        title="Workspace settings"
        description="Grouped navigation and focused settings panels, built on Dialog."
      />
      <PageSection
        id="settings-dialog-recipe"
        title="Settings dialog recipe"
        description="A sidebar of grouped tabs and a panel per tab, built on Dialog."
      >
        <div class="grid place-items-center gap-3 rounded-5 border border-outline-gray-1 bg-surface-gray-1 px-4 py-12 text-center">
          <Button
            variant="solid"
            theme="blue"
            onClick={() => setSettingsOpen(true)}
          >
            Open settings
          </Button>
          <p class="max-w-sm text-caption text-ink-gray-7">
            Profile, notifications and members, grouped in one dialog — edits
            stay on this page.
          </p>
        </div>

        <SettingsDialog.Root
          open={settingsOpen()}
          onOpenChange={openChanged}
          value={tab()}
          onValueChange={setTab}
        >
          <SettingsDialog.Sidebar>
            <SettingsDialog.NavGroup label="User settings">
              <SettingsDialog.NavItem
                value="profile"
                prefix={<Avatar size="xs" label={saved().name} />}
              >
                Profile
              </SettingsDialog.NavItem>
              <SettingsDialog.NavItem
                value="notifications"
                suffix={<Badge label="3" />}
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
              <SettingsDialog.Header title="Profile" />
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  saveProfile()
                }}
              >
                <SettingsDialog.Body>
                  <SettingsDialog.Row
                    title="Display name"
                    description="Shown to teammates."
                  >
                    <TextInput
                      aria-label="Display name"
                      value={name()}
                      required
                      error={
                        attempted() && name().trim().length < 2
                          ? 'Enter your name.'
                          : undefined
                      }
                      onInput={(event) => setName(event.currentTarget.value)}
                    />
                  </SettingsDialog.Row>
                  <SettingsDialog.Row
                    title="Email"
                    description="Used for sign-in."
                  >
                    <TextInput
                      aria-label="Email"
                      type="email"
                      value={email()}
                      required
                      error={
                        attempted() && !emailValid()
                          ? 'Enter a valid email.'
                          : undefined
                      }
                      onInput={(event) => setEmail(event.currentTarget.value)}
                    />
                  </SettingsDialog.Row>
                  <div class="flex flex-col gap-3">
                    <div>
                      <Button type="submit" variant="solid" theme="blue">
                        Save profile
                      </Button>
                    </div>
                    <Notice
                      text={notice()}
                      tone="green"
                      onDismiss={() => setNotice('')}
                    />
                  </div>
                </SettingsDialog.Body>
              </form>
            </SettingsDialog.Panel>

            <SettingsDialog.Panel value="notifications">
              <SettingsDialog.Header title="Notifications" />
              <SettingsDialog.Body>
                <SettingsDialog.Row
                  title="Email digests"
                  description="A summary of missed activity."
                >
                  <Switch
                    label={<span class="sr-only">Email digests</span>}
                    checked={digests()}
                    onCheckedChange={setDigests}
                  />
                </SettingsDialog.Row>
              </SettingsDialog.Body>
            </SettingsDialog.Panel>

            <SettingsDialog.Panel value="members">
              <SettingsDialog.Header title="Members" />
              <SettingsDialog.Body>
                <SettingsDialog.Row title={saved().name} description="Owner">
                  <Badge theme="blue" label="Owner" />
                </SettingsDialog.Row>
              </SettingsDialog.Body>
            </SettingsDialog.Panel>
          </SettingsDialog.Content>
        </SettingsDialog.Root>
      </PageSection>
    </div>
  )
}
