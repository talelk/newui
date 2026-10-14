import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ContextMenu,
  Duration,
  FileUploader,
  HoverCard,
  Icon,
  ItemListRow,
  KeyboardShortcut,
  KeyboardShortcutsDialog,
  List,
  ListCell,
  ListRow,
  Menu,
  NumberInput,
  Password,
  Popover,
  ScrollArea,
  SettingsDialog,
  Skeleton,
  Switch,
  TextInput,
  TimePicker,
  Tooltip,
  Tree,
  type TreeItem,
  toast,
} from '@newui/ui'
import { createSignal, For, type JSX } from 'solid-js'

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

function Tile(props: { title: string; hint?: string; children: JSX.Element }) {
  return (
    <Card class="flex flex-col gap-3">
      <CardHeader class="flex items-baseline justify-between gap-2">
        <CardTitle>{props.title}</CardTitle>
        <span class="text-xs text-ink-gray-5">{props.hint}</span>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">{props.children}</CardContent>
    </Card>
  )
}

/**
 * A card grid of self-contained component examples — the visual acceptance
 * surface, one tile per example. Only stable components are used here; the
 * showcase page (`Atoms`) carries the exhaustive variant matrix.
 */
export function Gallery() {
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [tab, setTab] = createSignal('profile')
  const [shortcutsOpen, setShortcutsOpen] = createSignal(false)

  return (
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h2 class="text-2xl-semibold text-ink-gray-9">Examples</h2>
        <p class="text-base text-ink-gray-6">
          Real, self-contained examples of the library's components.
        </p>
      </header>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile title="Breadcrumbs" hint="navigation">
          <Breadcrumbs
            items={[
              { label: 'Home', route: '/' },
              { label: 'Projects', route: '/projects' },
              { label: 'Website' },
            ]}
          />
        </Tile>

        <Tile title="Actions menu" hint="Dropdown + Menu">
          <div class="flex flex-wrap items-center gap-3">
            <Menu.Root
              onSelect={(v) => toast.info({ title: `Selected: ${v}` })}
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
            <ContextMenu.Root
              onSelect={(v) => toast.info({ title: `Selected: ${v}` })}
            >
              <ContextMenu.Trigger class="rounded-4 border border-dashed border-outline-gray-2 px-3 py-1.5 text-base text-ink-gray-6">
                Right-click me
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item value="copy">Copy</ContextMenu.Item>
                <ContextMenu.Item value="rename">Rename</ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          </div>
        </Tile>

        <Tile title="Inputs" hint="prefix, password, duration">
          <TextInput
            label="Search"
            placeholder="Search…"
            prefix={<Icon icon="lucide-search" class="size-4" />}
          />
          <Password label="Password" placeholder="••••••••" />
          <Duration label="Estimate" />
        </Tile>

        <Tile title="Number & time" hint="NumberInput, TimePicker">
          <NumberInput label="Seats" defaultValue="4" min={1} max={20} />
          <TimePicker label="Starts at" />
        </Tile>

        <Tile title="File upload" hint="dropzone">
          <FileUploader label="Attachments" multiple />
        </Tile>

        <Tile title="Tree" hint="hierarchy">
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
        </Tile>

        <Tile title="List rows" hint="List, ItemListRow">
          <List>
            <ListRow>
              <ListCell>Row one</ListCell>
              <ListCell class="justify-end">
                <Badge theme="green" label="Active" />
              </ListCell>
            </ListRow>
            <ListRow>
              <ListCell>Row two</ListCell>
              <ListCell class="justify-end">
                <Badge theme="amber" label="Pending" />
              </ListCell>
            </ListRow>
          </List>
          <ItemListRow
            active
            prefix={<Icon icon="lucide-house" class="size-4" />}
          >
            Selected row
          </ItemListRow>
        </Tile>

        <Tile title="Overlays" hint="Popover, HoverCard, Tooltip">
          <div class="flex flex-wrap items-center gap-3">
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
                <p class="text-sm text-ink-gray-7">Hover card content.</p>
              </HoverCard.Content>
            </HoverCard.Root>
            <Tooltip text="Add a new item">
              <span class="rounded-4 bg-surface-gray-2 px-3 py-1.5 text-base">
                Hover me
              </span>
            </Tooltip>
          </div>
        </Tile>

        <Tile title="Loading states" hint="Skeleton, ScrollArea">
          <Skeleton lines={2} />
          <ScrollArea.Root class="h-20 rounded-4 border border-outline-gray-1">
            <ScrollArea.Viewport class="p-2">
              <p class="text-base text-ink-gray-7">
                Scrollable content. The viewport scrolls; the track is styled.
              </p>
              <p class="mt-2 text-base text-ink-gray-7">More content below.</p>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar />
          </ScrollArea.Root>
        </Tile>

        <Tile title="Card" hint="composition">
          <div class="rounded-6 border border-outline-gray-1 p-4">
            <p class="text-base-medium text-ink-gray-9">Monthly revenue</p>
            <p class="text-sm text-ink-gray-6">Compared to last month</p>
            <p class="mt-1 text-3xl-semibold text-ink-gray-9">₹4.2L</p>
          </div>
        </Tile>
        <Tile title="Settings" hint="SettingsDialog">
          <button
            type="button"
            class="w-fit rounded-4 bg-surface-gray-10 px-3 py-1.5 text-base text-ink-base"
            onClick={() => setSettingsOpen(true)}
          >
            Open settings
          </button>
          <SettingsDialog.Root
            open={settingsOpen()}
            onOpenChange={setSettingsOpen}
            value={tab()}
            onValueChange={setTab}
          >
            <SettingsDialog.Sidebar>
              <SettingsDialog.NavGroup label="User settings">
                <SettingsDialog.NavItem value="profile">
                  Profile
                </SettingsDialog.NavItem>
                <SettingsDialog.NavItem value="notifications">
                  Notifications
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
            </SettingsDialog.Content>
          </SettingsDialog.Root>
        </Tile>

        <Tile title="Shortcuts" hint="KeyboardShortcut + dialog">
          <div class="flex flex-wrap items-center gap-3">
            <KeyboardShortcut combo="Mod+K" />
            <KeyboardShortcut combo="Mod+Shift+P" />
            <button
              type="button"
              class="rounded-4 border border-outline-gray-2 px-2.5 py-1 text-base text-ink-gray-8"
              onClick={() => setShortcutsOpen(true)}
            >
              All shortcuts
            </button>
          </div>
          <KeyboardShortcutsDialog
            open={shortcutsOpen()}
            onOpenChange={setShortcutsOpen}
            shortcuts={[
              { group: 'General', label: 'Command palette', combo: 'Mod+K' },
              { group: 'General', label: 'Search', combo: 'Mod+F' },
              { group: 'Editing', label: 'Save', combo: 'Mod+S' },
            ]}
          />
        </Tile>
      </div>
    </div>
  )
}
