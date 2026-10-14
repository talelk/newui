import {
  AlertTriangleSolidIcon,
  CircleCheckIcon,
  CloseCircleSolidIcon,
  HelpIcon,
  LightningIcon,
  StepsIcon,
} from '@newui/icons'
import {
  Avatar,
  Badge,
  BottomSheet,
  Breadcrumbs,
  Checkbox,
  ContextMenu,
  Divider,
  Dropdown,
  Duration,
  ErrorMessage,
  FileUploader,
  FormControl,
  FormLabel,
  HoverCard,
  Icon,
  KeyboardShortcut,
  LoadingText,
  Menu,
  NumberInput,
  Password,
  Popover,
  Progress,
  RadioGroup,
  Rating,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Textarea,
  TextInput,
  TimePicker,
  Tooltip,
  Tree,
  type TreeItem,
  toast,
} from '@newui/ui'
import { createSignal, For, type JSX } from 'solid-js'

function Section(props: { title: string; children: JSX.Element }) {
  return (
    <section class="flex flex-col gap-4">
      <h2 class="text-xl-medium text-ink-gray-9">{props.title}</h2>
      {props.children}
    </section>
  )
}

const TREE_ITEMS: TreeItem[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/index.ts', label: 'index.ts' },
      { value: 'src/app.ts', label: 'App.tsx' },
    ],
  },
  { value: 'readme', label: 'README.md' },
  { value: 'package', label: 'package.json' },
]

const THEMES = ['gray', 'blue', 'green', 'amber', 'red', 'violet'] as const
const SHAPES = ['circle', 'square'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export function Atoms() {
  const [sheet, setSheet] = createSignal(false)

  return (
    <div class="flex flex-col gap-12 border-t border-outline-gray-1 pt-10">
      <Section title="Icons & spinners">
        <div class="flex flex-wrap items-center gap-4 text-ink-gray-7">
          <Icon icon="lucide-search" class="size-5" />
          <Icon icon="lucide-plus" class="size-5 text-ink-blue-5" />
          <Icon icon="lucide-trash-2" class="size-5 text-ink-red-7" />
          <Spinner />
          <Spinner size="lg" />
          <Spinner track />
          <LoadingText>Loading…</LoadingText>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-ink-gray-7">
          <LightningIcon class="size-4" />
          <StepsIcon class="size-4" />
          <CircleCheckIcon class="size-4 text-ink-green-7" />
          <HelpIcon class="size-4" />
          <AlertTriangleSolidIcon class="size-4 text-ink-amber-7" />
          <CloseCircleSolidIcon class="size-4 text-ink-red-7" />
        </div>
      </Section>

      <Section title="Badge">
        <div class="flex flex-col gap-3">
          <For each={['solid', 'subtle', 'outline', 'ghost'] as const}>
            {(variant) => (
              <div class="flex flex-wrap items-center gap-2">
                <For each={THEMES}>
                  {(theme) => (
                    <Badge theme={theme} variant={variant} label={theme} />
                  )}
                </For>
              </div>
            )}
          </For>
          <div class="flex flex-wrap items-center gap-2">
            <Badge size="sm" label="sm" />
            <Badge size="md" label="md" />
            <Badge size="lg" label="lg" />
            <Badge
              theme="amber"
              label="Pending"
              prefix={<Icon icon="lucide-clock" class="size-2.5" />}
            />
          </div>
        </div>
      </Section>

      <Section title="Avatar">
        <div class="flex flex-wrap items-center gap-4">
          <For each={SHAPES}>
            {(shape) => (
              <For each={SIZES}>
                {(size) => <Avatar shape={shape} size={size} label="Talel" />}
              </For>
            )}
          </For>
          <Avatar
            size="2xl"
            shape="square"
            theme="blue"
            image="https://avatars.githubusercontent.com/u/836974?s=64"
            label="Frappe"
          />
          <Avatar size="2xl" theme="red" label="Z" />
        </div>
      </Section>

      <Section title="Divider">
        <div class="flex flex-col gap-4">
          <Divider />
          <Divider label="or" />
          <div class="flex h-16 items-center gap-4">
            <span class="text-sm">Left</span>
            <Divider orientation="vertical" />
            <span class="text-sm">Right</span>
          </div>
        </div>
      </Section>

      <Section title="Loading & progress">
        <div class="flex max-w-sm flex-col gap-4">
          <Skeleton lines={3} />
          <Progress value={40} />
          <Progress value={72} />
          <Progress indeterminate />
        </div>
      </Section>

      <Section title="Inputs">
        <div class="flex max-w-sm flex-col gap-4">
          <TextInput label="Full name" placeholder="Jane Doe" />
          <TextInput
            label="Email"
            description="We never share it"
            placeholder="jane@example.com"
          />
          <TextInput
            label="API key"
            error="This key is invalid"
            value="sk-123"
          />
          <TextInput
            label="Search"
            prefix={<Icon icon="lucide-search" class="size-4" />}
            placeholder="Search…"
          />
          <Password
            label="Password"
            description="At least 8 characters"
            placeholder="••••••••"
          />
          <Textarea label="Notes" placeholder="Write something…" />
        </div>
      </Section>

      <Section title="Toggles">
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-6">
            <Checkbox label="Email me" defaultChecked />
            <Checkbox label="Subscribe" />
            <Checkbox label="Disabled" disabled />
          </div>
          <div class="max-w-sm">
            <Slider defaultValue={[35]} />
          </div>
          <div class="flex items-center gap-3">
            <Tooltip
              text="Add a new item"
              class="rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base"
            >
              Hover me
            </Tooltip>
          </div>
        </div>
      </Section>
      <Section title="More inputs">
        <div class="flex max-w-sm flex-col gap-5">
          <Select
            label="Status"
            placeholder="Choose a status"
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Paid', value: 'paid' },
              { label: 'Cancelled', value: 'cancelled', disabled: true },
            ]}
          />
          <NumberInput label="Quantity" defaultValue="2" min={0} max={10} />
          <RadioGroup
            label="Plan"
            defaultValue="pro"
            items={[
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
              { value: 'team', label: 'Team' },
            ]}
          />
          <Rating label="Quality" defaultValue={3} />
        </div>
      </Section>

      <Section title="Form">
        <div class="flex max-w-sm flex-col gap-5">
          <FormControl
            label="Title"
            description="Shown in the list"
            placeholder="Untitled"
          />
          <FormControl
            type="textarea"
            label="Description"
            placeholder="Write something…"
          />
          <FormControl
            type="select"
            label="Status"
            placeholder="Choose a status"
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Paid', value: 'paid' },
            ]}
          />
          <FormControl type="checkbox" label="Notify the team" />
          <FormControl
            type="combobox"
            label="Assignee"
            placeholder="Search people…"
            options={[
              { label: 'Alex Rivera', value: 'alex' },
              { label: 'Sam Lee', value: 'sam' },
              { label: 'Jordan Park', value: 'jordan' },
            ]}
          />
          <FormControl
            type="multiselect"
            label="Labels"
            placeholder="Add labels…"
            options={[
              { label: 'Bug', value: 'bug' },
              { label: 'Feature', value: 'feature' },
              { label: 'Docs', value: 'docs' },
            ]}
          />
          <FormControl
            type="date"
            label="Due date"
            placeholder="Pick a date"
            clearable
          />
          <FormControl
            label="Slug"
            error="That slug is taken"
            value="settings"
          />
        </div>
        <div class="flex max-w-sm flex-col gap-1.5">
          <FormLabel label="Workspace" id="ws" required />
          <TextInput id="ws" placeholder="acme" />
          <ErrorMessage id="ws-error" message="Workspace is already taken" />
        </div>
      </Section>

      <Section title="More components">
        <div class="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { label: 'Home', route: '/' },
              { label: 'Projects', route: '/projects' },
              { label: 'New' },
            ]}
          />
          <div class="flex flex-wrap items-center gap-3">
            <Dropdown
              options={[
                { label: 'Edit', value: 'edit', icon: 'lucide-pencil' },
                { label: 'Duplicate', value: 'duplicate' },
                { label: 'Delete', value: 'delete', danger: true },
              ]}
              onSelect={(value) => toast.info({ title: `Selected: ${value}` })}
            >
              Actions
            </Dropdown>
            <ContextMenu.Root
              onSelect={(value) => toast.info({ title: `Selected: ${value}` })}
            >
              <ContextMenu.Trigger class="rounded-4 border border-dashed border-outline-gray-2 px-3 py-1.5 text-base text-ink-gray-6">
                Right-click me
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item value="copy">Copy</ContextMenu.Item>
                <ContextMenu.Item value="rename">Rename</ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
            <KeyboardShortcut combo="Mod+I" />
          </div>
          <div class="flex max-w-sm flex-col gap-4">
            <Duration label="Estimate" />
            <TimePicker label="Start time" />
          </div>
          <button
            type="button"
            class="w-fit rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base"
            onClick={() => setSheet(true)}
          >
            Open bottom sheet
          </button>
          <BottomSheet open={sheet()} title="Filters" onOpenChange={setSheet}>
            <p class="text-base text-ink-gray-7">Sheet body.</p>
          </BottomSheet>
          <div class="grid gap-6 md:grid-cols-2">
            <Tree.Root items={TREE_ITEMS}>
              <Tree.Label>Files</Tree.Label>
              <Tree.Tree>
                <For each={TREE_ITEMS}>
                  {(node, index) => (
                    <Tree.Node node={node} indexPath={[index()]} />
                  )}
                </For>
              </Tree.Tree>
            </Tree.Root>
            <FileUploader
              label="Attachments"
              description="Drop files or click to browse"
              multiple
            />
          </div>
        </div>
      </Section>

      <Section title="Overlays">
        <div class="flex flex-wrap items-center gap-3">
          <Menu.Root
            onSelect={(value) => toast.info({ title: `Selected: ${value}` })}
          >
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

          <HoverCard.Root>
            <HoverCard.Trigger class="cursor-default rounded-4 px-2 py-1 text-base text-ink-blue-6 underline decoration-dotted">
              @talel
            </HoverCard.Trigger>
            <HoverCard.Content>
              <p class="text-sm text-ink-gray-7">
                Hover card content — opens after a delay, closes on leave.
              </p>
            </HoverCard.Content>
          </HoverCard.Root>

          <button
            type="button"
            class="rounded-4 bg-surface-green-7 px-3 py-1.5 text-base text-white"
            onClick={() =>
              toast.success({
                title: 'Saved',
                description: 'All changes stored',
              })
            }
          >
            Show toast
          </button>
          <button
            type="button"
            class="rounded-4 bg-surface-red-7 px-3 py-1.5 text-base text-white"
            onClick={() => toast.error({ title: 'Something failed' })}
          >
            Error toast
          </button>
        </div>
      </Section>
    </div>
  )
}
