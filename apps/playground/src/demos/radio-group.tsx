import { RadioGroup } from '@newui/ui'
import type { JSX } from 'solid-js'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
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
  )
}
