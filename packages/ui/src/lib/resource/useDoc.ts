import {
  createDocumentResource,
  type DocumentResource,
  type DocumentResourceOptions,
} from './document'

/** Options for {@link useDoc}. */
export type UseDocOptions<TDoc = Record<string, unknown>> =
  DocumentResourceOptions<TDoc>

/** The signal-based surface {@link useDoc} returns. */
export type UseDocReturn<TDoc = Record<string, unknown>> =
  DocumentResource<TDoc>

/**
 * A thin composable over {@link createDocumentResource}: load a single
 * document and edit it through signals.
 */
export function useDoc<TDoc = Record<string, unknown>>(
  options: DocumentResourceOptions<TDoc>,
): DocumentResource<TDoc> {
  return createDocumentResource(options)
}
