import { ToggleGroup } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-wrap items-center gap-8">
      <ToggleGroup.Root
        variant="subtle"
        aria-label="Text alignment"
        defaultValue={['start']}
      >
        <ToggleGroup.Item
          value="start"
          icon="lucide-align-left"
          aria-label="Left"
        />
        <ToggleGroup.Item
          value="center"
          icon="lucide-align-center"
          aria-label="Centre"
        />
        <ToggleGroup.Item
          value="end"
          icon="lucide-align-right"
          aria-label="Right"
        />
      </ToggleGroup.Root>
      <ToggleGroup.Root
        variant="outline"
        size="md"
        aria-label="Density"
        defaultValue={['comfortable']}
      >
        <ToggleGroup.Item value="compact">Compact</ToggleGroup.Item>
        <ToggleGroup.Item value="comfortable">Comfortable</ToggleGroup.Item>
        <ToggleGroup.Item value="spacious">Spacious</ToggleGroup.Item>
      </ToggleGroup.Root>
      <ToggleGroup.Root variant="ghost" multiple aria-label="Filters">
        <ToggleGroup.Item value="mine" icon="lucide-user" aria-label="Mine" />
        <ToggleGroup.Item
          value="unread"
          icon="lucide-mail"
          aria-label="Unread"
        />
        <ToggleGroup.Item
          value="flagged"
          icon="lucide-flag"
          aria-label="Flagged"
        />
      </ToggleGroup.Root>
    </div>
  )
}
