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
    name: 'Analytics charts',
    file: 'scripts/fixtures/analytics.ts',
    // SVG runtime plus only the marks rendered by the dashboard (~241 kB).
    budget: 250,
    forbid: [
      '"date-picker"',
      '"dialog"',
      '"slider"',
      'series.sankey',
      'series.heatmap',
      'series.scatter',
      'series.funnel',
    ],
  },
  {
    name: 'cn() only',
    file: 'scripts/fixtures/cn.ts',
    budget: 8,
  },
  {
    name: 'Button only',
    file: 'scripts/fixtures/button.ts',
    budget: 11,
    forbid: [
      '"dialog"',
      '"slider"',
      '"toast"',
      '"combobox"',
      '"accordion"',
      '"toggle-group"',
      '"pagination"',
    ],
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
    name: 'Atoms barrel',
    file: 'scripts/fixtures/atoms.ts',
    budget: 140,
    forbid: ['"chart"', '"editor"'],
  },
  {
    name: 'Molecules barrel',
    file: 'scripts/fixtures/molecules.ts',
    budget: 140,
    forbid: ['"chart"', '"editor"'],
  },
  {
    name: 'Organisms barrel',
    file: 'scripts/fixtures/organisms.ts',
    // Organisms compose controls, and the table/list own their optional render
    // engines. The `forbid` list keeps chart/editor payloads out.
    budget: 180,
    forbid: ['"slider"', '"toast"', '"tree-view"', '"date-picker"'],
  },
  {
    name: 'Templates barrel',
    file: 'scripts/fixtures/templates.ts',
    // The three templates: the integrated AppShell, split pane and auth frame.
    budget: 100,
    forbid: ['"slider"', '"toast"', '"tree-view"', '"date-picker"', '"chart"'],
  },
  {
    name: 'Data barrel',
    file: 'scripts/fixtures/data.ts',
    // The whole logic layer is formatting, selection, a snapshot signal and a
    // Blob dance — it must never cost what a control costs.
    budget: 6,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Data query',
    file: 'scripts/fixtures/data-query.ts',
    // 15.5 measured: TanStack Query plus the seam around it. The helpers stay
    // in the root entry; a page that only formats a number must not pay for
    // the cache.
    budget: 20,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Data form',
    file: 'scripts/fixtures/data-form.ts',
    // 17.5 measured: TanStack Form plus the submit lifecycle. A page that does
    // not render a form must not pay for the validator engine.
    budget: 22,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Data resource',
    file: 'scripts/fixtures/data-resource.ts',
    // The Frappe DocType client: fetch + IndexedDB + realtime multiplexer.
    // App-specific cost, behind its earned subpath — atoms must never
    // re-export it.
    budget: 12,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Atomic barrel',
    file: 'scripts/fixtures/all.ts',
    // The full core is an upper bound; regular consumers import only the levels
    // they use. The per-level entries above guard those costs, and `Button only`
    // is the leaf tree-shaking assertion.
    budget: 300,
  },
]

async function measure(entry: Entry) {
  const result = await build({
    logLevel: 'error',
    configFile: false,
    plugins: [solid()],
    build: {
      write: false,
      minify: 'oxc',
      lib: {
        entry: path.join(root, entry.file),
        formats: ['es'],
        fileName: 'out',
      },
      rolldownOptions: { external: ['solid-js', 'solid-js/web'] },
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
