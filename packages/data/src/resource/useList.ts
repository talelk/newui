import {
  createListResource,
  type ListResource,
  type ListResourceOptions,
} from './list'

/** Options for {@link useList}. */
export type UseListOptions<TRow = Record<string, unknown>> =
  ListResourceOptions<TRow>

/** The signal-based surface {@link useList} returns. */
export type UseListReturn<TRow = Record<string, unknown>> = ListResource<TRow>

/**
 * A thin composable over {@link createListResource}: a paginated, filterable
 * list read through signals.
 */
export function useList<TRow = Record<string, unknown>>(
  options: ListResourceOptions<TRow>,
): ListResource<TRow> {
  return createListResource(options)
}
