import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * GitHub Pages serves the site under a repository prefix (`/newui`). Router
 * links (`<A>`, `useNavigate`) apply that base themselves, but the library's
 * plain anchors (`SidebarItem route`, `Button route`, `Breadcrumbs` items and
 * literal `<a href>`) do not. A root-relative literal therefore leaves the
 * deployed site for `talelk.github.io/pages/...` and 404s.
 *
 * This is a source-shape check, like `routes.test.ts`: the failure mode is a
 * literal that looks correct locally and only breaks on the project Pages URL.
 */
const APP_SRC = path.join(process.cwd(), 'apps/playground/src')
const SCAN_DIRS = ['examples', 'pages', 'shell', 'lib', 'patterns']
const IGNORED_DIRS = new Set(['stories', 'generated', 'node_modules'])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (IGNORED_DIRS.has(entry.name)) return []
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(file)
    return /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')
      ? [file]
      : []
  })
}

const BARE_ROUTE_PROP = /\broute="\/(?!\/)/
const BARE_ROUTE_OBJECT = /\broute:\s*['"]\/(?!\/)/
const BARE_PLAIN_ANCHOR = /<a\b[^>]*\bhref="\/(?!\/)/s

describe('deploy-base links', () => {
  it('sends every plain in-app anchor through sitePath()', () => {
    const offenders: string[] = []
    for (const directory of SCAN_DIRS) {
      for (const file of sourceFiles(path.join(APP_SRC, directory))) {
        const source = readFileSync(file, 'utf8')
        const relative = path.relative(APP_SRC, file)
        if (BARE_ROUTE_PROP.test(source)) offenders.push(`${relative}: route`)
        if (BARE_ROUTE_OBJECT.test(source))
          offenders.push(`${relative}: breadcrumb route`)
        if (BARE_PLAIN_ANCHOR.test(source))
          offenders.push(`${relative}: <a href>`)
      }
    }
    expect(
      offenders,
      'Root-relative plain anchors miss the GitHub Pages base; wrap them in sitePath().',
    ).toEqual([])
  })
})
