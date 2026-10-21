import { createColorScheme } from '@newui/atoms'
import { createRoot } from 'solid-js'

/**
 * The one writer of the light/dark axis.
 *
 * `createColorScheme` persists the choice, follows the OS while the choice is
 * "system", flips `data-theme` and sets the CSS `color-scheme` property. Each
 * call owns its own signal, so creating it twice would be two writers racing
 * over the same attribute — it lives at module scope and every consumer imports
 * this instance.
 *
 * `createRoot` (rather than a bare module-level call) is what keeps the effect
 * and the media-query listener alive: the factory registers cleanup through
 * `onCleanup`, which needs an owner.
 */
export const { colorScheme, resolved, setColorScheme } = createRoot(() =>
  createColorScheme(),
)
