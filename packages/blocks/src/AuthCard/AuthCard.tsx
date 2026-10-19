import { Button, Divider } from '@newui/ui'
import { For, type JSX, Show } from 'solid-js'

export interface AuthProvider {
  label: string
  /** A `lucide-*` string or a component (P11). */
  icon?: string
  onClick?: () => void
}

export interface AuthCardProps {
  title: JSX.Element
  description?: JSX.Element
  /** The form itself — fields and the submit button. */
  children: JSX.Element
  /** Social sign-in buttons, in order. */
  providers?: AuthProvider[]
  /** The line under the form: "Don't have an account? Sign up". */
  footer?: JSX.Element
  /** Brand mark above the title. */
  logo?: JSX.Element
  class?: string
}

/**
 * The centred card a sign-in, sign-up or reset screen is.
 *
 * One block rather than three screens, because the three are the same layout
 * with different fields — and because the details that make it look
 * intentional are the ones that get skipped when it is written inline: a capped
 * measure so the fields do not stretch on a wide display, the divider labelled
 * "or" only when both a form and providers are present, and the title as an
 * `h1` so the page has exactly one.
 */
export function AuthCard(props: AuthCardProps): JSX.Element {
  const hasProviders = () => (props.providers?.length ?? 0) > 0

  return (
    <div
      data-slot="auth-card"
      class={`flex min-h-screen items-center justify-center bg-surface-base px-4 py-12 ${props.class ?? ''}`}
    >
      <div class="flex w-full max-w-sm flex-col gap-4 rounded-6 border border-outline-gray-1 bg-surface-elevation-1 p-6 shadow-sm">
        <div class="flex flex-col items-center gap-3 text-center">
          <Show when={props.logo}>{props.logo}</Show>
          <div class="flex flex-col gap-1">
            <h1 class="text-metric text-ink-gray-9">{props.title}</h1>
            <Show when={props.description}>
              <p class="text-base text-ink-gray-7">{props.description}</p>
            </Show>
          </div>
        </div>

        <div class="flex flex-col gap-4">{props.children}</div>

        <Show when={hasProviders()}>
          <Divider label="or" />
          <div class="flex flex-col gap-2">
            <For each={props.providers}>
              {(provider) => (
                <Button
                  variant="outline"
                  theme="gray"
                  onClick={provider.onClick}
                  iconLeft={provider.icon}
                >
                  {provider.label}
                </Button>
              )}
            </For>
          </div>
        </Show>

        <Show when={props.footer}>
          <p class="text-center text-base text-ink-gray-7">{props.footer}</p>
        </Show>
      </div>
    </div>
  )
}
