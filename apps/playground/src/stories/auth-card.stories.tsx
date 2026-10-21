import { Button, TextInput } from '@talelk/newui-atoms'
import { AuthCard } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  return (
    <DemoFrame>
      <AuthCard
        title="Sign in to Acme"
        description="Use your work email to continue."
        // Lucide has no brand glyphs: a white-label provider passes its own
        // mark as a component. These stand-ins keep the demo independent.
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

const meta = {
  title: 'Organisms/AuthCard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}
