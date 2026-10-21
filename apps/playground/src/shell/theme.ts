import { createColorScheme } from '@newui/atoms'
import { createRoot } from 'solid-js'

/**
 * The site's single light/dark controller.
 *
 * `createColorScheme` persists the choice, tracks the OS live and flips
 * `data-theme` on the document — but each call owns its own signal, so two
 * callers would drift (the masthead would show `light` while the page is
 * `dark`). The site therefore creates exactly one instance, in a root of its
 * own, and every consumer imports this instead of calling the factory.
 *
 * `createRoot` (rather than module scope bare) is what keeps the effect and the
 * media-query listener alive: the factory registers cleanup through
 * `onCleanup`, which needs an owner.
 */
export const { colorScheme, setColorScheme } = createRoot(() =>
  createColorScheme(),
)
