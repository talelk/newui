import { For, type JSX } from 'solid-js'

import { colorScheme, resolved, setColorScheme } from './theme'

const SCHEMES = ['light', 'dark', 'system'] as const

const ICON: Record<(typeof SCHEMES)[number], string> = {
  light: 'lucide-sun',
  dark: 'lucide-moon',
  system: 'lucide-monitor',
}

/**
 * Three buttons rather than a menu: it makes all three states visible at once,
 * and `aria-pressed` carries the state the eye reads, so the two cannot disagree.
 */
export function ThemeToggle(): JSX.Element {
  return (
    <>
      {/* One control on a phone: the header has room for a state, not for three
          buttons; the settings screen still shows the full choice. */}
      <button
        type="button"
        class="grid size-10 shrink-0 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:text-ink-gray-9 focus-visible:focus-ring-blue sm:hidden"
        aria-label={`Switch to ${resolved() === 'dark' ? 'light' : 'dark'} theme`}
        onClick={() => setColorScheme(resolved() === 'dark' ? 'light' : 'dark')}
      >
        <span
          aria-hidden="true"
          class={`${resolved() === 'dark' ? 'lucide-sun' : 'lucide-moon'} size-4`}
        />
      </button>
      <fieldset class="m-0 hidden shrink-0 items-center gap-0.5 rounded-3 border-0 bg-surface-gray-2 p-0.5 sm:flex">
        <legend class="sr-only">Colour scheme</legend>
        <For each={SCHEMES}>
          {(scheme) => (
            <button
              type="button"
              onClick={() => setColorScheme(scheme)}
              aria-pressed={colorScheme() === scheme}
              aria-label={scheme}
              title={scheme}
              class="grid size-10 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:text-ink-gray-9 focus-visible:focus-ring-blue aria-pressed:bg-surface-base aria-pressed:text-ink-gray-9 aria-pressed:shadow-sm sm:size-7"
            >
              <span aria-hidden="true" class={`${ICON[scheme]} size-3.5`} />
            </button>
          )}
        </For>
      </fieldset>
    </>
  )
}
