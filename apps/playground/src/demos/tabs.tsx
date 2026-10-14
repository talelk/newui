import { Tabs } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <Tabs.Root defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one" icon="lucide-house" label="One" />
        <Tabs.Trigger value="two" label="Two" />
      </Tabs.List>
      <Tabs.Content value="one">First panel</Tabs.Content>
      <Tabs.Content value="two">Second panel</Tabs.Content>
    </Tabs.Root>
  )
}
