import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { parseFrontmatter } from '@tanstack/intent'
import { describe, expect, it } from 'vitest'

/**
 * The package-publishing contract for Agent Skills.
 *
 * Intent validates structure and examples; this test pins the parts a package
 * release depends on: the skill ships in the tarball, its version matches the
 * package, and every source it cites still exists. `intent stale` stays the
 * advisory signal for whether the guidance itself needs a review.
 */

const ROOT = process.cwd()
const PACKAGES = join(ROOT, 'packages')

function packageDirs(): string[] {
  return ['atoms', 'data'].map((name) => join(PACKAGES, name))
}

function skillFiles(packageDir: string): string[] {
  const skills = join(packageDir, 'skills')
  if (!existsSync(skills)) return []
  return readdirSync(skills, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skills, entry.name, 'SKILL.md'))
    .filter((file) => existsSync(file))
}

describe('Agent Skills packages', () => {
  it('ships every skill, versioned with its package', () => {
    for (const packageDir of packageDirs()) {
      const manifest = JSON.parse(
        readFileSync(join(packageDir, 'package.json'), 'utf8'),
      ) as {
        version: string
        files?: string[]
        keywords?: string[]
        repository?: unknown
      }

      expect(manifest.files).toContain('skills')
      expect(manifest.keywords).toContain('tanstack-intent')
      expect(manifest.repository).toBeTruthy()

      const files = skillFiles(packageDir)
      expect(files.length).toBeGreaterThan(0)

      for (const file of files) {
        const frontmatter = parseFrontmatter(file)
        const metadata = frontmatter?.['metadata'] as
          | Record<string, unknown>
          | undefined
        expect(metadata?.['library_version']).toBe(manifest.version)
        expect(frontmatter?.['name']).toBe(basename(dirname(file)))
      }
    }
  })

  it('keeps every cited source on disk', () => {
    const missing: string[] = []
    for (const packageDir of packageDirs()) {
      for (const file of skillFiles(packageDir)) {
        const frontmatter = parseFrontmatter(file)
        const sources = frontmatter?.['sources']
        if (!Array.isArray(sources)) continue
        for (const source of sources) {
          if (typeof source !== 'string') continue
          const path = source.includes(':')
            ? source.slice(source.indexOf(':') + 1)
            : source
          if (!existsSync(join(ROOT, path))) {
            missing.push(`${relative(ROOT, file)} -> ${source}`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('keeps the planning records beside the skills', () => {
    for (const name of [
      'domain_map.yaml',
      'skill_spec.md',
      'skill_tree.yaml',
    ]) {
      expect(existsSync(join(ROOT, '_artifacts', name))).toBe(true)
    }
  })

  it('keeps the consumer allowlist explicit', () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'apps/starter/package.json'), 'utf8'),
    ) as {
      intent?: { skills?: unknown; exclude?: unknown }
    }
    expect(manifest.intent?.skills).toEqual(['workspace:@newui/*', '@newui/*'])
    expect(manifest.intent?.exclude).toEqual([
      'workspace:@newui/*#experimental-*',
      '@newui/*#experimental-*',
    ])
    expect(existsSync(join(ROOT, 'apps/starter/scripts/intent.mjs'))).toBe(true)
  })
})
