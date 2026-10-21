import { Avatar, Badge, Button, Switch } from '@talelk/newui-atoms'
import { createSignal, type JSX } from 'solid-js'

/**
 * Real components on the home page, in their own chunk.
 *
 * `Home` dynamic-imports this module only when the section scrolls into
 * view, so the home route's initial cost stays shell-only (its budget is
 * the tightest on the site) while the preview below is the genuine
 * article — working switch, loading state and all — not a screenshot.
 */
export default function HomePreviews(): JSX.Element {
  const [loading, setLoading] = createSignal(false)
  const [notify, setNotify] = createSignal(true)
  const save = () => {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }
  return (
    <div class="flex min-h-44 flex-col justify-center gap-5 rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4 sm:p-5">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid" theme="blue" loading={loading()} onClick={save}>
          {loading() ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button
          variant="subtle"
          theme="red"
          icon="lucide-trash-2"
          aria-label="Delete (preview)"
        />
      </div>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Switch
          label="Email notifications"
          checked={notify()}
          onCheckedChange={setNotify}
        />
        <div class="flex items-center gap-2">
          <Badge theme="green">Paid</Badge>
          <Badge theme="amber">Pending</Badge>
          <Badge theme="gray">Draft</Badge>
        </div>
        <div class="flex -space-x-2">
          <Avatar label="Rhea Kapoor" />
          <Avatar label="Tomas Lind" />
          <Avatar label="Amara Chen" />
        </div>
      </div>
      <p class="text-caption text-ink-gray-7" role="status">
        {notify()
          ? 'Notifications on — every control here is live; try the switch or save.'
          : 'Notifications off — state is a signal you own, never a string.'}
      </p>
    </div>
  )
}
