import { Button } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="solid" theme="gray">
          Solid
        </Button>
        <Button variant="solid" theme="blue">
          Primary
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
  )
}
