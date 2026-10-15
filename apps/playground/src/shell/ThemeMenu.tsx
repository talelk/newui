import { For, type JSX } from 'solid-js'
import { colorScheme, setColorScheme } from './theme'

const SCHEMES = ['light', 'dark', 'system'] as const

const ICON: Record<(typeof SCHEMES)[number], string> = {
  light: 'lucide-sun',
  dark: 'lucide-moon',
  system: 'lucide-monitor',
}

/**
 * The colour-scheme switch. Three buttons inside a `fieldset` — the same shape
 * the old playground used, kept because it makes all three states visible at
 * once (the OS-following one included) rather than hiding two behind a menu.
 *
 * `aria-pressed` rather than `data-active` alone: the visual state and the
 * announced state must not be able to disagree. The `legend` is visually hidden
 * because the switch sits next to the GitHub link and reads as an icon row.
 */
export function ThemeMenu(): JSX.Element {
  return (
    <fieldset class="flex shrink-0 items-center gap-0.5 rounded-3 bg-surface-gray-2 p-0.5 m-0 border-0">
      <legend class="sr-only">Colour scheme</legend>
      <For each={SCHEMES}>
        {(scheme) => (
          <button
            type="button"
            onClick={() => setColorScheme(scheme)}
            aria-pressed={colorScheme() === scheme}
            aria-label={scheme}
            title={scheme}
            class="grid size-10 sm:size-7 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:text-ink-gray-9 aria-pressed:bg-surface-base aria-pressed:text-ink-gray-9 aria-pressed:shadow-sm focus-visible:focus-ring-blue"
          >
            <span aria-hidden="true" class={`${ICON[scheme]} size-3.5`} />
          </button>
        )}
      </For>
    </fieldset>
  )
}
