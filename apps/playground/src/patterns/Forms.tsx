import { Button, Switch, TextInput } from '@talelk/newui-atoms'
import { Alert, Card } from '@talelk/newui-molecules'
import { createSignal, For, Show } from 'solid-js'

const STEPS = ['Workspace', 'Team', 'Review']

/** Multi-step form composition; the wizard state stays application-owned. */
export default function Forms() {
  const [step, setStep] = createSignal(0)
  const [workspace, setWorkspace] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [invite, setInvite] = createSignal(true)
  const [error, setError] = createSignal('')
  const [complete, setComplete] = createSignal(false)

  const advance = () => {
    setError('')
    if (step() === 0 && workspace().trim().length < 2) {
      setError('Enter a workspace name to continue.')
      return
    }
    if (step() === 1 && invite() && !email().includes('@')) {
      setError('Enter a valid email address or turn off the invitation.')
      return
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  return (
    <div class="flex max-w-3xl flex-col gap-section-gap">
      <ol
        aria-label="Workspace setup steps"
        class="grid gap-control-gap sm:grid-cols-3"
      >
        <For each={STEPS}>
          {(label, index) => (
            <li
              aria-current={index() === step() ? 'step' : undefined}
              class={`border-t-2 pt-control-pad text-caption ${index() <= step() ? 'border-outline-blue-5 text-ink-blue-8' : 'border-outline-gray-2 text-ink-gray-6'}`}
            >
              <span class="me-1 font-semibold tabular-nums">
                0{index() + 1}
              </span>
              {label}
            </li>
          )}
        </For>
      </ol>

      <Card padding="md" class="gap-field-gap">
        <Show
          when={!complete()}
          fallback={
            <Alert
              theme="green"
              title="Workspace setup complete"
              description={`${workspace()} is ready${invite() ? `; an invitation is prepared for ${email()}` : ''}.`}
            />
          }
        >
          <form
            class="flex flex-col gap-field-gap"
            onSubmit={(event) => {
              event.preventDefault()
              if (step() === STEPS.length - 1) setComplete(true)
              else advance()
            }}
          >
            <div>
              <h2 class="text-section">{STEPS[step()]}</h2>
              <p class="mt-control-gap text-caption text-ink-gray-7">
                {step() === 0
                  ? 'Set the workspace identity before inviting your team.'
                  : step() === 1
                    ? 'Choose whether to prepare a teammate invitation.'
                    : 'Review the setup before creating the workspace.'}
              </p>
            </div>

            <Show when={step() === 0}>
              <TextInput
                label="Workspace name"
                required
                value={workspace()}
                error={error() || undefined}
                onInput={(event) => setWorkspace(event.currentTarget.value)}
              />
            </Show>

            <Show when={step() === 1}>
              <Switch
                label="Invite a teammate"
                description="The invitation is prepared locally; nothing is sent."
                checked={invite()}
                onCheckedChange={setInvite}
              />
              <Show when={invite()}>
                <TextInput
                  label="Teammate email"
                  type="email"
                  required
                  value={email()}
                  error={error() || undefined}
                  onInput={(event) => setEmail(event.currentTarget.value)}
                />
              </Show>
            </Show>

            <Show when={step() === 2}>
              <dl class="grid gap-control-gap rounded-card bg-surface-gray-1 p-card-pad-compact sm:grid-cols-2">
                <div>
                  <dt class="text-caption text-ink-gray-6">Workspace</dt>
                  <dd class="text-interface font-medium">{workspace()}</dd>
                </div>
                <div>
                  <dt class="text-caption text-ink-gray-6">Team invitation</dt>
                  <dd class="text-interface font-medium">
                    {invite() ? email() : 'No invitation'}
                  </dd>
                </div>
              </dl>
            </Show>

            <Show when={error() && step() > 0}>
              <Alert theme="red" title={error()} />
            </Show>

            <div class="flex flex-wrap justify-between gap-control-gap border-t border-outline-gray-1 pt-card-pad-compact">
              <Button
                type="button"
                variant="outline"
                disabled={step() === 0}
                onClick={() => {
                  setError('')
                  setStep((current) => Math.max(0, current - 1))
                }}
              >
                Back
              </Button>
              <Show
                when={step() < STEPS.length - 1}
                fallback={
                  <Button type="submit" variant="solid" theme="blue">
                    Create workspace
                  </Button>
                }
              >
                <Button
                  type="button"
                  variant="solid"
                  theme="blue"
                  onClick={advance}
                >
                  Continue
                </Button>
              </Show>
            </div>
          </form>
        </Show>
      </Card>
    </div>
  )
}
