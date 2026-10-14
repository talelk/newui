import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ScrollArea,
  Tabs,
  toast,
} from '@newui/ui'
import { For, type JSX } from 'solid-js'

function Section(props: { title: string; children: JSX.Element }) {
  return (
    <section class="flex flex-col gap-4">
      <h2 class="text-xl-medium text-ink-gray-9">{props.title}</h2>
      {props.children}
    </section>
  )
}

const THEMES = ['gray', 'blue', 'green', 'amber', 'red'] as const

// Literal classes: Tailwind's scanner cannot see a computed `bg-chart-${n}`.
const CHART_SWATCHES = [
  { class: 'bg-chart-1', label: 'chart-1' },
  { class: 'bg-chart-2', label: 'chart-2' },
  { class: 'bg-chart-3', label: 'chart-3' },
  { class: 'bg-chart-4', label: 'chart-4' },
  { class: 'bg-chart-5', label: 'chart-5' },
  { class: 'bg-chart-6', label: 'chart-6' },
  { class: 'bg-chart-7', label: 'chart-7' },
  { class: 'bg-chart-8', label: 'chart-8' },
]

export function Feedback() {
  return (
    <div class="flex flex-col gap-12 border-t border-outline-gray-1 pt-10">
      <Section title="Card">
        <div class="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly revenue</CardTitle>
              <CardDescription>Compared to last month</CardDescription>
            </CardHeader>
            <CardContent>
              <span class="text-4xl-bold">₹4.2L</span>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Details
              </Button>
              <Button size="sm" theme="blue" variant="solid">
                Share
              </Button>
            </CardFooter>
          </Card>

          <Card elevation="md" padding="lg">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Card with a larger elevation</CardDescription>
            </CardHeader>
            <CardContent>
              Cards compose Header / Title / Description / Content / Footer, all
              on the elevation-1 surface token.
            </CardContent>
            <CardFooter>
              <Button
                theme="green"
                variant="solid"
                size="sm"
                onClick={() => toast.success({ title: 'Published' })}
              >
                Publish
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Alert">
        <div class="flex flex-col gap-3">
          <For each={THEMES}>
            {(theme) => <Alert theme={theme} title={`${theme} alert`} />}
          </For>
          <Alert
            theme="amber"
            title="Unsaved changes"
            description="Your edits will be lost if you leave this page."
            action={{
              label: 'Save now',
              onClick: () => toast.success({ title: 'Saved' }),
            }}
          />
          <Alert
            theme="red"
            title="Could not connect"
            description="Retrying in 5 seconds. Check your network."
            dismissible
            onDismiss={() => toast.info({ title: 'Dismissed' })}
          />
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs.Root defaultValue="overview" class="max-w-lg">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            <Tabs.Trigger value="locked" disabled>
              Locked
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" class="pt-3">
            Arrow keys move between tabs; the disabled tab is skipped.
          </Tabs.Content>
          <Tabs.Content value="activity" class="pt-3">
            Recent activity goes here.
          </Tabs.Content>
          <Tabs.Content value="settings" class="pt-3">
            Settings go here.
          </Tabs.Content>
          <Tabs.Content value="locked" class="pt-3">
            Never shown.
          </Tabs.Content>
        </Tabs.Root>
      </Section>

      <Section title="ScrollArea">
        <ScrollArea.Root class="h-40 w-full max-w-sm rounded-5 border border-outline-gray-1">
          <ScrollArea.Viewport class="p-3">
            <div class="flex flex-col gap-2">
              {Array.from({ length: 20 }, (_, i) => (
                <div class="text-sm text-ink-gray-7">Row {i + 1}</div>
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
        </ScrollArea.Root>
      </Section>

      <Section title="Chart palette">
        <div class="flex flex-wrap gap-2">
          <For each={CHART_SWATCHES}>
            {(swatch) => (
              <div class="flex flex-col items-center gap-1">
                <div class={`${swatch.class} size-12 rounded-4`} />
                <span class="text-2xs text-ink-gray-5">{swatch.label}</span>
              </div>
            )}
          </For>
          <div class="flex flex-col items-center gap-1">
            <div class="size-12 rounded-4 border border-chart-grid bg-surface-base" />
            <span class="text-2xs text-ink-gray-5">grid</span>
          </div>
        </div>
      </Section>
    </div>
  )
}
