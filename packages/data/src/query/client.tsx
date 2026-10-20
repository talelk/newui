import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { type JSX, onCleanup, untrack } from 'solid-js'

/**
 * The query client an app boots with.
 *
 * The defaults are the kit's opinion, stated once: local data is not a
 * dashboard (no refetch on window focus), a transient failure is worth one retry,
 * and an error is data the page renders rather than an exception that tears the
 * tree down. A page overrides any of them per query.
 */
export interface DataClientOptions {
  /** How long a list is fresh. Default `30_000`. */
  staleTime?: number
  /** Retries after the first failure. Default `1`. */
  retry?: number
}

export function createDataClient(options: DataClientOptions = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: options.staleTime ?? 30_000,
        retry: options.retry ?? 1,
        refetchOnWindowFocus: false,
        throwOnError: false,
      },
      mutations: { retry: 0 },
    },
  })
}

/**
 * The provider a page wraps its workspace in.
 *
 * Pass `client` to share one (a workspace with several panes shares its cache);
 * omit it and the provider owns a client and clears it on unmount, so a route
 * change never leaves timers or caches behind.
 */
export function DataProvider(props: {
  client?: QueryClient
  options?: DataClientOptions
  children: JSX.Element
}): JSX.Element {
  // Chosen once, by design: swapping a provider's client mid-tree would orphan
  // the cache every consumer is reading from.
  const provided = untrack(() => props.client)
  const client = provided ?? createDataClient(untrack(() => props.options))
  if (!provided) onCleanup(() => client.clear())
  return (
    <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
  )
}
