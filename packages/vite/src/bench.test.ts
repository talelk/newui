import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findBenchPath,
  readCommonSiteConfig,
  resolveBackendPort,
} from './bench'

let root: string

beforeEach(() => {
  vi.stubEnv('FRAPPE_BENCH_PATH', '')
  vi.stubEnv('FRAPPE_WEB_SERVER_PORT', '')
  root = realpathSync(mkdtempSync(join(tmpdir(), 'newui-vite-bench-')))
  mkdirSync(join(root, 'bench', 'sites'), { recursive: true })
  mkdirSync(join(root, 'bench', 'apps', 'helpdesk', 'frontend'), {
    recursive: true,
  })
  mkdirSync(join(root, 'projects', 'gameplan', 'frontend'), { recursive: true })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  rmSync(root, { recursive: true, force: true })
})

function runIn(dir: string) {
  vi.spyOn(process, 'cwd').mockReturnValue(dir)
}

describe('findBenchPath', () => {
  it('finds a bench above an app inside it', () => {
    runIn(join(root, 'bench', 'apps', 'helpdesk', 'frontend'))
    expect(findBenchPath()).toBe(join(root, 'bench'))
  })

  it('finds a bench an app is linked into, via FRAPPE_BENCH_PATH', () => {
    symlinkSync(
      join(root, 'projects', 'gameplan'),
      join(root, 'bench', 'apps', 'gameplan'),
    )
    vi.stubEnv('FRAPPE_BENCH_PATH', join(root, 'bench'))
    runIn(join(root, 'projects', 'gameplan', 'frontend'))
    expect(findBenchPath()).toBe(join(root, 'bench'))
  })

  it('prefers the bench above the app to FRAPPE_BENCH_PATH', () => {
    mkdirSync(join(root, 'other-bench', 'apps', 'helpdesk'), {
      recursive: true,
    })
    mkdirSync(join(root, 'other-bench', 'sites'))
    vi.stubEnv('FRAPPE_BENCH_PATH', join(root, 'other-bench'))
    runIn(join(root, 'bench', 'apps', 'helpdesk', 'frontend'))
    expect(findBenchPath()).toBe(join(root, 'bench'))
  })

  it('warns once and still returns a non-bench FRAPPE_BENCH_PATH', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubEnv('FRAPPE_BENCH_PATH', join(root, 'projects'))
    runIn(join(root, 'projects', 'gameplan', 'frontend'))
    expect(findBenchPath()).toBe(join(root, 'projects'))
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('finds nothing outside a bench', () => {
    runIn(join(root, 'projects', 'gameplan', 'frontend'))
    expect(findBenchPath()).toBeNull()
  })
})

describe('readCommonSiteConfig', () => {
  it('reads webserver_port from the bench', () => {
    runIn(join(root, 'bench', 'apps', 'helpdesk', 'frontend'))
    writeFileSync(
      join(root, 'bench', 'sites', 'common_site_config.json'),
      JSON.stringify({ webserver_port: 8001 }),
    )
    expect(readCommonSiteConfig()).toEqual({ webserver_port: 8001 })
  })

  it('is null when there is no config file', () => {
    runIn(join(root, 'bench', 'apps', 'helpdesk', 'frontend'))
    expect(readCommonSiteConfig()).toBeNull()
  })
})

describe('resolveBackendPort', () => {
  it('prefers FRAPPE_WEB_SERVER_PORT', () => {
    vi.stubEnv('FRAPPE_WEB_SERVER_PORT', '9001')
    expect(resolveBackendPort()).toBe(9001)
  })

  it('falls back to common_site_config.json', () => {
    runIn(join(root, 'bench', 'apps', 'helpdesk', 'frontend'))
    writeFileSync(
      join(root, 'bench', 'sites', 'common_site_config.json'),
      JSON.stringify({ webserver_port: 8001 }),
    )
    expect(resolveBackendPort()).toBe(8001)
  })

  it('defaults to 8000 with no bench', () => {
    runIn(join(root, 'projects', 'gameplan', 'frontend'))
    expect(resolveBackendPort()).toBe(8000)
  })
})
