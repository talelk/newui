import type { Accessor } from 'solid-js'
import type { RequestError } from './client'
import { createResource, type ResourceFetcher } from './resource'

/** Options for {@link useCall}. Mirrors {@link ResourceOptions} with signals out. */
export interface UseCallOptions<
  TResponse = unknown,
  TParams = Record<string, unknown>,
> {
  url: string | (() => string)
  /** HTTP method. Defaults to `GET`. */
  method?: string
  params?: TParams | (() => TParams)
  /** Fetch on creation. Defaults to `true`. */
  immediate?: boolean
  initialData?: TResponse | null
  transform?: (data: unknown) => TResponse
  onSuccess?: (data: TResponse) => void
  onError?: (error: RequestError) => void
  fetcher?: ResourceFetcher
}

/** The signal-based surface {@link useCall} returns. */
export interface UseCallReturn<TResponse = unknown> {
  data: Accessor<TResponse | null>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  fetched: Accessor<boolean>
  /** Read: fetch, resolving even on failure. */
  execute: () => Promise<TResponse | null>
  fetch: () => Promise<TResponse | null>
  reload: () => Promise<TResponse | null>
  /** Write: fetch, rejecting on failure. */
  submit: () => Promise<TResponse | null>
  abort: () => void
  reset: () => void
  setData: (
    data: TResponse | ((current: TResponse | null) => TResponse),
  ) => void
}

/**
 * A thin composable over {@link createResource}: call a Frappe method and read
 * the result through signals.
 */
export function useCall<TResponse = unknown, TParams = Record<string, unknown>>(
  options: UseCallOptions<TResponse, TParams>,
): UseCallReturn<TResponse> {
  const resource = createResource<TResponse, unknown, TParams>({
    url: options.url,
    method: options.method ?? 'GET',
    params: options.params,
    initialData: options.initialData ?? null,
    auto: options.immediate ?? true,
    transform: options.transform,
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetcher: options.fetcher,
  })

  return {
    data: resource.data,
    loading: resource.loading,
    error: resource.error,
    fetched: resource.fetched,
    execute: () => resource.reload(),
    fetch: () => resource.reload(),
    reload: () => resource.reload(),
    submit: () => resource.submit(),
    abort: resource.abort,
    reset: resource.reset,
    setData: resource.setData,
  }
}
