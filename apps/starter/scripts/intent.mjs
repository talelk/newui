#!/usr/bin/env node
/**
 * Run Intent from the starter's own dependency.
 *
 * Both `@tanstack/intent` and `@tanstack/devtools-event-client` publish an
 * `intent` bin. pnpm links the latter for this package, so `intent` here is not
 * the CLI we want. Resolving the package entry directly is stable in a copied
 * app and keeps the scripts independent of bin ordering.
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const entry = import.meta.resolve('@tanstack/intent')
const cli = join(dirname(fileURLToPath(entry)), 'cli.mjs')
const root = dirname(dirname(fileURLToPath(import.meta.url)))

const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
