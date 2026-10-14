import { describe, expect, it } from 'vitest'
import { buildProxyConfig, DEFAULT_PROXY_SOURCE, siteTarget } from './proxy'

describe('buildProxyConfig', () => {
  it('derives the Vite port and default source from the backend port', () => {
    const config = buildProxyConfig({}, 8000)
    expect(config.port).toBe(8080)

    const entry = config.proxy[DEFAULT_PROXY_SOURCE]
    expect(entry?.target).toBe('http://127.0.0.1:8000')
    expect(entry?.ws).toBe(true)
    expect(typeof entry?.router).toBe('function')
  })

  it('offsets the Vite port by the backend port', () => {
    expect(buildProxyConfig({}, 8001).port).toBe(8081)
  })

  it('honours an explicit Vite port, source and ws flag', () => {
    const config = buildProxyConfig(
      { port: 9000, source: '^/api', ws: false },
      8000,
    )
    expect(config.port).toBe(9000)
    expect(config.proxy['^/api']?.ws).toBe(false)
    expect(config.proxy[DEFAULT_PROXY_SOURCE]).toBeUndefined()
  })

  it('uses an explicit target and skips the per-site router', () => {
    const config = buildProxyConfig({ target: 'http://frappe.test:9000' }, 8000)
    const entry = config.proxy[DEFAULT_PROXY_SOURCE]
    expect(entry?.target).toBe('http://frappe.test:9000')
    expect(entry?.router).toBeUndefined()
  })

  it('defaults the backend port from options.backendPort', () => {
    expect(buildProxyConfig({ backendPort: 8002 }).port).toBe(8082)
  })
})

describe('siteTarget', () => {
  it('routes a site host to its own backend port', () => {
    expect(siteTarget('helpdesk.localhost:8080', 8000)).toBe(
      'http://helpdesk.localhost:8000',
    )
  })

  it('falls back to localhost when there is no host', () => {
    expect(siteTarget(undefined, 8000)).toBe('http://127.0.0.1:8000')
  })
})
