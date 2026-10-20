import { Button, Combobox, Dialog, KeyboardShortcut } from '@newui/ui'
import { useNavigate } from '@solidjs/router'
import { createSignal, onCleanup, onMount } from 'solid-js'

const COMMANDS = [
  {
    label: 'Open analytics',
    value: '/pages/analytics',
    group: 'Workspace',
    icon: 'lucide-chart-no-axes-combined',
  },
  {
    label: 'Open tasks',
    value: '/pages/tasks',
    group: 'Workspace',
    icon: 'lucide-list-checks',
  },
  {
    label: 'Open mail',
    value: '/pages/mail',
    group: 'Workspace',
    icon: 'lucide-mail',
  },
  {
    label: 'Workspace settings',
    value: '/pages/settings',
    group: 'Preferences',
    icon: 'lucide-settings-2',
  },
  {
    label: 'Read the installation guide',
    value: '/docs',
    group: 'Documentation',
    icon: 'lucide-book-open',
  },
]
const COMMAND_OPTIONS = ['Workspace', 'Preferences', 'Documentation'].map(
  (group) => ({
    group,
    options: COMMANDS.filter((command) => command.group === group),
  }),
)
export default function Command() {
  const navigate = useNavigate()
  const [open, setOpen] = createSignal(false)
  const run = (value: string | null) => {
    if (value) {
      setOpen(false)
      navigate(value)
    }
  }
  onMount(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    document.addEventListener('keydown', handle)
    onCleanup(() => document.removeEventListener('keydown', handle))
  })
  return (
    <div class="flex max-w-xl flex-col gap-6">
      <section>
        <h2 class="mb-3 text-section">Find an action</h2>
        <Combobox
          label="Search workspace actions"
          description="Type a destination, then use arrow keys and Enter to open it."
          options={COMMAND_OPTIONS}
          onValueChange={run}
          placeholder="Search commands…"
        />
      </section>
      <div class="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <KeyboardShortcut combo="Mod+K" />
      </div>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Where would you like to go?</Dialog.Title>
            <Dialog.Description>
              Search workspace actions and documentation.
            </Dialog.Description>
          </Dialog.Header>
          <div class="mt-5">
            <Combobox
              label="Command palette search"
              options={COMMAND_OPTIONS}
              onValueChange={run}
              placeholder="Type a command…"
            />
          </div>
          <p class="mt-4 text-caption text-ink-gray-7">
            Arrow keys to choose · Enter to open · Escape to close
          </p>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
