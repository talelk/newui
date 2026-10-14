/**
 * The Frappe dev-server proxy. The builder is pure given its inputs, so the
 * port/source/router maths is unit-testable without a running Vite server;
 * `frappeProxy` wires it into a `Plugin`.
 */
import type { Plugin, ProxyOptions } from 'vite'
import { resolveBackendPort } from './bench'

/** Options for the `frappeProxy` sub-plugin. */
export interface FrappeProxyOptions {
  /**
   * Backend base URL, e.g. `http://127.0.0.1:8000`. When omitted, derived from
   * `backendPort` and requests are routed per-site by their `Host` header.
   */
  target?: string
  /**
   * Backend webserver port, used when `target` is not set.
   * @default FRAPPE_WEB_SERVER_PORT, then common_site_config.json, then 8000
   */
  backendPort?: number
  /**
   * Vite dev-server port.
   * @default 8080 + (backendPort - 8000)
   */
  port?: number
  /**
   * Regex (as a string) matching request paths to proxy to the backend.
   * @default '^/(desk|app|login|api|assets|files|private)'
   */
  source?: string
  /**
   * Proxy websockets as well as HTTP.
   * @default true
   */
  ws?: boolean
}

/** The default proxy path pattern, matching frappe-ui. */
export const DEFAULT_PROXY_SOURCE =
  '^/(desk|app|login|api|assets|files|private)'

const BASE_BACKEND_PORT = 8000
const BASE_VITE_PORT = 8080

/**
 * Per-request target selection. `http-proxy` supports `router` at runtime, but
 * Vite's bundled `ProxyOptions` type omits it, so it is added here.
 */
export type ProxyRouter = (req: { headers: { host?: string } }) => string

/** The `server` config the proxy contributes: a Vite port and a proxy map. */
export interface ProxyConfig {
  port: number
  proxy: Record<string, ProxyOptions & { router?: ProxyRouter }>
}

/**
 * Build the `server.port` + `server.proxy` config. Pure: pass `backendPort`
 * explicitly (or set `options.backendPort`) and the result is deterministic.
 */
export function buildProxyConfig(
  options: FrappeProxyOptions = {},
  backendPort = options.backendPort ?? BASE_BACKEND_PORT,
): ProxyConfig {
  const port =
    options.port ?? BASE_VITE_PORT + (backendPort - BASE_BACKEND_PORT)
  const source = options.source ?? DEFAULT_PROXY_SOURCE
  const ws = options.ws ?? true
  const target = options.target ?? `http://127.0.0.1:${backendPort}`

  const entry: ProxyOptions & { router?: ProxyRouter } = { target, ws }

  // A multi-site bench serves each site on its own host. When the caller has
  // not pinned a single target, route by the request's Host header so the
  // backend sees the site the browser asked for.
  if (!options.target) {
    entry.router = (req) => siteTarget(req.headers.host, backendPort)
  }

  return { port, proxy: { [source]: entry } }
}

/** Map a request `Host` header to a per-site backend URL. */
export function siteTarget(
  host: string | undefined,
  backendPort: number,
): string {
  const site = host?.split(':')[0]
  return site
    ? `http://${site}:${backendPort}`
    : `http://127.0.0.1:${backendPort}`
}

/** The `frappeProxy` Vite plugin: dev-server proxy to a Frappe backend. */
export function frappeProxy(options: FrappeProxyOptions = {}): Plugin {
  const backendPort = options.backendPort ?? resolveBackendPort()
  const { port, proxy } = buildProxyConfig(options, backendPort)

  return {
    name: 'newui:frappe-proxy',
    config: () => ({ server: { port, proxy } }),
  }
}
