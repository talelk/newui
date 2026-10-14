/**
 * The component contracts, straight out of `spec/`.
 *
 * `import.meta.glob` with `?raw` gives one lazy chunk per spec, so a reference
 * page downloads its own contract (~2 kB) rather than all of them. The specs are
 * *not* copied into the app: `spec/*.md` stays the single source of truth, and a
 * generated copy would be a second one to keep in step.
 *
 * The glob escapes the app root. `vite.config.ts` allows it explicitly
 * (`server.fs.allow`), and the build has no root restriction at all.
 */
const SPECS = import.meta.glob('../../../../spec/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** The raw contract for a component, or `undefined` when it has no spec yet. */
export function loadSpec(slug: string): (() => Promise<string>) | undefined {
  return SPECS[`../../../../spec/${slug}.md`]
}
