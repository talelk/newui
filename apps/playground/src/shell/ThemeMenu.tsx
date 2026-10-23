import { For, type JSX } from 'solid-js'
import { colorScheme, setColorScheme } from './theme'

const SCHEMES = ['light', 'dark', 'system'] as const

const ICON: Record<(typeof SCHEMES)[number], string> = {
  light: 'lucide-sun',
  dark: 'lucide-moon',
  system: 'lucide-monitor',
}

const LABEL: Record<(typeof SCHEMES)[number], string> = {
  light: 'Use light theme',
  dark: 'Use dark theme',
  system: 'Use system theme',
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
    <fieldset class="m-0 flex w-fit shrink-0 items-center gap-0.5 rounded-3 border-0 bg-surface-gray-2 p-0.5">
      <legend class="sr-only">Colour scheme</legend>
      <For each={SCHEMES}>
        {(scheme) => (
          <button
            type="button"
            onClick={() => setColorScheme(scheme)}
            aria-pressed={colorScheme() === scheme}
            aria-label={LABEL[scheme]}
            title={LABEL[scheme]}
            class="grid size-10 sm:size-7 place-items-center rounded-3 text-ink-gray-6 transition-colors hover:text-ink-gray-9 aria-pressed:bg-surface-base aria-pressed:text-ink-gray-9 aria-pressed:shadow-sm focus-visible:focus-ring-blue"
          >
            <span aria-hidden="true" class={`${ICON[scheme]} size-3.5`} />
          </button>
        )}
      </For>
    </fieldset>
  )
}

/**
 * The rail form of the switch: one square control that cycles light → dark →
 * system. Three buttons do not fit a 56px rail, and hiding the control when the
 * sidebar collapses would take a global preference away with it.
 */
export function ThemeMenuCompact(): JSX.Element {
  const next = () => {
    const index = SCHEMES.indexOf(colorScheme())
    return SCHEMES[(index + 1) % SCHEMES.length] ?? 'system'
  }
  const label = () => `Theme: ${colorScheme()}. Switch to ${next()}.`

  return (
    <button
      type="button"
      onClick={() => setColorScheme(next())}
      aria-label={label()}
      title={label()}
      class="grid size-8 place-items-center rounded-control text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9 focus-visible:focus-ring"
    >
      <span aria-hidden="true" class={`${ICON[colorScheme()]} size-4`} />
    </button>
  )
}
