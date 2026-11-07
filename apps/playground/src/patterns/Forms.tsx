import { createAppForm, type FieldConfig } from '@talelk/newui-data/form'
import { Alert, Card } from '@talelk/newui-molecules'
import { Wizard, type WizardStepField } from '@talelk/newui-organisms'
import { createSignal, Show } from 'solid-js'

interface Setup {
  workspace: string
  invite: boolean
  email: string
}

/** One document, declared once; the steps slice it by field name. */
const ui: Record<string, FieldConfig<Setup>> = {
  workspace: {
    type: 'text',
    label: 'Workspace name',
    required: true,
    description: 'At least two characters.',
  },
  invite: {
    type: 'checkbox',
    label: 'Invite a teammate',
    description: 'The invitation is prepared locally; nothing is sent.',
  },
  email: {
    type: 'email',
    label: 'Teammate email',
    when: (values) => values.invite,
  },
}

const fields = (...names: string[]): WizardStepField<Setup>[] =>
  names.map((name) => ({ name, ...ui[name] }))

/** Multi-step setup: the Wizard owns the steps, the gate and the review. */
export default function Forms() {
  const [done, setDone] = createSignal(false)
  const app = createAppForm<Setup>({
    defaultValues: { workspace: '', invite: false, email: '' },
    ui,
    onSubmit: () => {
      setDone(true)
    },
  })
  const saved = app.form.useSelector((state) => state.values)

  return (
    <div class="flex max-w-3xl flex-col gap-section-gap">
      <Show
        when={!done()}
        fallback={
          <Card padding="md">
            <Alert
              theme="green"
              title="Workspace setup complete"
              description={`${saved().workspace} is ready${
                saved().invite
                  ? `; an invitation is prepared for ${saved().email}`
                  : ''
              }.`}
            />
          </Card>
        }
      >
        <Card padding="md">
          <Wizard
            label="Workspace setup"
            submitLabel="Create workspace"
            form={app.form}
            steps={[
              {
                id: 'workspace',
                label: 'Workspace',
                description: 'Set the identity first.',
                content: fields('workspace'),
                validate: (values) =>
                  values.workspace.trim().length >= 2
                    ? undefined
                    : 'Enter a workspace name of at least two characters',
              },
              {
                id: 'team',
                label: 'Team',
                description: 'Prepare an invitation, or not.',
                content: fields('invite', 'email'),
                validate: (values) =>
                  !values.invite || values.email.includes('@')
                    ? undefined
                    : { email: 'Enter a valid email address or turn it off' },
              },
            ]}
            review
          />
        </Card>
      </Show>
    </div>
  )
}
