import { type Accessor, createSignal } from 'solid-js'
import type { RequestError } from './client'
import { createResource, type ResourceFetcher } from './resource'

/** Options for {@link useNewDoc}. */
export interface UseNewDocOptions {
  onSuccess?: (doc: Record<string, unknown>) => void
  onError?: (error: RequestError) => void
  fetcher?: ResourceFetcher
}

/** The signal-based surface {@link useNewDoc} returns. */
export interface UseNewDocReturn<TDoc = Record<string, unknown>> {
  /** The document being built, edited through {@link UseNewDocReturn.setDoc}. */
  doc: Accessor<Partial<TDoc>>
  setDoc: (
    values: Partial<TDoc> | ((current: Partial<TDoc>) => Partial<TDoc>),
  ) => void
  /** The created document, once `submit` resolves. */
  data: Accessor<TDoc | null>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  /** Insert the document (`frappe.client.insert`). */
  submit: () => Promise<TDoc | null>
  reset: () => void
}

const INSERT_URL = 'frappe.client.insert'

/**
 * The signal-based replacement for frappe-ui's `useNewDoc`: build a document
 * locally, then insert it.
 */
export function useNewDoc<TDoc extends object = Record<string, unknown>>(
  doctype: string,
  initialValues: Partial<TDoc> = {},
  options: UseNewDocOptions = {},
): UseNewDocReturn<TDoc> {
  const [doc, setDocSignal] = createSignal<Partial<TDoc>>({ ...initialValues })

  const resource = createResource<TDoc, Record<string, unknown>>({
    url: INSERT_URL,
    method: 'POST',
    makeParams: (input) => ({ doc: { doctype, ...input } }),
    fetcher: options.fetcher,
    onSuccess: (data) => options.onSuccess?.(data as Record<string, unknown>),
    onError: options.onError,
  })

  function setDoc(
    next: Partial<TDoc> | ((current: Partial<TDoc>) => Partial<TDoc>),
  ): void {
    if (typeof next === 'function') {
      setDocSignal((current) => next(current))
      return
    }
    setDocSignal(() => next)
  }

  function submit(): Promise<TDoc | null> {
    return resource.submit(doc() as Record<string, unknown>)
  }

  function reset(): void {
    setDocSignal(() => ({ ...initialValues }))
    resource.reset()
  }

  return {
    doc,
    setDoc,
    data: resource.data,
    loading: resource.loading,
    error: resource.error,
    submit,
    reset,
  }
}
