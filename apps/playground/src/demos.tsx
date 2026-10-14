import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  Combobox,
  DatePicker,
  Dialog,
  Divider,
  Duration,
  FileUploader,
  FormControl,
  Icon,
  ItemListRow,
  KeyboardShortcut,
  List,
  ListCell,
  ListRow,
  Menu,
  MultiSelect,
  NumberInput,
  Password,
  Popover,
  Progress,
  RadioGroup,
  Rating,
  ScrollArea,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  TabButtons,
  Tabs,
  Textarea,
  TextInput,
  TimePicker,
  Tooltip,
  Tree,
  type TreeItem,
} from '@newui/ui'
import { For, type JSX } from 'solid-js'

const TREE_ITEMS: TreeItem[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/index.ts', label: 'index.ts' },
      { value: 'src/app.ts', label: 'app.ts' },
    ],
  },
  { value: 'readme', label: 'README.md' },
]

/**
 * One live demo per component, keyed by its public name. The playground's
 * `/play?c=<Name>` route and the generated docs both read from here, so a demo
 * is written once.
 */
export const DEMOS: Record<string, () => JSX.Element> = {
  Alert: () => (
    <div class="flex max-w-md flex-col gap-2">
      <Alert theme="green" title="Saved" description="All changes stored." />
      <Alert
        theme="amber"
        title="Unsaved"
        description="Your edits are not stored."
      />
      <Alert theme="red" title="Could not connect" dismissible />
    </div>
  ),
  Avatar: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Avatar size="xs" label="Alex Rivera" />
      <Avatar size="md" label="Sam Lee" />
      <Avatar size="lg" theme="blue" label="Jordan Park" />
      <Avatar size="2xl" shape="square" theme="green" label="Frappe" />
    </div>
  ),
  Badge: () => (
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="solid" theme="gray" label="Default" />
      <Badge variant="subtle" theme="blue" label="Info" />
      <Badge variant="outline" theme="green" label="Active" />
      <Badge variant="ghost" theme="amber" label="Pending" />
      <Badge variant="solid" theme="red" label="Failed" />
      <Badge
        theme="green"
        label="Verified"
        prefix={<Icon icon="lucide-check" class="size-2.5" />}
      />
    </div>
  ),
  Breadcrumbs: () => (
    <Breadcrumbs
      items={[
        { label: 'Home', route: '/' },
        { label: 'Projects', route: '/projects' },
        { label: 'Website' },
      ]}
    />
  ),
  Button: () => (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid" theme="gray">
          Solid
        </Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button icon="lucide-plus" aria-label="Add" />
      </div>
    </div>
  ),
  Checkbox: () => (
    <div class="flex flex-col gap-3">
      <Checkbox label="Email me" defaultChecked />
      <Checkbox label="Subscribe" />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Padded row" padded />
    </div>
  ),
  Combobox: () => (
    <div class="max-w-sm">
      <Combobox
        label="Assignee"
        placeholder="Search people…"
        options={[
          { label: 'Alex Rivera', value: 'alex', description: 'Owner' },
          { label: 'Sam Lee', value: 'sam', description: 'Designer' },
          { label: 'Jordan Park', value: 'jordan' },
        ]}
      />
    </div>
  ),
  DatePicker: () => (
    <div class="max-w-sm">
      <DatePicker label="Due date" placeholder="Pick a date" clearable />
    </div>
  ),
  Dialog: () => (
    <Dialog.Root>
      <Dialog.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
        Open dialog
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header icon="lucide-circle-check" theme="green">
          <Dialog.Title>Confirm</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
          Are you sure you want to continue?
        </Dialog.Description>
        <Dialog.Footer
          actions={[
            { label: 'Cancel', variant: 'subtle' },
            { label: 'Save', variant: 'solid', theme: 'blue' },
          ]}
        />
      </Dialog.Content>
    </Dialog.Root>
  ),
  Divider: () => (
    <div class="flex max-w-md flex-col gap-4">
      <Divider />
      <Divider label="or" />
      <Divider label="Section" action={{ label: 'Clear', onClick: () => {} }} />
    </div>
  ),
  Duration: () => (
    <div class="max-w-sm">
      <Duration label="Estimate" />
    </div>
  ),
  FileUploader: () => (
    <div class="max-w-sm">
      <FileUploader
        label="Attachments"
        description="Drop files or click to browse"
        multiple
      />
    </div>
  ),
  FormControl: () => (
    <div class="flex max-w-sm flex-col gap-4">
      <FormControl label="Title" description="Shown in the list" />
      <FormControl type="textarea" label="Description" />
      <FormControl
        type="select"
        label="Status"
        placeholder="Choose"
        options={[
          { label: 'Draft', value: 'draft' },
          { label: 'Paid', value: 'paid' },
        ]}
      />
      <FormControl type="checkbox" label="Notify the team" />
    </div>
  ),
  ItemListRow: () => (
    <div class="flex max-w-sm flex-col gap-1">
      <ItemListRow active prefix={<Icon icon="lucide-house" class="size-4" />}>
        Home
      </ItemListRow>
      <ItemListRow prefix={<Icon icon="lucide-search" class="size-4" />}>
        Search
      </ItemListRow>
      <ItemListRow
        disabled
        prefix={<Icon icon="lucide-settings" class="size-4" />}
      >
        Settings
      </ItemListRow>
    </div>
  ),
  KeyboardShortcut: () => (
    <div class="flex flex-wrap items-center gap-4">
      <KeyboardShortcut combo="Mod+K" />
      <KeyboardShortcut combo="Mod+Shift+P" />
      <KeyboardShortcut combo="Ctrl+Alt+Delete" />
    </div>
  ),
  List: () => (
    <List class="max-w-md">
      <ListRow>
        <ListCell>Draft</ListCell>
        <ListCell class="justify-end">
          <Badge theme="gray" label="12" />
        </ListCell>
      </ListRow>
      <ListRow>
        <ListCell>Paid</ListCell>
        <ListCell class="justify-end">
          <Badge theme="green" label="8" />
        </ListCell>
      </ListRow>
    </List>
  ),
  Menu: () => (
    <Menu.Root>
      <Menu.Trigger class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base">
        Actions
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item value="edit">Edit</Menu.Item>
        <Menu.Item value="duplicate">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item value="delete">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
  MultiSelect: () => (
    <div class="max-w-sm">
      <MultiSelect
        label="Labels"
        placeholder="Add labels…"
        options={[
          { label: 'Bug', value: 'bug' },
          { label: 'Feature', value: 'feature' },
          { label: 'Docs', value: 'docs' },
        ]}
      />
    </div>
  ),
  NumberInput: () => (
    <div class="max-w-sm">
      <NumberInput label="Seats" defaultValue="4" min={1} max={20} />
    </div>
  ),
  Password: () => (
    <div class="max-w-sm">
      <Password
        label="Password"
        description="At least 8 characters"
        placeholder="••••••••"
      />
    </div>
  ),
  Popover: () => (
    <Popover.Root>
      <Popover.Trigger class="rounded-4 border border-outline-gray-2 px-3 py-1.5 text-base">
        Filters
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Filters</Popover.Title>
        <Popover.Description>
          Anchored to the trigger, portalled to the body.
        </Popover.Description>
      </Popover.Content>
    </Popover.Root>
  ),
  Progress: () => (
    <div class="flex max-w-sm flex-col gap-3">
      <Progress value={40} />
      <Progress value={72} />
      <Progress value={30} label="Uploading" hint />
      <Progress indeterminate />
    </div>
  ),
  RadioGroup: () => (
    <div class="max-w-sm">
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        items={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', description: 'Everything you need' },
          { value: 'team', label: 'Team' },
        ]}
      />
    </div>
  ),
  Rating: () => (
    <div class="flex flex-col gap-3">
      <Rating defaultValue={3} />
      <Rating defaultValue={3.5} step={0.5} />
      <Rating defaultValue={3} max={10} />
    </div>
  ),
  ScrollArea: () => (
    <ScrollArea.Root class="h-32 w-64 rounded-4 border border-outline-gray-1">
      <ScrollArea.Viewport class="p-3">
        <For each={Array.from({ length: 12 })}>
          {(_, i) => <p class="text-base text-ink-gray-7">Row {i() + 1}</p>}
        </For>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar />
    </ScrollArea.Root>
  ),
  Select: () => (
    <div class="max-w-sm">
      <Select
        label="Status"
        placeholder="Choose a status"
        options={[
          { label: 'Draft', value: 'draft', icon: 'lucide-pencil' },
          { label: 'Paid', value: 'paid', icon: 'lucide-check' },
          { label: 'Cancelled', value: 'cancelled', disabled: true },
        ]}
      />
    </div>
  ),
  Skeleton: () => (
    <div class="max-w-sm">
      <Skeleton lines={3} />
    </div>
  ),
  Slider: () => (
    <div class="flex max-w-sm flex-col gap-4">
      <Slider defaultValue={[35]} aria-label="Amount" />
      <Slider size="md" defaultValue={[60]} aria-label="Large amount" />
    </div>
  ),
  Spinner: () => (
    <div class="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" track />
      <Spinner theme="blue" />
      <Spinner theme="red" />
    </div>
  ),
  Switch: () => (
    <div class="flex max-w-sm flex-col gap-3">
      <Switch label="Notifications" defaultChecked />
      <Switch
        label="Email digest"
        description="A weekly summary delivered every Friday."
        controlPosition="end"
      />
      <Switch label="Disabled" disabled />
    </div>
  ),
  TabButtons: () => (
    <div class="flex flex-col gap-3">
      <TabButtons
        options={[
          { label: 'Unread', value: 'unread' },
          { label: 'All', value: 'all' },
        ]}
      />
      <TabButtons
        variant="underline"
        options={[
          { label: 'Overview', value: 'a', icon: 'lucide-house' },
          { label: 'Activity', value: 'b', icon: 'lucide-bell' },
        ]}
      />
    </div>
  ),
  Tabs: () => (
    <Tabs.Root defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one" icon="lucide-house" label="One" />
        <Tabs.Trigger value="two" label="Two" />
      </Tabs.List>
      <Tabs.Content value="one">First panel</Tabs.Content>
      <Tabs.Content value="two">Second panel</Tabs.Content>
    </Tabs.Root>
  ),
  Textarea: () => (
    <div class="max-w-sm">
      <Textarea label="Notes" placeholder="Write something…" />
    </div>
  ),
  TextInput: () => (
    <div class="flex max-w-sm flex-col gap-3">
      <TextInput label="Full name" placeholder="Jane Doe" />
      <TextInput
        label="Search"
        placeholder="Search…"
        prefix={<Icon icon="lucide-search" class="size-4" />}
      />
      <TextInput label="Email" error="This email is invalid" value="nope" />
    </div>
  ),
  TimePicker: () => (
    <div class="max-w-sm">
      <TimePicker label="Start time" />
    </div>
  ),
  Tooltip: () => (
    <Tooltip text="Add a new item">
      <span class="rounded-4 bg-surface-gray-2 px-3 py-1.5 text-base">
        Hover me
      </span>
    </Tooltip>
  ),
  Tree: () => (
    <Tree.Root items={TREE_ITEMS}>
      <Tree.Label>Files</Tree.Label>
      <Tree.Tree>
        <For each={TREE_ITEMS}>
          {(node, index) => <Tree.Node node={node} indexPath={[index()]} />}
        </For>
      </Tree.Tree>
    </Tree.Root>
  ),
}
