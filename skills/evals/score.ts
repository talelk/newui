#!/usr/bin/env tsx
/**
 * Validate the newui skill eval cases and print a summary.
 *
 * This is the harness, not the scorer: it never calls a model. A human (or a
 * grading model) reads `cases.json`, runs each `prompt`, and decides whether the
 * answer did the `check`, judged against `source`. This script only makes sure
 * the case file is well-formed and that every `source` it cites is a real file,
 * so a run cannot silently grade against a path that moved.
 *
 * Run: `pnpm exec tsx skills/evals/score.ts`
 * Exit: 0 when the file is valid, 1 when it is not.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface EvalCase {
  id: string
  area: string
  prompt: string
  check: string
  source: string
}

interface CasesFile {
  version: number
  skill: string
  cases: EvalCase[]
}

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')
const CASES_PATH = join(HERE, 'cases.json')

const out = (line: string) => process.stdout.write(`${line}\n`)
const err = (line: string) => process.stderr.write(`${line}\n`)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile()
}

/** Every problem found, in the order discovered. Empty means valid. */
const problems: string[] = []

function fail(message: string): void {
  problems.push(message)
}

function load(): CasesFile | undefined {
  if (!isFile(CASES_PATH)) {
    fail(`cases file not found: ${CASES_PATH}`)
    return undefined
  }

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(CASES_PATH, 'utf8'))
  } catch (error) {
    fail(`cases.json is not valid JSON: ${(error as Error).message}`)
    return undefined
  }

  if (!isRecord(raw)) {
    fail('cases.json must be a JSON object')
    return undefined
  }

  if (typeof raw.version !== 'number') fail('missing numeric "version"')
  if (!isNonEmptyString(raw.skill)) {
    fail('missing string "skill" (path to the skill under test)')
  } else if (!isFile(join(REPO, raw.skill))) {
    fail(`skill file does not exist: ${raw.skill}`)
  }

  if (!Array.isArray(raw.cases)) {
    fail('"cases" must be an array')
    return undefined
  }

  const cases: EvalCase[] = []
  const seen = new Set<string>()

  raw.cases.forEach((entry, index) => {
    const where = `cases[${index}]`
    if (!isRecord(entry)) {
      fail(`${where} must be an object`)
      return
    }

    const { id, area, prompt, check, source } = entry
    if (!isNonEmptyString(id)) fail(`${where}.id must be a non-empty string`)
    if (!isNonEmptyString(area)) {
      fail(`${where}.area must be a non-empty string`)
    }
    if (!isNonEmptyString(prompt)) {
      fail(`${where}.prompt must be a non-empty string`)
    }
    if (!isNonEmptyString(check)) {
      fail(`${where}.check must be a non-empty string`)
    }
    if (!isNonEmptyString(source)) {
      fail(`${where}.source must be a non-empty string`)
      return
    }

    if (isNonEmptyString(id)) {
      if (seen.has(id)) fail(`${where}.id is duplicated: ${id}`)
      seen.add(id)
    }

    const sourcePath = join(REPO, source)
    if (!isFile(sourcePath)) {
      fail(`${where}.source does not exist on disk: ${source}`)
    }

    if (
      isNonEmptyString(id) &&
      isNonEmptyString(area) &&
      isNonEmptyString(prompt) &&
      isNonEmptyString(check) &&
      isNonEmptyString(source)
    ) {
      cases.push({ id, area, prompt, check, source })
    }
  })

  if (cases.length === 0) fail('no valid cases found')

  return { version: raw.version as number, skill: raw.skill as string, cases }
}

function main(): void {
  out('newui skill evals — score.ts')
  out(`cases file: ${CASES_PATH}`)

  const loaded = load()

  if (loaded) {
    const areas = new Map<string, number>()
    const sources = new Set<string>()
    for (const c of loaded.cases) {
      areas.set(c.area, (areas.get(c.area) ?? 0) + 1)
      sources.add(c.source)
    }

    out(`skill:      ${loaded.skill}`)
    out(`cases:      ${loaded.cases.length}`)
    out(
      `areas:      ${[...areas.entries()]
        .map(([area, count]) => `${area} ${count}`)
        .join(' · ')}`,
    )
    out(`sources:    ${sources.size} unique file(s), all present`)

    if (problems.length === 0) {
      out('result:     OK')
      out('')
      out('This file only checks shape. To score answers, follow run.md.')
      return
    }
  }

  err('')
  err(`result: FAILED (${problems.length} problem(s))`)
  for (const problem of problems) err(`  ✗ ${problem}`)
  process.exitCode = 1
}

main()
