import { A, useNavigate } from '@solidjs/router'
import { Button, TextInput } from '@talelk/newui-atoms'
import { isEmail } from '@talelk/newui-data'
import { createAppForm, Form, fieldError } from '@talelk/newui-data/form'
import { Password } from '@talelk/newui-molecules'
import { AuthCard } from '@talelk/newui-organisms'
import { AuthLayout } from '@talelk/newui-templates'
import type { JSX } from 'solid-js'
import { signIn } from '../data/session'
import { emitStarterEvent } from '../devtools/events'

/**
 * The way in.
 *
 * `AuthCard` is the block — the centred measure, the brand mark, the footer the
 * reader needs. The form is the same `createAppForm` surface the record dialog
 * uses; only the fields differ.
 */
export function SignIn(): JSX.Element {
  const navigate = useNavigate()
  const { form, submitting } = createAppForm({
    defaultValues: { email: 'rhea@acme.test', password: '' },
    onSubmit: async (value) => {
      // Stands in for the request an app would make. The kit ships no auth
      // backend (spec/kit.md), so the starter keeps the shape, not the secret.
      await new Promise((resolve) => setTimeout(resolve, 200))
      signIn({ name: 'Rhea Kapoor', email: value.email })
      emitStarterEvent('session:sign-in', {
        name: 'Rhea Kapoor',
        email: value.email,
      })
      navigate('/')
    },
  })

  const emailError = ({ value }: { value: string }) =>
    isEmail(value) ? undefined : 'Enter a valid email address.'
  const passwordError = ({ value }: { value: string }) =>
    value.length >= 8 ? undefined : 'Use at least 8 characters.'

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in to Acme"
        description="The starter's demo session — no request leaves this page."
        logo={
          <span
            aria-hidden="true"
            class="lucide-boxes size-8 text-ink-blue-6"
          />
        }
        footer={
          <span class="text-caption text-ink-gray-7">
            No account? The demo accepts any valid address.{' '}
            <A href="/" class="text-ink-blue-link">
              Back to projects
            </A>
          </span>
        }
      >
        <Form form={form} class="flex flex-col gap-4">
          <form.Field
            name="email"
            validators={{ onChange: emailError, onSubmit: emailError }}
          >
            {(field) => (
              <TextInput
                label="Email"
                type="email"
                required
                value={field().state.value}
                error={fieldError(field())}
                onInput={(event) =>
                  field().handleChange(event.currentTarget.value)
                }
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: passwordError, onSubmit: passwordError }}
          >
            {(field) => (
              <Password
                label="Password"
                required
                value={field().state.value}
                error={fieldError(field())}
                onValueChange={(value) => field().handleChange(value)}
              />
            )}
          </form.Field>

          <Button
            type="submit"
            variant="solid"
            theme="blue"
            class="w-full"
            loading={submitting()}
          >
            Sign in
          </Button>
        </Form>
      </AuthCard>
    </AuthLayout>
  )
}
