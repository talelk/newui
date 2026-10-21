/**
 * The framework-neutral request client for the resource layer.
 *
 * A Solid port of frappe-ui's `frappeRequest` + `request` pair, reduced to what
 * the signal-based resources need: a configurable base URL / headers, POST to
 * `/api/method/<dotted.method>`, JSON in and out, and one error shape for every
 * way a request can fail. It is pure — the only side effect is `fetch` — so the
 * whole thing is testable by stubbing the global.
 *
 * Nothing here touches Solid. `resource.ts` wraps it with signals.
 */

/** Configuration merged by {@link setConfig}. Every field is optional. */
export interface ClientConfig {
  /** Base URL prepended to relative (`/`-rooted) request URLs. */
  baseUrl?: string
  /** Extra headers merged into every request. Static, or a getter. */
  headers?: Record<string, string> | (() => Record<string, string>)
  /**
   * Credentials mode. Defaults to `same-origin`, or `include` when a
   * `baseUrl` is configured (cookie-based cross-origin auth).
   */
  credentials?: RequestCredentials
  /** Called with Frappe's `_server_messages` when a successful response carries them. */
  onServerMessages?: (messages: string[]) => void
  /** The fetch implementation. Defaults to the global `fetch`. */
  fetch?: typeof fetch
}

const defaults: ClientConfig = {}

/**
 * Merge configuration. Keys are merged, not replaced, so calling it twice
 * (`baseUrl`, then `headers`) keeps both. Use {@link resetConfig} in tests.
 */
export function setConfig(config: ClientConfig): void {
  Object.assign(defaults, config)
}

/** A copy of the current configuration. */
export function getConfig(): ClientConfig {
  return { ...defaults }
}

/** Clear every configured value, back to the built-in defaults. */
export function resetConfig(): void {
  for (const key of Object.keys(defaults) as (keyof ClientConfig)[]) {
    delete defaults[key]
  }
}

/** Options for a single {@link request}. */
export interface RequestOptions {
  /** Absolute URL, `/api/method/…`, or a dotted method name (`frappe.client.get`). */
  url: string
  /** HTTP method. Defaults to `POST`, Frappe's convention for method calls. */
  method?: string
  /** Query params (GET) or JSON body (everything else). */
  params?: Record<string, unknown>
  /** Per-request headers, merged last. */
  headers?: Record<string, string>
  /** Abort signal for the fetch. */
  signal?: AbortSignal
  /** Overrides the configured credentials mode. */
  credentials?: RequestCredentials
}

/** One field of Frappe's JSON error body. */
interface FrappeResponseBody {
  docs?: unknown
  exc?: string
  exc_type?: string
  message?: unknown
  _server_messages?: string
  _error_message?: string
}

/** Options accepted by {@link RequestError}. */
export interface RequestErrorOptions {
  status?: number
  response?: Response
  excType?: string
  exc?: string
  messages?: string[]
}

/**
 * What every request failure rejects with: transport errors, non-2xx
 * responses, and an ok response whose body will not parse. Narrow by field
 * (`error.status`, `error.messages`); `messages` is always a `string[]`.
 */
export class RequestError extends Error {
  readonly status?: number
  readonly response?: Response
  readonly excType?: string
  readonly exc?: string
  readonly messages: string[]

  constructor(message: string, options: RequestErrorOptions = {}) {
    super(message)
    this.name = 'RequestError'
    this.status = options.status
    this.response = options.response
    this.excType = options.excType
    this.exc = options.exc
    this.messages = options.messages ?? []
  }
}

/** True for a deliberate abort, which is not a resource error. */
export function isAbortError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { name?: unknown }).name === 'AbortError'
  )
}

/**
 * Coerce anything thrown by `fetch` (or the caller's `transform`) into a
 * {@link RequestError}, preserving the original `name` so `AbortError` stays
 * detectable.
 */
export function normalizeError(error: unknown): RequestError {
  if (error instanceof RequestError) return error
  const message = error instanceof Error ? error.message : String(error)
  const normalized = new RequestError(message)
  if (error instanceof Error && error.name) normalized.name = error.name
  return normalized
}

function resolveUrl(rawUrl: string): string {
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  const path = rawUrl.startsWith('/') ? rawUrl : `/api/method/${rawUrl}`
  const { baseUrl } = defaults
  if (baseUrl && path.startsWith('/')) {
    return baseUrl.replace(/\/+$/, '') + path
  }
  return path
}

function resolveHeaders(options: RequestOptions): Record<string, string> {
  const configHeaders = defaults.headers
  const extra =
    typeof configHeaders === 'function'
      ? configHeaders()
      : (configHeaders ?? {})
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ...extra,
    ...(options.headers ?? {}),
  }
  if (typeof window !== 'undefined' && window.csrf_token) {
    if (window.csrf_token !== '{{ csrf_token }}') {
      headers['X-Frappe-CSRF-Token'] = window.csrf_token
    }
  }
  return headers
}

declare global {
  interface Window {
    csrf_token?: string
  }
}

function appendQuery(url: string, params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    search.append(
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value),
    )
  }
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

function isLoginUrl(url: string): boolean {
  const path = url.split(/[?#]/)[0]?.replace(/\/+$/, '') ?? ''
  return path === '/api/method/login' || path.endsWith('/api/method/login')
}

function parseExc(exc: string | undefined): string | undefined {
  if (!exc) return undefined
  try {
    const parsed = JSON.parse(exc) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0])
    return exc
  } catch {
    return exc
  }
}

function normalizeMessages(body: FrappeResponseBody): string[] {
  let messages: string[] = []
  if (body._server_messages) {
    try {
      const parsed = JSON.parse(body._server_messages) as unknown
      if (Array.isArray(parsed)) messages = parsed.map(String)
    } catch {
      messages = []
    }
  }
  if (body.message !== undefined)
    messages = messages.concat(String(body.message))
  messages = messages
    .map((message) => {
      try {
        const parsed = JSON.parse(message) as { message?: string }
        return parsed.message ?? message
      } catch {
        return message
      }
    })
    .filter(Boolean)
  if (messages.length === 0) {
    messages = body._error_message
      ? [body._error_message]
      : ['Internal Server Error']
  }
  return messages
}

function reportServerMessages(body: FrappeResponseBody): void {
  if (!body._server_messages) return
  const handler = defaults.onServerMessages
  if (!handler) return
  try {
    const parsed = JSON.parse(body._server_messages) as unknown
    if (Array.isArray(parsed)) handler(parsed.map(String))
  } catch {
    // A malformed `_server_messages` is not worth failing an ok response over.
  }
}

/**
 * Fetch a Frappe method and return its `message`.
 *
 * `url` may be absolute, `/api/method/…`, or a bare dotted method name. GET
 * params become the query string; every other method sends them as a JSON body.
 * A body carrying `docs` (or the login endpoint) is returned whole; otherwise
 * `message` is unwrapped. Failures reject with a {@link RequestError}.
 */
export async function request<TResponse = unknown>(
  options: RequestOptions,
): Promise<TResponse> {
  if (!options.url) {
    throw new RequestError('[request] options.url is required')
  }
  const method = (options.method ?? 'POST').toUpperCase()
  const resolved = resolveUrl(options.url)
  const headers = resolveHeaders(options)

  let url = resolved
  let body: string | undefined
  if (options.params && method === 'GET') {
    url = appendQuery(resolved, options.params)
  } else if (options.params) {
    body = JSON.stringify(options.params)
  }

  const credentials =
    options.credentials ??
    defaults.credentials ??
    (defaults.baseUrl && resolved.startsWith(defaults.baseUrl)
      ? 'include'
      : undefined)

  const fetchImpl = defaults.fetch ?? fetch
  const response = await fetchImpl(url, {
    method,
    headers,
    body,
    signal: options.signal,
    ...(credentials ? { credentials } : {}),
  })

  if (response.ok) {
    const data = (await response.json()) as FrappeResponseBody
    reportServerMessages(data)
    if (data.docs !== undefined || isLoginUrl(url)) {
      return data as TResponse
    }
    return data.message as TResponse
  }

  const text = await response.text()
  let errorBody: FrappeResponseBody = {}
  try {
    errorBody = JSON.parse(text) as FrappeResponseBody
  } catch {
    // A non-JSON error body (login HTML, proxy error) still fails as a request.
  }
  const detail = [url, errorBody.exc_type, errorBody._error_message]
    .filter(Boolean)
    .join(' ')
  throw new RequestError(detail || response.statusText || 'Request failed', {
    status: response.status,
    response,
    excType: errorBody.exc_type,
    exc: parseExc(errorBody.exc),
    messages: normalizeMessages(errorBody),
  })
}
