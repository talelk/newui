import { Button, TextInput } from '@talelk/newui-atoms'
import { AuthCard } from '@talelk/newui-organisms'
import { AuthLayout } from '@talelk/newui-templates'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/** Centered public-access frame around the auth organism. */
export function Demo() {
  return (
    <AuthLayout
      brand={
        <span class="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            class="lucide-boxes size-6 text-ink-blue-6"
          />
          Acme
        </span>
      }
    >
      <AuthCard
        title="Sign in to Acme"
        description="Your workspace is waiting."
        footer={
          <span class="text-caption text-ink-gray-7">
            Need an account? Ask your administrator.
          </span>
        }
      >
        <form
          class="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextInput label="Email" type="email" value="rhea@acme.test" />
          <TextInput label="Password" type="password" value="••••••••" />
          <Button type="submit" variant="solid" theme="blue">
            Sign in
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

const meta = {
  title: 'Templates/AuthLayout',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The desktop-only context panel beside the flow, plus header controls. */
export const Aside: Story = {
  render: () => (
    <AuthLayout
      brand={
        <span class="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            class="lucide-boxes size-6 text-ink-blue-6"
          />
          Acme
        </span>
      }
      header={
        <a class="text-caption text-ink-gray-7" href="/">
          ← Back to the site
        </a>
      }
      aside={
        <div class="flex flex-col gap-3 self-center">
          <p class="text-section font-semibold">
            Your workspace, ready on day one.
          </p>
          <p class="max-w-sm text-p-sm">
            Projects, billing and reports in one place. Sign in to pick up where
            your team left off.
          </p>
        </div>
      }
    >
      <AuthCard
        title="Sign in to Acme"
        description="Your workspace is waiting."
      >
        <form
          class="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextInput label="Email" type="email" value="rhea@acme.test" />
          <TextInput label="Password" type="password" value="••••••••" />
          <Button type="submit" variant="solid" theme="blue">
            Sign in
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  ),
}
