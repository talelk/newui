import { A } from '@solidjs/router'
import { Button, TextInput } from '@talelk/newui-atoms'
import { isEmail } from '@talelk/newui-data'
import { createAppForm, Form, fieldError } from '@talelk/newui-data/form'
import { Password, TabButtons } from '@talelk/newui-molecules'
import { AuthCard } from '@talelk/newui-organisms'
import { AuthLayout } from '@talelk/newui-templates'
import { createEffect, createSignal, type JSX, Show } from 'solid-js'
import { assetUrl, sitePath } from '../lib/base'
import { ThemeMenu, ThemeMenuCompact } from '../shell/ThemeMenu'

type Mode = 'login' | 'signup' | 'link'
type SessionMethod = 'password' | 'signup' | 'email-link' | 'github'

interface Session {
  method: SessionMethod
  email: string
}

const SESSION_TITLE: Record<SessionMethod, string> = {
  password: "You're signed in",
  signup: 'Your demo workspace is ready',
  'email-link': 'Sign-in link requested',
  github: 'GitHub demo session ready',
}

const SESSION_MESSAGE: Record<SessionMethod, string> = {
  password: 'Your local demo session is ready to explore.',
  signup: 'Your local demo account is ready to explore.',
  'email-link':
    'No email was sent. In a real app, check your inbox for the link; this demo opens the dashboard instead.',
  github:
    'Your local demo GitHub session is ready to explore. No request left this page.',
}

export function Authentication(): JSX.Element {
  const [mode, setMode] = createSignal<Mode>('login')
  const [session, setSession] = createSignal<Session | null>(null)
  const [summary, setSummary] = createSignal('')
  let outcomeHeading: HTMLSpanElement | undefined

  const openSession = (next: Session) => {
    setSummary('')
    setSession(next)
    queueMicrotask(() => outcomeHeading?.focus())
  }

  const { form, submitting } = createAppForm({
    defaultValues: { email: '', password: '', name: '' },
    onSubmit: async (value, api) => {
      const method: SessionMethod =
        mode() === 'link'
          ? 'email-link'
          : mode() === 'signup'
            ? 'signup'
            : 'password'
      await new Promise((resolve) => setTimeout(resolve, 160))
      openSession({ method, email: value.email })
      api.reset()
    },
  })

  const attempts = form.useSelector((state) => state.submissionAttempts)
  const fieldsValid = form.useSelector((state) => state.isFieldsValid)
  let lastFocusedAttempt = 0

  createEffect(() => {
    const attempt = attempts()
    if (attempt === 0) {
      lastFocusedAttempt = 0
      setSummary('')
      return
    }
    if (fieldsValid() || session()) {
      setSummary('')
      return
    }
    if (attempt > lastFocusedAttempt) {
      lastFocusedAttempt = attempt
      setSummary('Check the highlighted fields and try again.')
      queueMicrotask(() => {
        document
          .querySelector<HTMLInputElement>(
            '[data-slot="auth-card"] input[aria-invalid="true"]',
          )
          ?.focus()
      })
    }
  })

  const validateEmail = (value: string) =>
    isEmail(value) ? undefined : 'Enter a valid email address.'

  const changeMode = (value: string) => {
    const next: Mode =
      value === 'signup' ? 'signup' : value === 'link' ? 'link' : 'login'
    const email = form.getFieldValue('email')
    setMode(next)
    setSummary('')
    form.reset()
    if (email) form.setFieldValue('email', email)
  }

  const backToSignIn = () => {
    setMode('login')
    setSummary('')
    form.reset()
    setSession(null)
    queueMicrotask(() => {
      document
        .querySelector<HTMLInputElement>(
          '[data-slot="auth-card"] input[type="email"]',
        )
        ?.focus()
    })
  }

  const cardTitle = () => {
    const current = session()
    if (current) return SESSION_TITLE[current.method]
    return mode() === 'signup'
      ? 'Create your account'
      : mode() === 'link'
        ? 'Sign in with email'
        : 'Welcome back'
  }

  const cardDescription = () => {
    const current = session()
    if (current) return current.email || 'No email address needed'
    return mode() === 'signup'
      ? 'Create your Acme workspace account.'
      : mode() === 'link'
        ? 'Get a sign-in link for your Acme workspace.'
        : 'Sign in to your Acme workspace.'
  }

  const sessionMessage = () => {
    const current = session()
    return current ? SESSION_MESSAGE[current.method] : ''
  }

  return (
    <AuthLayout
      brand={
        <div class="pt-12 lg:hidden">
          <A
            href="/"
            class="flex min-h-10 w-fit items-center gap-2 rounded-3 text-section focus-visible:focus-ring"
          >
            <img src={assetUrl('favicon.svg')} alt="" class="size-8" />
            newui
          </A>
        </div>
      }
      aside={
        <>
          <A
            href="/"
            class="flex w-fit items-center gap-2 rounded-3 text-section focus-visible:focus-ring"
          >
            <img src={assetUrl('favicon.svg')} alt="" class="size-8" />
            newui
          </A>
          <div class="max-w-lg">
            <p class="mb-5 text-caption">The workspace for what comes next</p>
            <p class="text-hero">Good work starts with a clear view.</p>
            <p class="mt-6 text-lg">
              Your projects, customers and numbers. One thoughtfully composed
              workspace, built around your team.
            </p>
            {/* The panel's one Signal-Blue moment: a real link, not decoration. */}
            <A
              href="/pages"
              class="mt-6 flex w-fit items-center gap-1.5 rounded-3 text-interface text-ink-blue-link underline decoration-dotted underline-offset-2 focus-visible:focus-ring"
            >
              Browse the demo applications
              <span aria-hidden="true" class="lucide-arrow-right size-4" />
            </A>
          </div>
          <p class="text-caption">Acme workspace · Authentication example</p>
        </>
      }
      header={
        <>
          <A
            href="/pages"
            class="rounded-3 text-caption text-ink-gray-7 focus-visible:focus-ring"
          >
            <span
              aria-hidden="true"
              class="lucide-arrow-left inline-block size-4 align-middle"
            />{' '}
            Examples
          </A>
          <div class="hidden sm:flex">
            <ThemeMenu />
          </div>
          <div class="flex sm:hidden">
            <ThemeMenuCompact />
          </div>
        </>
      }
    >
      <AuthCard
        title={
          <span
            ref={(element) => {
              outcomeHeading = element
            }}
            tabIndex={-1}
            class="outline-none [overflow-wrap:anywhere]"
          >
            {cardTitle()}
          </span>
        }
        description={cardDescription()}
        error={summary() || undefined}
        providers={
          session()
            ? undefined
            : [
                {
                  label: 'GitHub demo',
                  onClick: () => openSession({ method: 'github', email: '' }),
                },
              ]
        }
        footer={
          session() ? undefined : (
            <span class="flex flex-col items-center gap-2">
              <span class="inline-flex min-h-5 items-center rounded-full bg-surface-gray-2 px-1.5 text-caption text-ink-gray-6">
                Interactive demo
              </span>
              <span class="text-caption text-ink-gray-7">
                Demo only. Credentials stay on this page.
              </span>
            </span>
          )
        }
      >
        <Show
          when={!session()}
          fallback={
            <div class="flex flex-col gap-4 text-center">
              <p role="status" class="text-ink-gray-7">
                {sessionMessage()}
              </p>
              <Button
                route={sitePath('/pages/analytics/fullscreen')}
                variant="solid"
                theme="blue"
              >
                Open the dashboard
              </Button>
              <Button variant="outline" onClick={backToSignIn}>
                Back to sign in
              </Button>
            </div>
          }
        >
          <Show when={mode() !== 'link'}>
            <TabButtons
              label="Account access"
              wrap
              class="self-center"
              value={mode()}
              onValueChange={changeMode}
              options={[
                { label: 'Sign in', value: 'login' },
                { label: 'Sign up', value: 'signup' },
              ]}
            />
          </Show>
          <Form form={form} class="flex flex-col gap-4">
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
                    name="name"
                    autocomplete="name"
                    autocapitalize="words"
                    required
                    value={field().state.value}
                    error={fieldError(field())}
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
                  name="email"
                  type="email"
                  autocomplete="email"
                  inputMode="email"
                  autocapitalize="none"
                  spellcheck={false}
                  required
                  placeholder="you@acme.com"
                  value={field().state.value}
                  error={fieldError(field())}
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
                    name="password"
                    autocomplete={
                      mode() === 'signup' ? 'new-password' : 'current-password'
                    }
                    autocapitalize="none"
                    spellcheck={false}
                    required
                    value={field().state.value}
                    error={fieldError(field())}
                    onValueChange={field().handleChange}
                  />
                )}
              </form.Field>
            </Show>
            <Button
              type="submit"
              variant="solid"
              theme="blue"
              loading={submitting()}
            >
              {mode() === 'signup'
                ? 'Create account'
                : mode() === 'link'
                  ? 'Send demo link'
                  : 'Sign in'}
            </Button>
          </Form>
          <Button
            variant="ghost"
            /* Ghost inside the card reads as body text; the underline is the
               affordance that says this is a control (and a screen reader's
               labelled button alone does not help low-vision sighted users). */
            class="underline decoration-dotted underline-offset-2"
            onClick={() => changeMode(mode() === 'link' ? 'login' : 'link')}
          >
            {mode() === 'link'
              ? 'Use a password instead'
              : 'Use a sign-in link instead'}
          </Button>
        </Show>
      </AuthCard>
    </AuthLayout>
  )
}
