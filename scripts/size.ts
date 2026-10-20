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
    name: 'Blocks barrel',
    file: 'scripts/fixtures/blocks.ts',
    // All six blocks: ~73 kB, because a composed section drags the components
    // it composes — the sidebar brings `ScrollArea` and the tooltip, the
    // toolbar brings the menu, the filter bar brings `Select`. The `forbid` list
    // is the assertion that matters: a block may not carry a machine it never
    // reaches for, and nothing here may pull the charts or the editor in.
    budget: 80,
    forbid: ['"slider"', '"toast"', '"tree-view"', '"date-picker"'],
  },
  {
    name: 'Layouts barrel',
    file: 'scripts/fixtures/layouts.ts',
    // Both layouts: a frame that composes `ResponsiveShell` (and so the
    // sidebar's folding column, its tooltips and the mobile bar) plus a
    // two-pane split that is its own thing. 36.4 measured after the frame grew
    // a rail; the level is meant to grow, so the headroom is deliberate. What
    // matters is the `forbid` list: none of this may reach a chart or an editor.
    budget: 44,
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
    name: 'Data table',
    file: 'scripts/fixtures/data-table.ts',
    // 37.6 measured: TanStack Table is the heaviest dependency the kit owns,
    // which is exactly why the surface lives here and not in `@newui/ui`.
    budget: 42,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Data virtual',
    file: 'scripts/fixtures/data-virtual.ts',
    // 20.0 measured: TanStack Virtual plus the scroll region around it. The
    // headroom is deliberate — a budget at exactly the measured number turns
    // the next honest addition into a red gate.
    budget: 24,
    forbid: ['"dialog"', '"combobox"', '"chart"', '"editor"'],
  },
  {
    name: 'Full barrel',
    file: 'scripts/fixtures/all.ts',
    // Raised 132 → 140 (Combobox), 140 → 172 (DatePicker's
    // `@internationalized/date`), 172 → 210 (the mobile/settings/tree/
    // file-upload/time-picker/context-menu batch), 210 → 225 (the frappe-ui
    // surface-parity pass: toggle/selection/display/overlay props), 225 → 245
    // (the disclosure/pagination/empty-state/timeline/toggle-group/
    // progress-circle batch: seven components, ~14 kB of recipe and machine
    // wiring). The barrel is every component by definition; that `Button`-only
    // stays under 11 kB — with the new machines named in its `forbid` list — is
    // the tree-shaking guard for all of them.
    budget: 245,
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
