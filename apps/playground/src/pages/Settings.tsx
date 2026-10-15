import {
  Avatar,
  Badge,
  Button,
  SettingsDialog,
  Switch,
  TextInput,
} from '@newui/ui'
import { createSignal, type JSX, Show } from 'solid-js'
import { PageIntro } from '../shell/PageIntro'

function Section(props: {
  title: string
  description?: string
  children: JSX.Element
}) {
  return (
    <section class="flex flex-col gap-4">
      <div>
        <h2 class="text-section text-ink-gray-9">{props.title}</h2>
        <Show when={props.description}>
          <p class="text-base text-ink-gray-6">{props.description}</p>
        </Show>
      </div>
      {props.children}
    </section>
  )
}

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
  const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())
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
    <div class="flex flex-col gap-4">
      <PageIntro
        title="Workspace settings"
        description="Grouped navigation and focused settings panels, built on Dialog."
      />
      <Section
        title="Settings dialog recipe"
        description="A sidebar of grouped tabs and a panel per tab, built on Dialog."
      >
        <div>
          <Button onClick={() => setSettingsOpen(true)}>Open settings</Button>
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
                  <div class="flex flex-wrap items-center gap-3">
                    <Button type="submit" variant="solid" theme="blue">
                      Save profile
                    </Button>
                    <Show when={notice()}>
                      <p role="status" class="text-caption text-ink-green-7">
                        {notice()}
                      </p>
                    </Show>
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
      </Section>
    </div>
  )
}
