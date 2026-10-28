import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Divider,
  Progress,
  ProgressCircle,
  Skeleton,
  Slider,
  Switch,
  Textarea,
  TextInput,
  Tooltip,
} from '@talelk/newui-atoms'
import {
  Accordion,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  Combobox,
  DatePicker,
  Dialog,
  EmptyState,
  FormControl,
  List,
  ListCell,
  ListRow,
  MultiSelect,
  Pagination,
  Password,
  Popover,
  RadioGroup,
  Select,
  TabButtons,
  Tabs,
  Timeline,
  Toaster,
  ToggleGroup,
  toast,
} from '@talelk/newui-molecules'
import { Sidebar, SidebarItem } from '@talelk/newui-organisms'
import { createEffect, For, type JSX, onMount } from 'solid-js'

/**
 * The deterministic page the browser harness drives. Fixed content, no
 * avatars/network, so axe and the perf budgets are stable. `?theme=dark` flips
 * the theme; `?rows=N` renders a large list for the render benchmark.
 */
export function Spec(): JSX.Element {
  const params = new URLSearchParams(location.search)
  const theme = params.get('theme') ?? 'light'
  const rows = Number(params.get('rows') ?? '0')

  onMount(() => {
    document.documentElement.setAttribute('data-theme', theme)
  })

  createEffect(() => {
    if (rows > 0) {
      // Reported for the large-list budget.
      const start = performance.now()
      requestAnimationFrame(() => {
        ;(window as unknown as { __listMs: number }).__listMs =
          performance.now() - start
      })
    }
  })

  return (
    <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-surface-base p-6 text-ink-gray-9">
      <h1 class="text-2xl-semibold">Component spec</h1>
      <section class="flex flex-wrap items-center gap-3">
        <Button variant="solid" theme="blue">
          Save
        </Button>
        <Button variant="outline">Cancel</Button>
        <Button icon="lucide-plus" aria-label="Add" />
        <Badge theme="amber" variant="subtle">
          Pending
        </Badge>
        <Avatar label="Talel" />
      </section>

      <section
        data-slot="visual-form-states"
        class="grid gap-4 rounded-card border border-outline-gray-1 p-4 sm:grid-cols-2"
        aria-label="Text entry states"
      >
        <TextInput
          label="Invoice amount"
          value="1,240"
          prefix={<span>$</span>}
          suffix={<span>USD</span>}
        />
        <TextInput
          label="Invalid email"
          value="alex@"
          error="Enter a valid email address"
        />
        <TextInput label="Disabled field" value="Read only report" disabled />
        <Textarea
          label="Report notes"
          placeholder="Add context for your team"
        />
      </section>
      <section class="flex flex-col gap-4">
        <Switch data-testid="switch" label="Notifications" />
        <Checkbox data-testid="checkbox" label="Subscribe" />
        <RadioGroup
          defaultValue="a"
          items={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ]}
        />
        <div class="max-w-xs">
          <Slider defaultValue={[40]} aria-label="Amount" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <TextInput
          data-testid="input"
          label="Email"
          description="We never share it"
          error="Required"
          required
        />
        <Textarea label="Notes" />
        <Password
          label="Password"
          description="At least 8 characters"
          value="hunter2"
        />
        <FormControl
          label="Title"
          description="Shown in the list"
          value="Untitled"
        />
        <FormControl type="checkbox" label="Notify the team" />
        <Combobox
          label="Assignee"
          placeholder="Search people…"
          options={[
            { label: 'Alex Rivera', value: 'alex' },
            { label: 'Sam Lee', value: 'sam' },
          ]}
        />
        <MultiSelect
          label="Labels"
          placeholder="Add labels…"
          options={[
            { label: 'Bug', value: 'bug' },
            { label: 'Feature', value: 'feature' },
            { label: 'Docs', value: 'docs' },
          ]}
        />
        <DatePicker label="Due date" placeholder="Pick a date" clearable />
        <Select
          placeholder="Choose"
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Paid', value: 'paid' },
          ]}
        />
      </section>

      <section class="flex flex-col gap-4">
        <Tabs.Root defaultValue="one">
          <Tabs.List>
            <Tabs.Trigger value="one">One</Tabs.Trigger>
            <Tabs.Trigger value="two">Two</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="one">First</Tabs.Content>
          <Tabs.Content value="two">Second</Tabs.Content>
        </Tabs.Root>
        <TabButtons
          label="Message filter"
          options={[
            { label: 'Unread', value: 'unread' },
            { label: 'All', value: 'all' },
          ]}
        />
      </section>

      <section class="flex flex-wrap items-center gap-3">
        <Dialog.Root>
          <Dialog.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
            Open dialog
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Publish the September report?</Dialog.Title>
              <Dialog.Description>
                The current revenue and transaction figures will be shared with
                the workspace.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close class="rounded-control border border-outline-gray-2 px-2 py-0.5 text-base text-ink-gray-8">
                Cancel
              </Dialog.Close>
              <Dialog.Close class="rounded-control bg-surface-blue-8 px-2 py-0.5 text-base-medium text-ink-base">
                Publish report
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>

        <Popover.Root>
          <Popover.Trigger class="rounded-4 border border-outline-gray-2 px-3 py-1.5 text-base">
            Filters
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Filters</Popover.Title>
          </Popover.Content>
        </Popover.Root>

        <Tooltip text="Add a new item">
          <span class="rounded-4 bg-surface-gray-2 px-3 py-1.5 text-base">
            Hover me
          </span>
        </Tooltip>

        <Button onClick={() => toast.success({ title: 'Saved' })}>
          Show toast
        </Button>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-lg-medium">Feedback</h2>
        <Alert
          theme="amber"
          title="Unsaved"
          description="Your edits are not stored."
        />
        <Card>
          <CardHeader>
            <CardTitle>Card</CardTitle>
          </CardHeader>
          <CardContent>Body</CardContent>
        </Card>
        <Divider label="or" />
        <Progress value={40} aria-label="Upload progress" />
        <Skeleton lines={2} />
      </section>

      <section>
        <List>
          <For each={Array.from({ length: rows || 4 })}>
            {(_, index) => (
              <ListRow>
                <ListCell>Row {index() + 1}</ListCell>
                <ListCell>Detail</ListCell>
                <ListCell class="justify-end">
                  <Badge>{index() + 1}</Badge>
                </ListCell>
              </ListRow>
            )}
          </For>
        </List>
      </section>

      <section class="flex flex-col gap-4">
        <Accordion.Root defaultValue={['one']}>
          <Accordion.Item value="one">
            <Accordion.Trigger>First section</Accordion.Trigger>
            <Accordion.Content>First body</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two" disabled>
            <Accordion.Trigger>Second section</Accordion.Trigger>
            <Accordion.Content>Second body</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <Collapsible.Root>
          <Collapsible.Trigger>More options</Collapsible.Trigger>
          <Collapsible.Content>Hidden by default.</Collapsible.Content>
        </Collapsible.Root>

        <ToggleGroup.Root aria-label="Density" defaultValue={['comfortable']}>
          <ToggleGroup.Item value="compact">Compact</ToggleGroup.Item>
          <ToggleGroup.Item value="comfortable">Comfortable</ToggleGroup.Item>
        </ToggleGroup.Root>

        <Pagination.Root count={120} pageSize={10} defaultPage={3}>
          <Pagination.PrevTrigger />
          <Pagination.Pages />
          <Pagination.NextTrigger />
          <Pagination.Range class="ms-2" />
        </Pagination.Root>

        <ProgressCircle value={64} aria-label="Storage used" />

        <EmptyState
          icon="lucide-inbox"
          title="Nothing here"
          description="No records yet."
        />

        <Timeline
          items={[
            { title: 'Created', timestamp: '2h ago', icon: 'lucide-plus' },
            { title: 'Published', description: 'Went live.', tone: 'green' },
          ]}
        />
      </section>

      <Sidebar
        width="12rem"
        class="h-40 rounded-card border border-outline-gray-1"
      >
        <SidebarItem prefix={<span class="lucide-house size-4" />}>
          Home
        </SidebarItem>
        <SidebarItem active prefix={<span class="lucide-bell size-4" />}>
          Activity
        </SidebarItem>
      </Sidebar>

      <Toaster />
    </main>
  )
}
