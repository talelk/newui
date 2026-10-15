import type { PreviewSources } from './ResponsivePreview'

const manifests = import.meta.glob<{
  files: string[]
  packages: string[]
}>('../generated/sources/*.json', { import: 'default' })
const sources = import.meta.glob<string>(
  ['../**/*.{ts,tsx,css,json,svg}', '!../generated/**', '!../**/*.test.*'],
  { query: '?raw', import: 'default' },
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
        const read = sources[`../${file}`]
        if (!read) throw new Error(`Missing source file: ${file}`)
        return read()
      },
    })),
  }
}
