import { type JSX, Show } from 'solid-js'

/**
 * A focused frame for public access screens: sign-in, sign-up and recovery.
 * The authentication card and the auth provider remain app-owned; this only
 * supplies the responsive page canvas and brand slot.
 */
export interface AuthLayoutProps {
  brand?: JSX.Element
  /** Optional desktop-only context panel beside the auth form. */
  aside?: JSX.Element
  /** Optional top-edge actions, e.g. a theme switcher and a return link. */
  header?: JSX.Element
  children: JSX.Element
}

export function AuthLayout(props: AuthLayoutProps): JSX.Element {
  return (
    <div
      data-slot="auth-layout"
      class="grid min-h-dvh bg-surface-gray-1 text-interface text-ink-gray-9"
      classList={{ 'lg:grid-cols-2': Boolean(props.aside) }}
    >
      <Show when={props.aside}>
        {/* Cool Paper, not a saturated brand field: the One Signal Rule keeps
            blue for the interactive moment, which the app's aside content owns. */}
        <aside class="hidden flex-col justify-between border-s border-outline-gray-1 bg-surface-gray-2 p-6 text-ink-gray-9 lg:flex">
          {props.aside}
        </aside>
      </Show>
      <main class="relative grid min-h-dvh place-items-center p-4">
        <Show when={props.header}>
          <div class="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            {props.header}
          </div>
        </Show>
        <div class="flex w-full max-w-md flex-col items-center gap-4">
          {props.brand}
          {props.children}
        </div>
      </main>
    </div>
  )
}
