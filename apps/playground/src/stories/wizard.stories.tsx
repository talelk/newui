import { Button } from '@talelk/newui-atoms'
import { createConfigStore } from '@talelk/newui-data'
import { createAppForm, type FieldConfig } from '@talelk/newui-data/form'
import { Wizard, type WizardStepField } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

interface Setup {
  workspace: string
  plan: string
  seats: number
  invite: boolean
  email: string
}

/** The whole document, in one place — the wizard's steps slice it up. */
const ui: Record<string, FieldConfig<Setup>> = {
  workspace: { type: 'text', label: 'Workspace name', required: true },
  plan: {
    type: 'select',
    label: 'Plan',
    options: [
      { label: 'Team', value: 'team' },
      { label: 'Business', value: 'business' },
    ],
  },
  seats: { type: 'number', label: 'Seats' },
  invite: { type: 'checkbox', label: 'Invite a teammate' },
  email: {
    type: 'email',
    label: 'Teammate email',
    when: (values) => values.invite,
  },
}

/** The named slice of `ui` that one step owns. */
const fields = (...names: string[]): WizardStepField<Setup>[] =>
  names.map((name) => ({ name, ...ui[name] }))

function useSetup() {
  return createAppForm<Setup>({
    defaultValues: {
      workspace: '',
      plan: 'team',
      seats: 3,
      invite: false,
      email: '',
    },
    ui,
    onSubmit: () => {},
  })
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  const app = useSetup()
  return (
    <div class="max-w-2xl">
      <Wizard
        label="Workspace setup"
        submitLabel="Create workspace"
        form={app.form}
        steps={[
          {
            id: 'workspace',
            label: 'Workspace',
            content: fields('workspace', 'plan', 'seats'),
            validate: (values) =>
              values.workspace.trim().length >= 2
                ? undefined
                : 'Enter a workspace name of at least two characters',
          },
          {
            id: 'team',
            label: 'Team',
            content: fields('invite', 'email'),
            validate: (values) =>
              !values.invite || values.email.includes('@')
                ? undefined
                : { email: 'Enter a valid email address' },
          },
        ]}
        review
      />
    </div>
  )
}

const meta = {
  title: 'Organisms/Patterns/Wizard',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** The generated summary closes the flow: every field, read-only. */
export const Review: Story = {
  render: () => (
    <div class="max-w-2xl">
      <Wizard
        label="Workspace setup"
        submitLabel="Create workspace"
        form={useSetup().form}
        currentStep="review"
        steps={[
          {
            id: 'workspace',
            label: 'Workspace',
            content: fields('workspace', 'plan', 'seats'),
          },
          { id: 'team', label: 'Team', content: fields('invite', 'email') },
        ]}
        review
      />
    </div>
  ),
}

/** A step that will not let you past it, with the reason on the field. */
export const Invalid: Story = {
  render: () => (
    <div class="max-w-2xl">
      <Wizard
        label="Workspace setup"
        form={useSetup().form}
        steps={[
          {
            id: 'workspace',
            label: 'Workspace',
            content: fields('workspace', 'plan', 'seats'),
            validate: () => 'Enter a workspace name to continue',
          },
          { id: 'team', label: 'Team', content: fields('invite', 'email') },
        ]}
      />
    </div>
  ),
}

/** Resume: the same wizard, remembering where it was left. */
export const Resumed: Story = {
  render: () => {
    const app = useSetup()
    const store = createConfigStore({ key: 'newui.wizard' })
    return (
      <div class="flex max-w-2xl flex-col gap-6">
        <Wizard
          label="Workspace setup"
          submitLabel="Create workspace"
          form={app.form}
          steps={[
            {
              id: 'workspace',
              label: 'Workspace',
              content: fields('workspace', 'plan', 'seats'),
            },
            { id: 'team', label: 'Team', content: fields('invite', 'email') },
          ]}
          resume={{ id: 'storybook-setup', store }}
          review
        />
        <Button
          variant="outline"
          onClick={() => store.remove('storybook-setup')}
        >
          Forget it
        </Button>
      </div>
    )
  },
}
