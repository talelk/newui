import { AuthCard } from '@newui/blocks'
import { Badge, Button, Password, TabButtons, TextInput } from '@newui/ui'
import { A } from '@solidjs/router'
import { createForm } from '@tanstack/solid-form'
import { createSignal, type JSX, Show } from 'solid-js'
import { ThemeMenu } from '../shell/ThemeMenu'

export function Authentication(): JSX.Element {
  const [mode, setMode] = createSignal('login')
  const [session, setSession] = createSignal('')
  const [email, setEmail] = createSignal('')
  const form = createForm(() => ({
    defaultValues: { email: '', password: '', name: '' },
    onSubmit: async ({ value, formApi }) => {
      await new Promise((resolve) => setTimeout(resolve, 160))
      setEmail(value.email)
      setSession(
        mode() === 'link'
          ? 'Check your demo inbox'
          : mode() === 'signup'
            ? 'Your demo workspace is ready'
            : 'Welcome back',
      )
      formApi.reset()
    },
  }))
  const pending = form.useSelector((state) => state.isSubmitting)
  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? undefined
      : 'Enter a valid email address.'
  const changeMode = (value: string) => {
    setMode(value)
    setSession('')
    form.reset()
  }
  return (
    <main class="grid min-h-screen bg-surface-gray-1 text-interface text-ink-gray-9 lg:grid-cols-2">
      <aside class="hidden flex-col justify-between bg-surface-blue-8 p-6 text-ink-base lg:flex">
        <A
          href="/"
          class="flex w-fit items-center gap-2 rounded-3 text-section focus-visible:focus-ring"
        >
          <img src="/favicon.svg" alt="" class="size-8" />
          newui
        </A>
        <div class="max-w-lg">
          <p class="mb-5 text-caption">The workspace for what comes next</p>
          <h2 class="text-hero">Good work starts with a clear view.</h2>
          <p class="mt-6 text-lg">
            Your projects, customers and numbers. One thoughtfully composed
            workspace, built around your team.
          </p>
        </div>
        <p class="text-caption">Acme workspace · Authentication example</p>
      </aside>
      <div class="relative">
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <A
            href="/examples"
            class="rounded-3 text-caption text-ink-gray-7 focus-visible:focus-ring"
          >
            <span
              aria-hidden="true"
              class="lucide-arrow-left inline-block size-4 align-middle"
            />{' '}
            Examples
          </A>
          <ThemeMenu />
        </div>
        <AuthCard
          title={
            session() ||
            (mode() === 'signup'
              ? 'Create your account'
              : mode() === 'link'
                ? 'Sign in with email'
                : 'Welcome back')
          }
          description={
            session()
              ? email() || 'GitHub demo session'
              : 'A little clarity. A lot of possibility.'
          }
          logo={<Badge theme="blue">Interactive demo</Badge>}
          providers={
            session()
              ? undefined
              : [
                  {
                    label: 'GitHub demo',
                    onClick: () => {
                      setEmail('')
                      setSession('GitHub demo session ready')
                    },
                  },
                ]
          }
          footer={
            session() ? undefined : 'Demo only. Credentials stay on this page.'
          }
        >
          <Show
            when={!session()}
            fallback={
              <div class="flex flex-col gap-4 text-center">
                <p role="status" class="text-ink-gray-7">
                  {mode() === 'link'
                    ? 'Your local demo sign-in link is ready. No email was sent.'
                    : 'Your local demo session is ready to explore.'}
                </p>
                <Button
                  route="/examples/analytics/fullscreen"
                  variant="solid"
                  theme="blue"
                >
                  Open the dashboard
                </Button>
                <Button variant="outline" onClick={() => setSession('')}>
                  Back to sign in
                </Button>
              </div>
            }
          >
            <TabButtons
              fluid
              value={mode()}
              onValueChange={changeMode}
              options={[
                { label: 'Sign in', value: 'login' },
                { label: 'Sign up', value: 'signup' },
                { label: 'Email link', value: 'link' },
              ]}
            />
            <form
              noValidate
              class="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              <Show when={mode() === 'signup'}>
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      mode() === 'signup' && value.trim().length < 2
                        ? 'Enter your name.'
                        : undefined,
                  }}
                >
                  {(field) => (
                    <TextInput
                      label="Full name"
                      required
                      value={field().state.value}
                      error={
                        field().state.meta.errors.length
                          ? field().state.meta.errors.join(' ')
                          : undefined
                      }
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                    />
                  )}
                </form.Field>
              </Show>
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => validateEmail(value),
                  onSubmit: ({ value }) => validateEmail(value),
                }}
              >
                {(field) => (
                  <TextInput
                    label="Work email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={field().state.value}
                    error={
                      field().state.meta.errors.length
                        ? field().state.meta.errors.join(' ')
                        : undefined
                    }
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                  />
                )}
              </form.Field>
              <Show when={mode() !== 'link'}>
                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      mode() !== 'link' && value.length < 8
                        ? 'Use at least 8 characters.'
                        : undefined,
                    onSubmit: ({ value }) =>
                      mode() !== 'link' && value.length < 8
                        ? 'Use at least 8 characters.'
                        : undefined,
                  }}
                >
                  {(field) => (
                    <Password
                      label="Password"
                      required
                      value={field().state.value}
                      error={
                        field().state.meta.errors.length
                          ? field().state.meta.errors.join(' ')
                          : undefined
                      }
                      onValueChange={field().handleChange}
                    />
                  )}
                </form.Field>
              </Show>
              <Button
                type="submit"
                variant="solid"
                theme="blue"
                loading={pending()}
              >
                {mode() === 'signup'
                  ? 'Create account'
                  : mode() === 'link'
                    ? 'Send demo link'
                    : 'Sign in'}
              </Button>
            </form>
            <Button
              variant="ghost"
              onClick={() => changeMode(mode() === 'link' ? 'login' : 'link')}
            >
              {mode() === 'link'
                ? 'Use a password instead'
                : 'Use a sign-in link instead'}
            </Button>
          </Show>
        </AuthCard>
      </div>
    </main>
  )
}
