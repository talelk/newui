import { For, type JSX } from 'solid-js'
import { ICON_BTN, SEGMENTED, SEGMENTED_BTN } from '../lib/site-ui'
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
    <fieldset class={SEGMENTED}>
      <legend class="sr-only">Colour scheme</legend>
      <For each={SCHEMES}>
        {(scheme) => (
          <button
            type="button"
            onClick={() => setColorScheme(scheme)}
            aria-pressed={colorScheme() === scheme}
            aria-label={LABEL[scheme]}
            title={LABEL[scheme]}
            class={SEGMENTED_BTN}
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
      class={ICON_BTN}
    >
      <span aria-hidden="true" class={`${ICON[colorScheme()]} size-4`} />
    </button>
  )
}
