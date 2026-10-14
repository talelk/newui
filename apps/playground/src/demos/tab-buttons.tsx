import { TabButtons } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
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
  )
}
