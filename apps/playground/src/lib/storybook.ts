/**
 * Where Storybook answers, for embeds and deep links.
 *
 * Dev serves it on 6006 (`pnpm storybook`); the harness, shots and the docs
 * build point at the static origin (6007) through `VITE_STORYBOOK_BASE`, so a
 * built site never guesses an origin.
 */
export const STORYBOOK_BASE =
  (import.meta.env['VITE_STORYBOOK_BASE'] as string | undefined) ??
  'http://localhost:6006'

export interface StoryGlobals {
  theme?: 'light' | 'dark'
  dir?: 'ltr' | 'rtl'
}

/**
 * A story URL, with the colour scheme and direction carried as Storybook
 * globals — the cross-origin way to set what `contentDocument` used to be
 * patched with.
 */
export function storyUrl(id: string, globals?: StoryGlobals): string {
  const params = new URLSearchParams({ id, viewMode: 'story' })
  const values: string[] = []
  if (globals?.theme) values.push(`theme:${globals.theme}`)
  if (globals?.dir) values.push(`dir:${globals.dir}`)
  if (values.length > 0) params.set('globals', values.join(','))
  return `${STORYBOOK_BASE}/iframe.html?${params.toString()}`
}
