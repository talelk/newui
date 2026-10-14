/**
 * One-off port of frappe-ui's Vue icon components to Solid TSX.
 *
 * Each source `.vue` is a `<template>` wrapping a single inline `<svg>` that
 * paints with `currentColor`. The conversion is mechanical: lift the `<svg>`,
 * inject `class={props.class}` + `aria-hidden="true"` into the root, and wrap it
 * in a Solid component. Run with `node scripts/port-icons.mjs`.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const repo = process.cwd()
const srcDir = path.join(repo, 'frappe-ui-main/icons')
const outDir = path.join(repo, 'packages/icons/src')
mkdirSync(outDir, { recursive: true })

const files = readdirSync(srcDir).filter((f) => f.endsWith('.vue'))
const names = []

for (const file of files) {
  const name = file.replace(/\.vue$/, '')
  const source = readFileSync(path.join(srcDir, file), 'utf8')
  const template = source.match(/<template>([\s\S]*?)<\/template>/)
  if (!template) continue

  let svg = template[1].trim()
  // Strip any Vue-only bindings that would not survive as JSX.
  svg = svg
    .replace(/\s:v-[\w-]+="[^"]*"/g, '')
    .replace(/\sv-[\w-]+="[^"]*"/g, '')
  // Drop a pre-existing class attribute; the component forwards `props.class`.
  svg = svg.replace(/\sclass="[^"]*"/g, '')
  // Inject class forwarding + aria-hidden into the root <svg>.
  svg = svg.replace(
    /<svg\b/,
    '<svg\n    class={props.class}\n    aria-hidden="true"',
  )

  const tsx = `import type { JSX } from 'solid-js'

export function ${name}(props: { class?: string }): JSX.Element {
  return (
${svg
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')}
  )
}
`

  writeFileSync(path.join(outDir, `${name}.tsx`), tsx)
  names.push(name)
}

names.sort()
const barrel = names.map((n) => `export { ${n} } from './${n}'`).join('\n')
writeFileSync(path.join(outDir, 'index.ts'), `${barrel}\n`)

console.warn(`[port-icons] wrote ${names.length} icons`)
