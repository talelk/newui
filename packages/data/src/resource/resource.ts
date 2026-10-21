import { type Accessor, createSignal } from 'solid-js'
import {
  isAbortError,
  normalizeError,
  type RequestError,
  type RequestOptions,
  request,
} from './client'

/** The request function a resource uses. Defaults to the module {@link request}. */
export type ResourceFetcher = <TResponse = unknown>(
  options: RequestOptions,
) => Promise<TResponse>

/**
 * Options for {@link createResource}. `url` and `params` may be accessors so
 * the resource re-reads them on every fetch (a reactive `name`, a filter).
 */
export interface ResourceOptions<
  TData = unknown,
  TInput = unknown,
  TParams = Record<string, unknown>,
> {
  /** Absolute URL, `/api/method/…`, or a dotted method name. Accessor allowed. */
  url: string | (() => string)
  /** HTTP method. Defaults to `POST`. */
  method?: string
  /** Static params, or an accessor for reactive params. */
  params?: TParams | (() => TParams)
  /**
   * Map the value passed to `reload`/`submit` into request params. When absent,
   * a passed value is used as the params directly.
   */
  makeParams?: (input: TInput) => TParams
  /** Value before the first fetch. */
  initialData?: TData | null
  /** Fetch on creation. Defaults to `false`. */
  auto?: boolean
  /** Map the raw response into `TData`. */
  transform?: (data: unknown) => TData
  onSuccess?: (data: TData) => void
  onError?: (error: RequestError) => void
  /** Custom request function; defaults to the module client. */
  fetcher?: ResourceFetcher
}

/**
 * A generic, signal-based resource. Every field is an accessor; every action is
 * a plain function. There is no Vue `ref`/`reactive` and no `v-model`.
 */
export interface Resource<TData = unknown, TInput = unknown> {
  data: Accessor<TData | null>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  /** True once a fetch has resolved at least once. */
  fetched: Accessor<boolean>
  /** The in-flight promise, or the last one. */
  promise: Accessor<Promise<TData | null> | null>
  /** Read: fetch, resolving with the data (or the previous data) even on failure. */
  reload: (input?: TInput) => Promise<TData | null>
  /** Alias of {@link Resource.reload}. */
  fetch: (input?: TInput) => Promise<TData | null>
  /** Write: like `reload`, but rejects on failure. */
  submit: (input?: TInput) => Promise<TData | null>
  /** Replace `data`, directly or from its current value. */
  setData: (data: TData | ((current: TData | null) => TData)) => void
  /** Back to `initialData`, clearing loading/error/fetched. */
  reset: () => void
  /** Abort the in-flight request without surfacing an error. */
  abort: () => void
}

/**
 * The signal-based replacement for frappe-ui's `createResource`.
 *
 * `reload` (and its `fetch` alias) resolves on failure — a read reports through
 * `error`. `submit` rejects on failure — a write must not run its success path.
 * A new fetch aborts the previous one; a superseded response is discarded, so
 * `data` always reflects the newest request.
 */
export function createResource<
  TData = unknown,
  TInput = unknown,
  TParams = Record<string, unknown>,
>(options: ResourceOptions<TData, TInput, TParams>): Resource<TData, TInput> {
  const fetcher: ResourceFetcher = options.fetcher ?? request

  const [data, setDataSignal] = createSignal<TData | null>(
    options.initialData ?? null,
  )
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<RequestError | null>(null)
  const [fetched, setFetched] = createSignal(false)
  const [promise, setPromise] = createSignal<Promise<TData | null> | null>(null)

  let controller: AbortController | null = null
  // Monotonic request id. Only the newest request may write state; an older
  // response (or a superseded abort) is ignored.
  let sequence = 0

  function resolveUrl(): string {
    return typeof options.url === 'function' ? options.url() : options.url
  }

  function resolveParams(input: TInput | undefined): TParams | undefined {
    if (options.makeParams) return options.makeParams(input as TInput)
    if (input !== undefined) return input as unknown as TParams
    const params = options.params
    if (typeof params === 'function') return (params as () => TParams)()
    return params
  }

  function transform(value: unknown): TData {
    if (options.transform) {
      const result = options.transform(value)
      if (result !== undefined) return result
    }
    return value as TData
  }

  function execute(
    input: TInput | undefined,
    rejectOnError: boolean,
  ): Promise<TData | null> {
    const current = ++sequence
    controller?.abort()
    controller = new AbortController()
    setLoading(true)
    setError(null)
    const previous = data()

    const params = resolveParams(input)
    const result = fetcher<TData>({
      url: resolveUrl(),
      method: options.method,
      params: params as Record<string, unknown> | undefined,
      signal: controller.signal,
    })
      .then((response) => {
        if (current !== sequence) return data()
        const transformed = transform(response)
        setDataSignal(() => transformed)
        setFetched(true)
        options.onSuccess?.(transformed)
        return transformed
      })
      .catch((caught: unknown) => {
        if (current !== sequence || isAbortError(caught)) return data()
        const normalized = normalizeError(caught)
        setError(normalized)
        setDataSignal(() => previous)
        options.onError?.(normalized)
        if (rejectOnError) throw normalized
        return data()
      })
      .finally(() => {
        if (current === sequence) setLoading(false)
      })

    setPromise(result)
    return result
  }

  function reload(input?: TInput): Promise<TData | null> {
    return execute(input, false)
  }

  function submit(input?: TInput): Promise<TData | null> {
    return execute(input, true)
  }

  function setData(next: TData | ((current: TData | null) => TData)): void {
    if (typeof next === 'function') {
      const updater = next as (current: TData | null) => TData
      setDataSignal(() => updater(data()))
      return
    }
    setDataSignal(() => next)
  }

  function reset(): void {
    controller?.abort()
    sequence++
    setDataSignal(() => options.initialData ?? null)
    setLoading(false)
    setError(null)
    setFetched(false)
    setPromise(null)
  }

  function abort(): void {
    controller?.abort()
  }

  // Auto-fetch on creation. `reload` is a plain action, not a signal — the
  // reactivity rule cannot tell the difference, so it is silenced here.
  // eslint-disable-next-line solid/reactivity
  if (options.auto) void reload()

  return {
    data,
    loading,
    error,
    fetched,
    promise,
    reload,
    fetch: reload,
    submit,
    setData,
    reset,
    abort,
  }
}
