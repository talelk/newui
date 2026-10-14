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
        <h2 class="text-xl-medium text-ink-gray-9">{props.title}</h2>
        <Show when={props.description}>
          <p class="text-base text-ink-gray-6">{props.description}</p>
        </Show>
      </div>
      {props.children}
    </section>
  )
}

export function Examples() {
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [tab, setTab] = createSignal('profile')

  return (
    <div class="flex flex-col gap-12">
      <PageIntro
        title="Examples"
        description="Whole screens, rebuilt from the products they ship in — read them as a reference, not as a component."
      />
      <Section
        title="Mobile shell recipe"
        description="A pinned header, a scrolling body and a bottom nav — a full-screen app frame."
      >
        <div class="flex max-w-xl flex-col items-start gap-3 rounded-5 border border-outline-gray-2 p-4">
          <p class="text-base text-ink-gray-7">
            <code class="rounded-3 bg-surface-gray-2 px-1">MobileShell</code> is
            <code class="rounded-3 bg-surface-gray-2 px-1">fixed inset-0</code>{' '}
            by design, so it takes over the viewport rather than sitting inline
            in this scrolling page. Open the recipe on its own route:
          </p>
          <p class="text-base text-ink-gray-7">
            The desktop half of the same recipe is{' '}
            <a
              href="/examples/discussions/desktop"
              class="text-ink-blue-6 underline decoration-dotted"
            >
              Discussions, desktop
            </a>
            .
          </p>
          <a
            href="/examples/discussions/mobile"
            class="w-fit rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base transition-colors hover:bg-surface-gray-9"
          >
            Open the mobile shell →
          </a>
        </div>
      </Section>

      <Section
        title="Settings dialog recipe"
        description="A sidebar of grouped tabs and a panel per tab, built on Dialog."
      >
        <div>
          <Button onClick={() => setSettingsOpen(true)}>Open settings</Button>
        </div>

        <SettingsDialog.Root
          open={settingsOpen()}
          onOpenChange={setSettingsOpen}
          value={tab()}
          onValueChange={setTab}
        >
          <SettingsDialog.Sidebar>
            <SettingsDialog.NavGroup label="User settings">
              <SettingsDialog.NavItem
                value="profile"
                prefix={<Avatar size="xs" label="Alex Rivera" />}
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
              <SettingsDialog.Body>
                <SettingsDialog.Row
                  title="Display name"
                  description="Shown to teammates."
                >
                  <TextInput value="Alex Rivera" />
                </SettingsDialog.Row>
                <SettingsDialog.Row
                  title="Email"
                  description="Used for sign-in."
                >
                  <TextInput value="alex@example.com" />
                </SettingsDialog.Row>
              </SettingsDialog.Body>
            </SettingsDialog.Panel>

            <SettingsDialog.Panel value="notifications">
              <SettingsDialog.Header title="Notifications" />
              <SettingsDialog.Body>
                <SettingsDialog.Row
                  title="Email digests"
                  description="A summary of missed activity."
                >
                  <Switch defaultChecked />
                </SettingsDialog.Row>
              </SettingsDialog.Body>
            </SettingsDialog.Panel>

            <SettingsDialog.Panel value="members">
              <SettingsDialog.Header title="Members" />
              <SettingsDialog.Body>
                <SettingsDialog.Row title="Alex Rivera" description="Owner">
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
