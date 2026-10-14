/**
 * Bundle-size and tree-shaking budget.
 *
 * Measures the *library* code each import actually pulls in (solid-js is
 * external, so its cost is not counted), then asserts two things:
 *
 *  1. A size budget per entry, so an accidental heavy import is caught in CI
 *     rather than discovered in production.
 *  2. Tree-shaking actually works — importing `Button` must not drag in the
 *     Dialog machine. A barrel that quietly bundles everything is the classic
 *     regression here.
 */

import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import solid from 'vite-plugin-solid'

const root = process.cwd()

interface Entry {
  name: string
  file: string
  /** gzip budget in kB. */
  budget: number
  /** Substrings that must NOT appear (modules that should be shaken out). */
  forbid?: string[]
}

const ENTRIES: Entry[] = [
  {
    name: 'cn() only',
    file: 'scripts/fixtures/cn.ts',
    budget: 8,
  },
  {
    name: 'Button only',
    file: 'scripts/fixtures/button.ts',
    budget: 11,
    forbid: ['"dialog"', '"slider"', '"toast"', '"combobox"'],
  },
  {
    name: 'Button + Dialog',
    file: 'scripts/fixtures/dialog.ts',
    budget: 34,
    forbid: ['"slider"', '"toast"'],
  },
  {
    name: 'DatePicker only',
    file: 'scripts/fixtures/datepicker.ts',
    // Dominated by `@internationalized/date`, which Zag's date-picker requires.
    // No `"dialog"` forbid here: the date-picker's own Zag dependency chain
    // contains that literal, so it is not a Dialog-specific marker.
    budget: 60,
    forbid: ['"slider"', '"toast"'],
  },
  {
    name: 'Full barrel',
    file: 'scripts/fixtures/all.ts',
    // Raised 132 → 140 (Combobox), 140 → 172 (DatePicker's
    // `@internationalized/date`), 172 → 210 (the mobile/settings/tree/
    // file-upload/time-picker/context-menu batch), 210 → 225 (the frappe-ui
    // surface-parity pass: toggle/selection/display/overlay props). The barrel
    // is every component by definition; that `Button`-only stays under 11 kB is
    // the tree-shaking guard for all of them.
    budget: 225,
  },
]

async function measure(entry: Entry) {
  const result = await build({
    logLevel: 'error',
    configFile: false,
    plugins: [solid()],
    build: {
      write: false,
      minify: 'esbuild',
      lib: {
        entry: path.join(root, entry.file),
        formats: ['es'],
        fileName: 'out',
      },
      rollupOptions: { external: ['solid-js', 'solid-js/web'] },
    },
  })

  const outputs = Array.isArray(result) ? result : [result]
  const code = outputs
    .flatMap((o) => ('output' in o ? o.output : []))
    .filter(
      (chunk): chunk is { type: 'chunk'; code: string } =>
        chunk.type === 'chunk',
    )
    .map((chunk) => chunk.code)
    .join('\n')

  const gzipKb = gzipSync(code).length / 1024
  return { code, gzipKb }
}

const failures: string[] = []
console.warn('\nBundle budget (library code, solid-js external)\n')

for (const entry of ENTRIES) {
  const { code, gzipKb } = await measure(entry)
  const withinBudget = gzipKb <= entry.budget
  const shaken = (entry.forbid ?? []).filter((needle) => code.includes(needle))

  console.warn(
    `${withinBudget ? 'ok  ' : 'FAIL'}  ${entry.name.padEnd(16)} ${gzipKb
      .toFixed(2)
      .padStart(7)} kB gzip  (budget ${entry.budget})`,
  )

  if (!withinBudget) {
    failures.push(
      `${entry.name}: ${gzipKb.toFixed(2)} kB exceeds budget ${entry.budget} kB`,
    )
  }
  if (shaken.length) {
    failures.push(
      `${entry.name}: tree-shaking failed — bundle contains ${shaken.join(', ')}`,
    )
  }
}

console.warn('')

if (failures.length) {
  console.error('Bundle budget failures:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.warn('All bundle budgets pass.\n')
