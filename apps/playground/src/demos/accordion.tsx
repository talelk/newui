import { Accordion } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <div class="max-w-md">
      <Accordion.Root defaultValue={['tokens']}>
        <Accordion.Item value="tokens">
          <Accordion.Trigger icon="lucide-palette">Tokens</Accordion.Trigger>
          <Accordion.Content>
            Semantic colour, type, radius and elevation. The whole system
            retunes by overriding three custom-property families.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="components">
          <Accordion.Trigger icon="lucide-box">Components</Accordion.Trigger>
          <Accordion.Content>
            Atoms over Zag primitives — keyboard, focus and ARIA come from the
            machine, never from hand-written handlers.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="legacy" disabled>
          <Accordion.Trigger icon="lucide-archive">Legacy</Accordion.Trigger>
          <Accordion.Content>Not available.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  )
}
