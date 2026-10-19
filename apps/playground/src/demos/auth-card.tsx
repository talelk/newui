import { AuthCard } from '@newui/blocks'
import { Button, TextInput } from '@newui/ui'
import type { JSX } from 'solid-js'
import { DemoFrame } from './demo-frame'

/** Registered in `demos.ts`; rendered by `/play` and the reference pages. */
export default function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <AuthCard
        title="Sign in to Acme"
        description="Use your work email to continue."
        // Lucide has no brand glyphs: a white-label provider passes its own
        // mark as a component. These stand-ins keep the demo self-contained.
        providers={[
          { label: 'Continue with SSO', icon: 'lucide-key-round' },
          { label: 'Continue with a passkey', icon: 'lucide-fingerprint' },
        ]}
        footer={<span>Don’t have an account? Ask an admin for an invite.</span>}
      >
        <TextInput label="Email" type="email" placeholder="you@acme.com" />
        <TextInput label="Password" type="password" placeholder="••••••••" />
        <Button variant="solid" class="w-full">
          Sign in
        </Button>
      </AuthCard>
    </DemoFrame>
  )
}
