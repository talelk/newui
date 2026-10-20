import { first, optionsOf } from '@newui/data'
import { createAppForm, Form, fieldError } from '@newui/data/form'
import {
  Alert,
  Button,
  Card,
  Divider,
  Select,
  Switch,
  TextInput,
} from '@newui/ui'
import { createSignal, type JSX, Show } from 'solid-js'
import { Shell } from '../shell/Shell'
import { resolved } from '../shell/theme'

const TIMEZONES = ['UTC', 'Europe/Berlin', 'Asia/Beirut', 'Asia/Tokyo']

/**
 * The settings screen.
 *
 * The same form surface the create dialog uses, at page scale: `createAppForm`
 * owns the submit lifecycle and `fieldError` maps each field's error list to the
 * single string the control takes. A page does not need a second form library
 * for a settings screen.
 */
export function Settings(): JSX.Element {
  const [saved, setSaved] = createSignal(false)
  const { form, submitting } = createAppForm({
    defaultValues: {
      workspace: 'Acme',
      timezone: 'UTC',
      weeklyDigest: true,
      mentions: true,
    },
    onSubmit: async () => {
      // Stands in for `repository.update` — the point is the lifecycle, not the
      // destination.
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSaved(true)
    },
  })

  return (
    <Shell
      title="Workspace settings"
      description="A second screen, composed from the same parts: the frame, the form surface and the feedback."
      sections={[{ label: 'Workspace', href: '/' }, { label: 'Settings' }]}
    >
      <div class="flex max-w-2xl flex-col gap-4">
        <Show when={saved()}>
          <Alert
            theme="green"
            title="Settings saved."
            dismissible
            onDismiss={() => setSaved(false)}
          />
        </Show>

        <Card class="p-4">
          <Form form={form} class="flex flex-col gap-5">
            <div>
              <h2 class="text-section">General</h2>
              <p class="text-caption text-ink-gray-7">
                How the workspace introduces itself.
              </p>
            </div>

            <form.Field
              name="workspace"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 2 ? 'Name the workspace.' : undefined,
                onSubmit: ({ value }) =>
                  value.trim().length < 2 ? 'Name the workspace.' : undefined,
              }}
            >
              {(field) => (
                <TextInput
                  label="Workspace name"
                  required
                  value={field().state.value}
                  error={fieldError(field())}
                  onInput={(event) =>
                    field().handleChange(event.currentTarget.value)
                  }
                />
              )}
            </form.Field>

            <form.Field name="timezone">
              {(field) => (
                <Select
                  label="Timezone"
                  options={optionsOf(TIMEZONES)}
                  value={[field().state.value]}
                  onValueChange={(value) =>
                    field().handleChange(first(value, 'UTC'))
                  }
                />
              )}
            </form.Field>

            <Divider />

            <div>
              <h2 class="text-section">Notifications</h2>
              <p class="text-caption text-ink-gray-7">
                What lands in the inbox, and what waits.
              </p>
            </div>

            <form.Field name="weeklyDigest">
              {(field) => (
                <Switch
                  label="Weekly digest"
                  description="One summary every Monday morning."
                  checked={field().state.value}
                  onCheckedChange={(checked) => field().handleChange(checked)}
                />
              )}
            </form.Field>

            <form.Field name="mentions">
              {(field) => (
                <Switch
                  label="Mentions"
                  description="Notify me when someone names me in a comment."
                  checked={field().state.value}
                  onCheckedChange={(checked) => field().handleChange(checked)}
                />
              )}
            </form.Field>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-caption text-ink-gray-7">
                Current appearance: {resolved()}.
              </p>
              <Button
                type="submit"
                variant="solid"
                theme="blue"
                loading={submitting()}
              >
                Save settings
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Shell>
  )
}
