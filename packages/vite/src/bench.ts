/**
 * Locating a Frappe bench, so the dev proxy can auto-detect the webserver port
 * the way `frappe-ui/vite` does. Every function here is best-effort: an app
 * outside a bench (a plain Vite project) still gets working defaults.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/** The subset of `sites/common_site_config.json` this package reads. */
export interface CommonSiteConfig {
  webserver_port?: number
}

const warnedBenchPaths = new Set<string>()

/**
 * Walk up from the current directory looking for a bench — a directory that
 * holds both `apps/` and `sites/`. Falls back to `FRAPPE_BENCH_PATH`, which a
 * tool that links an app into a bench from elsewhere sets.
 */
export function findBenchPath(): string | null {
  let dir = path.resolve('.')
  while (dir !== path.dirname(dir)) {
    if (isBench(dir)) return dir
    dir = path.dirname(dir)
  }

  const fromEnv = process.env['FRAPPE_BENCH_PATH']
  if (fromEnv) {
    const resolved = path.resolve(fromEnv)
    if (!isBench(resolved) && !warnedBenchPaths.has(resolved)) {
      warnedBenchPaths.add(resolved)
      console.warn(
        `[newui/vite] FRAPPE_BENCH_PATH is ${resolved}, which has no apps/ and sites/ folders`,
      )
    }
    return resolved
  }

  return null
}

/** Read `sites/common_site_config.json`, or `null` when there is no bench. */
export function readCommonSiteConfig(): CommonSiteConfig | null {
  const benchPath = findBenchPath()
  if (!benchPath) return null

  const configPath = path.join(benchPath, 'sites', 'common_site_config.json')
  if (!existsSync(configPath)) return null

  try {
    return JSON.parse(readFileSync(configPath, 'utf8')) as CommonSiteConfig
  } catch {
    return null
  }
}

/**
 * The Frappe webserver port: `FRAPPE_WEB_SERVER_PORT` first, then
 * `common_site_config.json`, then the Frappe default of `8000`.
 */
export function resolveBackendPort(): number {
  const fromEnv = process.env['FRAPPE_WEB_SERVER_PORT']
  if (fromEnv) {
    const port = Number.parseInt(fromEnv, 10)
    if (Number.isFinite(port)) return port
  }

  const configured = readCommonSiteConfig()?.webserver_port
  if (typeof configured === 'number') return configured

  return 8000
}

function isBench(dir: string): boolean {
  return (
    existsSync(path.join(dir, 'sites')) && existsSync(path.join(dir, 'apps'))
  )
}
