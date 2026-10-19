import type { PreviewSources } from './ResponsivePreview'

const manifests = import.meta.glob<{
  files: string[]
  packages: string[]
}>('../generated/sources/*.json', { import: 'default' })
const sources = import.meta.glob<string>(
  ['../**/*.{ts,tsx,css,json,svg}', '!../generated/**', '!../**/*.test.*'],
  { query: '?raw', import: 'default' },
)

/**
 * Glob keys are relative to this file (`./examples.ts` for a sibling,
 * `../pages/Tasks.tsx` for a page), while manifests list paths relative
 * to `src/`. Normalize keys to the manifest shape once, or the first
 * `lib/` file in a bundle would never be found.
 */
const byManifestPath = new Map(
  Object.entries(sources).map(([key, load]) => [
    key.startsWith('../')
      ? key.slice(3)
      : key.startsWith('./')
        ? `lib/${key.slice(2)}`
        : key,
    load,
  ]),
)

/** The manifest and source text are fetched only after opening Source. */
export async function applicationSources(
  slug: string,
): Promise<PreviewSources> {
  const load = manifests[`../generated/sources/${slug}.json`]
  if (!load) throw new Error(`No source manifest for ${slug}`)
  const manifest = await load()
  return {
    packages: manifest.packages,
    files: manifest.files.map((file) => ({
      path: file,
      load: async () => {
        const read = byManifestPath.get(file)
        if (!read) throw new Error(`Missing source file: ${file}`)
        return read()
      },
    })),
  }
}
