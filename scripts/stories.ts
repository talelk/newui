/**
 * The story index, generated and checked.
 *
 * `pnpm stories` runs Storybook's fast `index` command (no static build) and
 * writes two committed artifacts:
 *
 * - `apps/playground/src/generated/stories.json` — every story id, title and
 *   file. The browser harness and the scripts read this instead of parsing
 *   sources, so the sweep units are exactly what Storybook serves.
 * - `apps/playground/src/generated/stories.ts` — the site's lazy registry: one
 *   entry per story file, keyed by the component the file documents, exposing
 *   the `Demo` embed and the story a deep link opens.
 *
 * `pnpm stories:check` regenerates and fails on drift. An id is a link (docs
 * embeds, sweep units), so it cannot change silently.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { REQUIRED_STATES } from './story-states'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(root, 'apps/playground')
const INDEX_FILE = path.join(appDir, 'src/generated/stories.json')
const REGISTRY_FILE = path.join(appDir, 'src/generated/stories.ts')

interface RawStory {
  type: string
  id: string
  title: string
  name: string
  exportName: string
  importPath: string
  tags?: string[]
}

interface Story {
  id: string
  title: string
  name: string
  exportName: string
  /** App-relative path, so `src/stories/…` — the way the harness names it. */
  importPath: string
  tags: string[]
}

/** The storybook bin the playground installed, whatever pnpm aliased it to. */
function storybookBin(): string {
  const require = createRequire(path.join(appDir, 'package.json'))
  const manifestPath = require.resolve('storybook/package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    bin: string | Record<string, string>
  }
  const bin =
    typeof manifest.bin === 'string' ? manifest.bin : manifest.bin['storybook']
  if (!bin) throw new Error('the storybook package declares no `storybook` bin')
  return path.resolve(path.dirname(manifestPath), bin)
}

/** Ask Storybook for its own index — the same source `index.json` is built from. */
function runIndex(): { v: number; entries: Record<string, RawStory> } {
  const outDir = mkdtempSync(path.join(os.tmpdir(), 'newui-story-index-'))
  const outFile = path.join(outDir, 'index.json')
  try {
    const result = spawnSync(
      process.execPath,
      [storybookBin(), 'index', '-o', outFile],
      { cwd: appDir, encoding: 'utf8' },
    )
    if (result.status !== 0) {
      process.stderr.write(result.stdout ?? '')
      process.stderr.write(result.stderr ?? '')
      throw new Error(`storybook index failed with code ${result.status}`)
    }
    return JSON.parse(readFileSync(outFile, 'utf8')) as {
      v: number
      entries: Record<string, RawStory>
    }
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
}

function collect(): Story[] {
  const index = runIndex()
  return Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      exportName: entry.exportName,
      importPath: entry.importPath.replace(/^\.\//, ''),
      tags: entry.tags ?? [],
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

/** The shipped components, in registry-name form. */
function registryNames(): string[] {
  const source = readFileSync(
    path.join(appDir, 'src/generated/components.ts'),
    'utf8',
  )
  const start = source.indexOf('= [') + 2
  const entries = JSON.parse(
    source.slice(start, source.indexOf('\n]', start) + 2),
  ) as Array<{ name: string; shipped: boolean }>
  return entries.filter((entry) => entry.shipped).map((entry) => entry.name)
}

/**
 * The state contract (spec/states.md): every shipped component has a story
 * file with `Default`, plus every state its public API can enter. Enforced on
 * generate *and* check, so a missing state cannot be baked into the index the
 * harness and docs link to.
 */
function assertStates(stories: Story[]): void {
  const namesByComponent = new Map<string, Set<string>>()
  for (const story of stories) {
    const component = story.title.split('/').at(-1) ?? ''
    const names = namesByComponent.get(component) ?? new Set<string>()
    // The *export* is the contract (`export const ReadOnly`); Storybook's
    // display name may title-case it (`Read Only`).
    names.add(story.exportName)
    namesByComponent.set(component, names)
  }

  const problems: string[] = []
  const shipped = registryNames()
  for (const component of shipped) {
    const names = namesByComponent.get(component)
    if (!names) {
      problems.push(
        `${component}: no story file (src/stories/<name>.stories.tsx)`,
      )
      continue
    }
    if (!names.has('Default')) problems.push(`${component}: no Default story`)
    for (const state of REQUIRED_STATES[component] ?? [])
      if (!names.has(state))
        problems.push(`${component}: missing required “${state}” story`)
  }
  for (const component of Object.keys(REQUIRED_STATES))
    if (!shipped.includes(component))
      problems.push(
        `${component}: listed in REQUIRED_STATES but not a shipped component`,
      )

  if (problems.length > 0) {
    for (const problem of problems) console.error(`[stories] ${problem}`)
    console.error(
      `[stories] ${problems.length} state-contract problem(s) — see spec/states.md`,
    )
    process.exit(1)
  }
}

/**
 * One registry entry per story file. A component is the title's last segment
 * (`Components/Actions/Button` → `Button`, `Compositions/Sidebar01` →
 * `Sidebar01`), which is exactly the key the reference pages look up; two
 * files claiming one name would shadow each other, so that is an error.
 */
function registry(stories: Story[]): string {
  const byFile = new Map<string, Story[]>()
  for (const story of stories) {
    const list = byFile.get(story.importPath) ?? []
    list.push(story)
    byFile.set(story.importPath, list)
  }

  const seen = new Set<string>()
  const entries = [...byFile.entries()]
    .map(([file, list]) => {
      const title = list[0]?.title ?? ''
      const component = title.split('/').at(-1) ?? ''
      if (!component)
        throw new Error(`story file ${file} has no title segment to key on`)
      if (seen.has(component))
        throw new Error(`two story files claim the component “${component}”`)
      seen.add(component)
      if (!file.startsWith('src/stories/'))
        throw new Error(`story file ${file} lives outside src/stories/`)
      const preferred =
        list.find((story) => story.name === 'Default') ?? list[0]
      if (!preferred) throw new Error(`story file ${file} has no stories`)
      const specifier = `../${file.replace(/^src\//, '').replace(/\.tsx?$/, '')}`
      return { component, id: preferred.id, specifier }
    })
    .sort((a, b) => a.component.localeCompare(b.component))

  const body = entries
    .map(
      (entry) =>
        `  ${entry.component}: {\n` +
        `    id: '${entry.id}',\n` +
        `    load: () => import('${entry.specifier}'),\n` +
        `  },`,
    )
    .join('\n')

  return `/**
 * Generated by \`pnpm stories\`. Do not edit.
 *
 * The site's lazy story registry: one entry per story file, keyed by the
 * component the file documents. A reference page renders \`Demo\` (the file's
 * non-story export) and links \`id\` to Storybook, so a demo is written once.
 */
import type { Component } from 'solid-js'

/** What a story file exports for the site to embed. */
export interface StoryModule {
  Demo: Component
}

export interface StoryEntry {
  /** The story a deep link opens (the file's \`Default\`, when it has one). */
  id: string
  /** A lazy import of the story file. */
  load: () => Promise<StoryModule>
}

export const STORIES: Record<string, StoryEntry> = {
${body}
}
`
}

function main(): void {
  const stories = collect()
  assertStates(stories)
  const index = `${JSON.stringify({ v: 5, stories }, null, 2)}\n`
  const source = registry(stories)
  const files = [
    { path: INDEX_FILE, content: index },
    { path: REGISTRY_FILE, content: source },
  ]
  const check = process.argv.includes('--check')

  if (check) {
    const stale = files.filter((file) => {
      try {
        return readFileSync(file.path, 'utf8') !== file.content
      } catch {
        return true
      }
    })
    if (stale.length > 0) {
      for (const file of stale)
        console.error(
          `[stories] ${path.relative(root, file.path)} is stale — run \`pnpm stories\``,
        )
      process.exit(1)
    }
    const byFile = new Set(stories.map((story) => story.importPath))
    console.warn(
      `[stories] ${stories.length} stories in ${byFile.size} files, all current`,
    )
    return
  }

  for (const file of files) writeFileSync(file.path, file.content)
  const byFile = new Set(stories.map((story) => story.importPath))
  console.warn(
    `[stories] ${stories.length} stories in ${byFile.size} files → ${path.relative(root, INDEX_FILE)}`,
  )
}

main()
