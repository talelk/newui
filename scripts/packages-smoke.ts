/**
 * The tarball smoke: pack every publishable package and assert the artifact
 * contains exactly what its `exports` map promises.
 *
 * publint validates the manifest's *shape*; this validates the *artifact* —
 * a `files` field that forgets `src/` or a condition pointing outside the
 * tarball fails here, as an install error a consumer would hit, not as a
 * manifest lint.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const packagesDir = path.join(root, 'packages')

const PACKAGES = readdirSync(packagesDir).filter((name) => {
  const manifest = path.join(packagesDir, name, 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    return pkg.private !== true && pkg.name?.startsWith('@newui/')
  } catch {
    return false
  }
})

const dest = mkdtempSync(path.join(tmpdir(), 'newui-pack-'))
let failures = 0

function listTarball(tarball: string): string[] {
  return execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
}

for (const name of PACKAGES) {
  const pkgDir = path.join(packagesDir, name)
  const pkg = JSON.parse(
    readFileSync(path.join(pkgDir, 'package.json'), 'utf8'),
  )

  let tarball: string
  try {
    const packed = JSON.parse(
      execFileSync('pnpm', ['pack', '--pack-destination', dest, '--json'], {
        cwd: pkgDir,
        encoding: 'utf8',
      }),
    ) as { filename: string }
    tarball = packed.filename
  } catch (error) {
    console.error(`✗ ${pkg.name}: pack failed\n${error}`)
    failures += 1
    continue
  }

  if (!tarball) {
    console.error(`✗ ${pkg.name}: pack produced no artifact`)
    failures += 1
    continue
  }

  const contents = listTarball(tarball)

  // Every `exports` target (and the types it names) must exist in the tarball.
  const targets: string[] = []
  for (const value of Object.values(pkg.exports ?? {})) {
    for (const condition of Object.values(value as Record<string, string>)) {
      targets.push(condition)
    }
  }
  const missing = targets.filter(
    (target) => !contents.includes(`package/${target.replace(/^\.\//, '')}`),
  )
  if (missing.length > 0) {
    console.error(
      `✗ ${pkg.name}: exports point outside the tarball: ${missing.join(', ')}`,
    )
    failures += 1
    continue
  }

  if (contents.some((entry) => entry.includes('node_modules'))) {
    console.error(`✗ ${pkg.name}: tarball ships node_modules`)
    failures += 1
    continue
  }

  console.warn(`ok  ${pkg.name} (${contents.length} files)`)
}

rmSync(dest, { recursive: true, force: true })

if (failures > 0) {
  console.error(`[packages:smoke] ${failures} package(s) failed`)
  process.exit(1)
}
console.warn('[packages:smoke] every tarball carries its exports map')
