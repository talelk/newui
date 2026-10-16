import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Referenced-but-undefined animation guard.
 *
 * A component can reference `animate-[name_…]` while no `@keyframes name`
 * exists anywhere — the class compiles, the utility is emitted, and the element
 * simply never animates. That is a silent no-op no other test catches (it is how
 * the indeterminate Progress bar shipped dead once). This asserts every custom
 * animation a component names is actually defined.
 */
const TAILWIND_SRC = path.join(process.cwd(), 'packages/tailwind/src')
const UI_SRC = path.join(process.cwd(), 'packages/ui/src')
const BLOCKS_SRC = path.join(process.cwd(), 'packages/blocks/src')
const TAILWIND_BUILTINS = new Set(['spin', 'pulse', 'ping', 'bounce'])

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full)
  }
  return out
}

const defined = new Set<string>()
for (const file of walk(TAILWIND_SRC)) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/@keyframes\s+([\w-]+)/g)) {
    const name = match[1]
    if (name) defined.add(name)
  }
}

const referenced = new Map<string, string>()
// Components *and* the blocks composed from them: a block is library code too,
// and the animation it names has to exist just as much.
for (const file of [...walk(UI_SRC), ...walk(BLOCKS_SRC)]) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/animate-\[([\w-]+?)_/g)) {
    const name = match[1]
    if (name) referenced.set(name, path.relative(process.cwd(), file))
  }
}

describe('animation keyframes', () => {
  it('defines every custom animation a component references', () => {
    const missing: string[] = []
    for (const [name, file] of referenced) {
      if (TAILWIND_BUILTINS.has(name)) continue
      if (!defined.has(name)) missing.push(`${name} (referenced in ${file})`)
    }
    expect(missing).toEqual([])
  })

  it('respects prefers-reduced-motion', () => {
    const css = readFileSync(path.join(TAILWIND_SRC, 'utilities.css'), 'utf8')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
