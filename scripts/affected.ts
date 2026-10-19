/**
 * Affected gate router.
 *
 * `pnpm verify:affected` runs only the gates the diff can break, so the agent
 * loop is `change → affected → green` instead of re-running twelve minutes of
 * unrelated gates (`verify` is still the final word, and CI still runs all of
 * it — this is not a way to skip gates, it is a way to not wait for them).
 *
 * The mapping is a rule table: every gate declares which paths make it dirty.
 * A gate that is *always* cheap stays unconditional; a gate that is only dirty
 * through a few files gets patterns. Anything unclaimed — root configs,
 * lockfiles, CI definitions — falls back to the full pipeline, because the
 * honest answer to "what does a pnpm-workspace change affect?" is "everything".
 */
import { spawnSync } from 'node:child_process'
import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { CiStep } from './ci-steps'

export interface AffectedPlan {
  /** Steps to run, in pipeline order. Commands may be scoped (a filter). */
  steps: CiStep[]
  /** Human-readable rationale for each included step. */
  why: Record<string, string>
  /** True when the diff was unclaimable and the full pipeline ran. */
  fallbackFull: boolean
  /** The files considered dirty. */
  files: string[]
}

/** Packages, as `name -> repo-relative directory`, read from the manifests. */
function workspacePackages(): Map<string, string> {
  const out = new Map<string, string>()
  const patterns = [
    'packages/*/package.json',
    'apps/*/package.json',
    'package.json',
  ]
  for (const pattern of patterns) {
    for (const rel of globSync(pattern, {
      cwd: process.cwd(),
      absolute: true,
    })) {
      try {
        const manifest = JSON.parse(readFileSync(rel, 'utf8')) as {
          name?: string
        }
        if (!manifest?.name) continue
        out.set(
          manifest.name,
          path.relative(process.cwd(), path.dirname(rel)).replace(/\\/g, '/'),
        )
      } catch {
        /* malformed manifests are the manifest gates' problem, not ours */
      }
    }
  }
  return out
}

/** Package name whose folder contains `file`. */
function ownerOf(
  file: string,
  packages: Map<string, string>,
): string | undefined {
  let best: { name: string; len: number } | undefined
  for (const [name, dir] of packages) {
    const prefix = dir === '' ? '' : `${dir}/`
    if (file === dir || (prefix && file.startsWith(prefix))) {
      if (!best || prefix.length > best.len) best = { name, len: prefix.length }
    }
  }
  return best?.name
}

/**
 * The dirty path → gate rules. Patterns are matched against the repo-relative
 * diff paths. Keep the table boring: it is read by humans debugging why a
 * gate was skipped.
 */
interface Rule {
  /** Substring of the CI step name or command being matched. */
  match: string
  /** Patterns that dirty this gate. */
  paths?: RegExp[]
  /** Run it even when nothing matches (cheap invariant gates). */
  always?: boolean
  /** Optional scoped replacements keyed by the matched file's owner package. */
  scopeable?: boolean
}

const TS = /\.(?:ts|tsx|mts|cts|js|jsx)$|\.css$/
const RULES: Rule[] = [
  { match: 'Lint & format', always: true },
  { match: 'Lint Solid', always: true },
  {
    match: 'Architecture',
    paths: [/^packages\//, /^apps\//, /dependency-cruiser/],
  },
  {
    match: 'Package manifest',
    paths: [/^packages\/[^/]+\/(package\.json|src|dist)/, /publint/],
  },
  { match: 'Dead code', paths: [/^packages\//, /^apps\//, /knip/] },
  {
    match: 'Type-check',
    paths: [/^packages\//, /^apps\//, /\.json$/],
    scopeable: true,
  },
  {
    match: 'API table',
    paths: [/^packages\/ui\/src/, /api\.json/, /propsgen/],
  },
  {
    match: 'Spec props',
    paths: [/^spec\//, /^packages\/ui\/src/, /check-specs/],
  },
  {
    match: 'Site data',
    paths: [
      /^apps\/playground\/src\/generated/,
      /sitegen/,
      /^packages\/ui\/src\/components/,
      /^packages\/blocks\/src/,
    ],
  },
  { match: 'Docs site builds', paths: [/^spec\//, /^packages\//, /docs\.ts/] },
  { match: 'Tests', paths: [TS], scopeable: true },
  { match: 'SSR smoke', paths: [TS], scopeable: false },
  {
    match: 'tw-merge sweep',
    paths: [
      /tw-merge\.config\.ts/,
      /tw-merge\.sweep/,
      /^packages\/tokens\//,
      /tw-merge\.test/,
    ],
  },
  { match: 'Reference paths', always: true },
  { match: 'Bundle budget', paths: [/^packages\//] },
  { match: 'Build packages', paths: [/^packages\//] },
  {
    match: 'Build playground',
    paths: [/^apps\/playground/, /^packages\/(ui|blocks|tailwind|tokens)\//],
  },
  {
    match: 'CSS emission',
    paths: [
      /^packages\/(ui|blocks|tailwind|tokens)\//,
      /^apps\/playground\/src\/(demos|pages)/,
      /tailwind/,
    ],
  },
  {
    match: 'Route JS budget',
    paths: [/^apps\/playground/, /^packages\/(ui|blocks|charts)\//],
  },
  {
    match: 'Lighthouse',
    paths: [/^apps\/playground\/(vite|src)/, /lighthouse/],
  },
  {
    match: 'Component browser tests',
    paths: [/^packages\/ui\/src\/components/, /\.browser\.test\./],
    scopeable: false,
  },
  {
    match: 'Browser harness',
    paths: [
      /^apps\/playground\/src\/(pages|lib|demos|routes)/,
      /^e2e\//,
      /playwright\.config/,
    ],
  },
]

/** `git diff` paths: working tree (default) or `<base>...tree` with --base. */
export function dirtyFiles(base?: string): string[] {
  const args = base
    ? ['diff', '--name-only', `${base}...HEAD`]
    : ['diff', '--name-only', 'HEAD']
  const r = spawnSync('git', args, { encoding: 'utf8' })
  const tracked = r.status === 0 ? r.stdout.split('\n').filter(Boolean) : []
  const untracked = spawnSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    {
      encoding: 'utf8',
    },
  )
  const fresh =
    untracked.status === 0 ? untracked.stdout.split('\n').filter(Boolean) : []
  return [...new Set([...tracked, ...fresh])].filter(
    (f) => !f.startsWith('.opencode/'),
  )
}

const stepOf = (steps: CiStep[], match: string) =>
  steps.find((s) => s.name.includes(match) || s.command.includes(match))

export function planAffected(steps: CiStep[], files: string[]): AffectedPlan {
  const packages = workspacePackages()
  const why: Record<string, string> = {}
  const picked = new Map<string, CiStep>()

  const claimed = (file: string) =>
    RULES.some((rule) => (rule.paths ?? []).some((rx) => rx.test(file)))
  const fallbackFull = files.some((f) => !claimed(f))

  for (const rule of RULES) {
    const step = stepOf(steps, rule.match)
    if (!step) continue
    if (rule.always) {
      picked.set(step.name, step)
      why[step.name] = 'always'
      continue
    }
    const hits = files.filter((f) =>
      (rule.paths ?? []).some((rx) => rx.test(f)),
    )
    if (hits.length === 0) continue

    if (!rule.scopeable) {
      picked.set(step.name, step)
      why[step.name] = hits.slice(0, 3).join(', ')
      continue
    }

    // Scopeable gates replace the command with a filter for the owner set.
    const owners = new Set<string>()
    for (const f of hits) {
      const owner = ownerOf(f, packages)
      if (owner) owners.add(owner)
      else {
        owners.clear()
        break
      }
    }
    if (
      step.name === 'Type-check' &&
      owners.size > 0 &&
      owners.size < packages.size
    ) {
      for (const name of owners) {
        const scoped: CiStep = {
          name: `Type-check (${name})`,
          command:
            name === 'playground'
              ? 'pnpm --filter playground typecheck'
              : `pnpm --filter ${name} typecheck`,
          group: step.group,
        }
        picked.set(scoped.name, scoped)
        why[scoped.name] = hits
          .filter((f) => (ownerOf(f, packages) ?? '') === name)
          .slice(0, 3)
          .join(', ')
      }
    } else if (step.name === 'Tests' && owners.size > 0) {
      const scoped: CiStep = {
        name: 'Tests (changed files)',
        command: 'pnpm exec vitest run --changed',
        group: step.group,
      }
      picked.set(scoped.name, scoped)
      why[scoped.name] =
        `vitest --changed across ${[...owners].length} package(s)`
    } else {
      picked.set(step.name, step)
      why[step.name] = hits.slice(0, 3).join(', ')
    }
  }

  // Preserve the canonical pipeline order.
  const order = new Map(steps.map((s, i) => [s.name, i]))
  const ordered = [...picked.values()].sort(
    (a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99),
  )

  if (fallbackFull) {
    // Name every step so the printed plan explains itself in both modes;
    // "why" is the difference between a gate you chose and one you defaulted
    // into because a root config moved.
    const fullWhy: Record<string, string> = {}
    for (const step of steps) fullWhy[step.name] = 'unclaimable diff paths'
    return { steps, why: fullWhy, fallbackFull, files }
  }
  return { steps: ordered, why, fallbackFull, files }
}
