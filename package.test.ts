/**
 * The published manifests: every `exports` target resolves to a real file, and
 * no subpath uses a wildcard (which would leak `src/**` to consumers).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const packagesDir = path.join(root, 'packages')

interface Manifest {
  name: string
  exports?: Record<string, Record<string, string> | string>
}

const manifests: { dir: string; manifest: Manifest }[] = readdirSync(
  packagesDir,
  { withFileTypes: true },
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const dir = path.join(packagesDir, entry.name)
    return {
      dir,
      manifest: JSON.parse(
        readFileSync(path.join(dir, 'package.json'), 'utf8'),
      ) as Manifest,
    }
  })

describe('package manifests', () => {
  it('found the workspace packages', () => {
    expect(manifests.length).toBeGreaterThan(0)
  })

  for (const { dir, manifest } of manifests) {
    const exportsMap = manifest.exports
    if (!exportsMap) continue

    it(`${manifest.name}: every export target exists and no wildcard subpath`, () => {
      for (const [subpath, conditions] of Object.entries(exportsMap)) {
        expect(subpath.includes('*'), `${subpath} uses a wildcard`).toBe(false)
        const targets =
          typeof conditions === 'string'
            ? [conditions]
            : Object.values(conditions)
        for (const target of targets) {
          expect(
            existsSync(path.join(dir, target)),
            `${subpath} -> ${target} does not exist`,
          ).toBe(true)
        }
      }
    })
  }
})
