import { type Accessor, createSignal } from 'solid-js'
import type { RequestError } from './client'
import { createResource, type Resource, type ResourceFetcher } from './resource'

/** Per-operation overrides for a document resource. */
export interface DocumentOperationOptions<TResult> {
  /** Overrides the default endpoint. */
  url?: string
  onSuccess?: (result: TResult) => void
  onError?: (error: RequestError) => void
}

/** Options for {@link createDocumentResource}. */
export interface DocumentResourceOptions<TDoc = Record<string, unknown>> {
  doctype: string
  /** Document name, or an accessor for a reactive name. */
  name: string | (() => string)
  /** Fetch on creation. Defaults to `true`. */
  auto?: boolean
  /** Overrides the default get endpoint (`frappe.client.get`). */
  url?: string
  /** Map the raw document. */
  transform?: (doc: TDoc) => TDoc
  onSuccess?: (doc: TDoc) => void
  onError?: (error: RequestError) => void
  setValue?: DocumentOperationOptions<TDoc>
  delete?: DocumentOperationOptions<unknown>
  fetcher?: ResourceFetcher
}

/** A single-document resource with local edits and dirty tracking. */
export interface DocumentResource<TDoc = Record<string, unknown>> {
  doctype: string
  name: Accessor<string>
  doc: Accessor<TDoc | null>
  /** The last saved/loaded copy, for dirty comparison. */
  originalDoc: Accessor<TDoc | null>
  isDirty: Accessor<boolean>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  fetched: Accessor<boolean>
  /** The underlying GET resource. */
  get: Resource<TDoc>
  /** POST the changed fields to `frappe.client.set_value`. */
  save: () => Promise<TDoc | null>
  /** POST explicit `fieldname` values. */
  setValue: (values: Record<string, unknown>) => Promise<TDoc | null>
  /** POST to `frappe.client.delete` and clear the doc. */
  delete: () => Promise<unknown>
  /** Refetch the document. */
  reload: () => Promise<TDoc | null>
  /** Edit the document locally. */
  setDoc: (doc: TDoc | ((current: TDoc | null) => TDoc)) => void
}

const GET_URL = 'frappe.client.get'
const SET_VALUE_URL = 'frappe.client.set_value'
const DELETE_URL = 'frappe.client.delete'

function cloneDoc<TDoc>(doc: TDoc | null): TDoc | null {
  if (doc === null) return null
  return JSON.parse(JSON.stringify(doc)) as TDoc
}

/**
 * The signal-based replacement for frappe-ui's `createDocumentResource`.
 *
 * `doc` is a local signal; `setDoc` edits it, `isDirty` compares it to
 * `originalDoc`, and `save` sends only the changed fields (skipping the
 * network entirely when nothing changed). `setValue`/`delete` write through.
 */
export function createDocumentResource<TDoc = Record<string, unknown>>(
  options: DocumentResourceOptions<TDoc>,
): DocumentResource<TDoc> {
  const name = (): string =>
    typeof options.name === 'function' ? options.name() : options.name

  const [doc, setDocSignal] = createSignal<TDoc | null>(null)
  const [originalDoc, setOriginalDoc] = createSignal<TDoc | null>(null)

  const transform = options.transform
  const mapDoc = transform
    ? (data: unknown) => transform(data as TDoc)
    : undefined

  const get = createResource<TDoc>({
    url: options.url ?? GET_URL,
    method: 'GET',
    params: () => ({ doctype: options.doctype, name: name() }),
    transform: mapDoc,
    fetcher: options.fetcher,
    onSuccess: (data) => {
      setDocSignal(() => data)
      setOriginalDoc(() => cloneDoc(data))
      options.onSuccess?.(data)
    },
    onError: (error) => {
      setDocSignal(() => null)
      setOriginalDoc(() => null)
      options.onError?.(error)
    },
  })

  const setValueResource = createResource<TDoc, Record<string, unknown>>({
    url: options.setValue?.url ?? SET_VALUE_URL,
    method: 'POST',
    makeParams: (input) => ({
      doctype: options.doctype,
      name: name(),
      fieldname: input,
    }),
    transform: mapDoc,
    fetcher: options.fetcher,
    onSuccess: (data) => {
      setDocSignal(() => data)
      setOriginalDoc(() => cloneDoc(data))
      options.setValue?.onSuccess?.(data)
    },
    onError: (error) => {
      // Roll the local edit back to the last saved copy.
      setDocSignal(() => originalDoc())
      options.setValue?.onError?.(error)
    },
  })

  const deleteResource = createResource<unknown>({
    url: options.delete?.url ?? DELETE_URL,
    method: 'POST',
    params: () => ({ doctype: options.doctype, name: name() }),
    fetcher: options.fetcher,
    onSuccess: (data) => {
      setDocSignal(() => null)
      setOriginalDoc(() => null)
      options.delete?.onSuccess?.(data)
    },
    onError: (error) => options.delete?.onError?.(error),
  })

  const isDirty = (): boolean =>
    JSON.stringify(doc() ?? null) !== JSON.stringify(originalDoc() ?? null)

  function changedFields(): Record<string, unknown> {
    const current = (cloneDoc(doc()) ?? {}) as Record<string, unknown>
    const original = (originalDoc() ?? {}) as Record<string, unknown>
    const values: Record<string, unknown> = {}
    for (const key in current) {
      if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
        values[key] = current[key]
      }
    }
    // Identity/meta fields are never writable through `set_value`.
    delete values['doctype']
    delete values['name']
    return values
  }

  function setValue(values: Record<string, unknown>): Promise<TDoc | null> {
    return setValueResource.submit(values)
  }

  function save(): Promise<TDoc | null> {
    const values = changedFields()
    if (Object.keys(values).length === 0) return Promise.resolve(doc())
    return setValue(values)
  }

  function setDoc(next: TDoc | ((current: TDoc | null) => TDoc)): void {
    if (typeof next === 'function') {
      const updater = next as (current: TDoc | null) => TDoc
      setDocSignal(() => updater(doc()))
      return
    }
    setDocSignal(() => next)
  }

  function reload(): Promise<TDoc | null> {
    return get.reload()
  }

  if (options.auto !== false) void reload()

  return {
    doctype: options.doctype,
    name,
    doc,
    originalDoc,
    isDirty,
    loading: get.loading,
    error: get.error,
    fetched: get.fetched,
    get,
    save,
    setValue,
    delete: () => deleteResource.submit(),
    reload,
    setDoc,
  }
}
