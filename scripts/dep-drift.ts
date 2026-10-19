/**
 * Dependency drift report (REPORT-ONLY — never a CI gate).
 *
 * Answers: "if the lockfile were resolved from scratch today, how far
 * would it move?" The committed `pnpm-lock.yaml` is compared against a
 * fresh resolution of the same `package.json` specifiers:
 *
 *  1. Root + workspace `package.json` files and `pnpm-workspace.yaml`
 *     are copied to a throwaway temp directory. The lockfile is
 *     deliberately NOT copied, so pnpm resolves against the registry
 *     as it is today, not against history.
 *  2. `pnpm install --lockfile-only --no-frozen-lockfile` runs THERE,
 *     with its store inside the temp directory. No install ever runs
 *     in the repo, so the committed lockfile and `node_modules`
 *     cannot be touched.
 *  3. The `packages:` sections of both lockfiles are diffed by
 *     resolved version. Each change is classified major / minor /
 *     patch, with pre-1.0 (`0.x`) changes bucketed separately: under
 *     semver their minor bumps may break, so they get their own list.
 *  4. As a cross-check, `pnpm outdated --format json` (read-only)
 *     runs in the repo and its count is printed beside the diff.
 *
 * The exit code is 0 for every completed report, however large the
 * drift: this is a measuring instrument, not a gate. It exits 1 only
 * when the tool itself fails (no fresh lockfile could be produced).
 *
 * Usage: `tsx scripts/dep-drift.ts [--keep] [--no-outdated]`
 *   --keep         leave the temp directory in place for inspection
 *   --no-outdated  skip the `pnpm outdated` cross-check
 */
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'

interface Semver {
  major: number
  minor: number
  patch: number
  prerelease: string
}

function parseSemver(version: string): Semver | undefined {
  const core = version.split('+')[0] ?? version
  const dash = core.indexOf('-')
  const main = dash === -1 ? core : core.slice(0, dash)
  const prerelease = dash === -1 ? '' : core.slice(dash + 1)
  const parts = main.split('.')
  if (parts.length < 1 || parts.length > 3) return undefined
  const nums = parts.map((part) => (/^\d+$/.test(part) ? Number(part) : NaN))
  if (nums.some((n) => Number.isNaN(n))) return undefined
  return {
    major: nums[0] ?? 0,
    minor: nums[1] ?? 0,
    patch: nums[2] ?? 0,
    prerelease,
  }
}

function compareSemver(a: Semver, b: Semver): number {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  if (a.patch !== b.patch) return a.patch - b.patch
  if (a.prerelease === b.prerelease) return 0
  if (a.prerelease === '') return 1
  if (b.prerelease === '') return -1
  return a.prerelease.localeCompare(b.prerelease)
}

function compareVersions(a: string, b: string): number {
  const parsedA = parseSemver(a)
  const parsedB = parseSemver(b)
  if (parsedA && parsedB) return compareSemver(parsedA, parsedB)
  return a.localeCompare(b)
}

type DriftKind =
  | 'major'
  | 'minor'
  | 'patch'
  | 'pre-1.0'
  | 'prerelease'
  | 'downgrade'
  | 'other'

function classify(from: string, to: string): DriftKind {
  const a = parseSemver(from)
  const b = parseSemver(to)
  if (!a || !b) return 'other'
  const cmp = compareSemver(a, b)
  if (cmp === 0) return 'other'
  if (cmp > 0) return 'downgrade'
  if (a.major === 0 && b.major === 0) return 'pre-1.0'
  if (b.major !== a.major) return 'major'
  if (b.minor !== a.minor) return 'minor'
  if (b.patch !== a.patch) return 'patch'
  return 'prerelease'
}

function componentOf(from: string, to: string): string {
  const a = parseSemver(from)
  const b = parseSemver(to)
  if (!a || !b) return 'non-semver'
  if (a.major !== b.major) return 'major'
  if (a.minor !== b.minor) return 'minor'
  if (a.patch !== b.patch) return 'patch'
  return 'prerelease'
}

function splitPackageKey(
  key: string,
): { name: string; version: string } | undefined {
  for (let i = key.length - 1; i > 0; i -= 1) {
    if (key[i] !== '@') continue
    const next = key[i + 1]
    if (next === undefined || !/\d/.test(next)) continue
    const version = key.slice(i + 1).split('(')[0] ?? ''
    return { name: key.slice(0, i), version }
  }
  return undefined
}

/**
 * Resolved `name -> versions` from every `packages:` section.
 *
 * Line-parsed rather than YAML-parsed on purpose: the committed
 * lockfile is a multi-document file (the pnpm self-install document
 * precedes the workspace document), and a stock YAML reader would
 * silently return only the first. Scanning both `packages:` sections
 * needs no dependency and cannot miss the second document.
 */
function parseLockfile(text: string): Map<string, Set<string>> {
  const resolved = new Map<string, Set<string>>()
  let inPackages = false
  for (const line of text.split('\n')) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true
      continue
    }
    if (/^\S/.test(line)) {
      inPackages = false
      continue
    }
    if (!inPackages) continue
    const match = /^ {2}(?:'([^']+)'|([^\s:]+)):\s*$/.exec(line)
    const key = match?.[1] ?? match?.[2]
    if (!key) continue
    const split = splitPackageKey(key)
    if (!split || split.version === '') continue
    const versions = resolved.get(split.name) ?? new Set<string>()
    versions.add(split.version)
    resolved.set(split.name, versions)
  }
  return resolved
}

interface Change {
  name: string
  from: string[]
  to: string[]
  kind: DriftKind
}

interface Drift {
  changes: Change[]
  added: string[]
  removed: string[]
  unchanged: number
}

function sortedVersions(versions: Set<string>): string[] {
  return [...versions].sort(compareVersions)
}

function diffLockfiles(
  committed: Map<string, Set<string>>,
  fresh: Map<string, Set<string>>,
): Drift {
  const changes: Change[] = []
  const added: string[] = []
  const removed: string[] = []
  let unchanged = 0
  for (const [name, oldSet] of committed) {
    const newSet = fresh.get(name)
    if (!newSet) {
      removed.push(name)
      continue
    }
    const from = sortedVersions(oldSet)
    const to = sortedVersions(newSet)
    if (from.join(' ') === to.join(' ')) {
      unchanged += 1
      continue
    }
    const fromTop = from[from.length - 1] ?? ''
    const toTop = to[to.length - 1] ?? ''
    changes.push({ name, from, to, kind: classify(fromTop, toTop) })
  }
  for (const name of fresh.keys()) {
    if (!committed.has(name)) added.push(name)
  }
  changes.sort((a, b) => a.name.localeCompare(b.name))
  added.sort()
  removed.sort()
  return { changes, added, removed, unchanged }
}

function workspacePackageJsons(root: string): string[] {
  const workspaceYaml = readFileSync(
    path.join(root, 'pnpm-workspace.yaml'),
    'utf8',
  )
  const globs: string[] = []
  let inPackages = false
  for (const line of workspaceYaml.split('\n')) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true
      continue
    }
    if (!inPackages) continue
    const match = /^\s*-\s*['"]?([^'"]+?)['"]?\s*$/.exec(line)
    if (match?.[1]) globs.push(match[1])
    else if (/^\S/.test(line)) inPackages = false
  }
  const files: string[] = []
  for (const glob of globs) {
    if (glob.endsWith('/*')) {
      const base = glob.slice(0, -2)
      const dir = path.join(root, base)
      if (!existsSync(dir)) continue
      const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
      )
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const rel = path.join(base, entry.name, 'package.json')
        if (existsSync(path.join(root, rel))) files.push(rel)
      }
    } else {
      const rel = path.join(glob, 'package.json')
      if (existsSync(path.join(root, rel))) files.push(rel)
    }
  }
  return files
}

function copyInto(root: string, tmp: string, rel: string): void {
  const dest = path.join(tmp, rel)
  mkdirSync(path.dirname(dest), { recursive: true })
  copyFileSync(path.join(root, rel), dest)
}

function tail(text: string, lines = 30): string {
  return text.split('\n').slice(-lines).join('\n')
}

function outdatedSummary(root: string, majorNames: Set<string>): string {
  const result = spawnSync('pnpm', ['outdated', '--format', 'json'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 5 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  })
  const stdout = result.stdout ?? ''
  if (stdout.trim() === '') return 'unavailable (no output)'
  try {
    const parsed: unknown = JSON.parse(stdout)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return 'unavailable (unexpected output shape)'
    }
    const names = Object.keys(parsed)
    const overlap = names.filter((name) => majorNames.has(name)).length
    return (
      `${names.length} package(s) behind latest, ` +
      `${overlap} also a lockfile-diff major`
    )
  } catch {
    return 'unavailable (output did not parse as JSON)'
  }
}

function formatChange(change: Change): string {
  const from = change.from.join(', ')
  const to = change.to.join(', ')
  const component =
    change.kind === 'pre-1.0'
      ? ` (${componentOf(
          change.from[change.from.length - 1] ?? '',
          change.to[change.to.length - 1] ?? '',
        )})`
      : ''
  return `  ${change.name}  ${from} -> ${to}${component}`
}

function printList(title: string, lines: string[]): void {
  if (lines.length === 0) return
  console.warn(`\n${title} (${lines.length}):`)
  for (const line of lines.slice(0, 25)) console.warn(line)
  if (lines.length > 25) {
    console.warn(`  … and ${lines.length - 25} more`)
  }
}

function countKind(changes: Change[], kind: DriftKind): number {
  return changes.filter((change) => change.kind === kind).length
}

function main(): void {
  const keep = process.argv.includes('--keep')
  const skipOutdated = process.argv.includes('--no-outdated')
  const root = process.cwd()
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'newui-dep-drift-'))
  try {
    const manifests = [
      'package.json',
      'pnpm-workspace.yaml',
      ...workspacePackageJsons(root),
    ]
    if (existsSync(path.join(root, '.npmrc'))) manifests.push('.npmrc')
    for (const rel of manifests) copyInto(root, tmp, rel)
    console.warn(`[dep-drift] copied ${manifests.length} manifest(s) to ${tmp}`)
    console.warn('[dep-drift] resolving fresh lockfile there…')

    const install = spawnSync(
      'pnpm',
      [
        'install',
        '--lockfile-only',
        '--no-frozen-lockfile',
        '--store-dir',
        path.join(tmp, '.pnpm-store'),
      ],
      {
        cwd: tmp,
        encoding: 'utf8',
        timeout: 15 * 60 * 1000,
        maxBuffer: 64 * 1024 * 1024,
      },
    )
    const freshLockfile = path.join(tmp, 'pnpm-lock.yaml')
    if (install.status !== 0 || !existsSync(freshLockfile)) {
      console.error('[dep-drift] fresh resolution failed; output tail:')
      console.error(tail(`${install.stdout ?? ''}\n${install.stderr ?? ''}`))
      process.exitCode = 1
      return
    }

    const committed = parseLockfile(
      readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8'),
    )
    const fresh = parseLockfile(readFileSync(freshLockfile, 'utf8'))
    const drift = diffLockfiles(committed, fresh)
    const { changes } = drift

    console.warn(
      `\n[dep-drift] ${new Date().toISOString()}` +
        ' — report only, repo untouched',
    )
    console.warn(
      `committed: ${committed.size} resolved package(s)` +
        ` · fresh: ${fresh.size}`,
    )
    console.warn(
      `unchanged: ${drift.unchanged} · changed: ${changes.length}` +
        ` (major ${countKind(changes, 'major')}` +
        ` · minor ${countKind(changes, 'minor')}` +
        ` · patch ${countKind(changes, 'patch')}` +
        ` · pre-1.0 ${countKind(changes, 'pre-1.0')}` +
        ` · prerelease ${countKind(changes, 'prerelease')}` +
        ` · downgrade ${countKind(changes, 'downgrade')}` +
        ` · other ${countKind(changes, 'other')})` +
        ` · added: ${drift.added.length}` +
        ` · removed: ${drift.removed.length}`,
    )

    const ofKind = (kind: DriftKind) =>
      changes.filter((change) => change.kind === kind)
    printList('Major updates', ofKind('major').map(formatChange))
    printList('Pre-1.0 updates', ofKind('pre-1.0').map(formatChange))
    printList('Downgrades', ofKind('downgrade').map(formatChange))
    printList(
      'Added by fresh resolution',
      drift.added.map((name) => `  ${name}`),
    )
    printList(
      'Removed by fresh resolution',
      drift.removed.map((name) => `  ${name}`),
    )

    if (skipOutdated) {
      console.warn('\n[cross-check] skipped (--no-outdated)')
    } else {
      const majorNames = new Set(ofKind('major').map((c) => c.name))
      console.warn(
        `\n[cross-check] pnpm outdated: ${outdatedSummary(root, majorNames)}`,
      )
    }
    console.warn('')
  } finally {
    if (keep) {
      console.warn(`[dep-drift] temp dir kept: ${tmp}`)
    } else {
      rmSync(tmp, { recursive: true, force: true })
    }
  }
}

main()
