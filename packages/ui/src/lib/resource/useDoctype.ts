import { type Accessor, createSignal } from 'solid-js'
import type { RequestError } from './client'
import { createResource, type Resource, type ResourceFetcher } from './resource'

/** A single doctype-level write action. */
export interface DoctypeAction<TResult = unknown, TInput = unknown> {
  data: Accessor<TResult | null>
  loading: Accessor<boolean>
  error: Accessor<RequestError | null>
  submit: (input: TInput) => Promise<TResult | null>
  reset: () => void
}

/** Options for {@link useDoctype}. */
export interface UseDoctypeOptions {
  fetcher?: ResourceFetcher
}

/** Params for a document method. */
export interface RunDocMethodInput {
  name: string
  method: string
  params?: Record<string, unknown>
}

/** Params for a doctype-level method. */
export interface RunMethodInput {
  method: string
  params?: Record<string, unknown>
}

/** The write actions {@link useDoctype} returns. */
export interface UseDoctypeReturn<TDoc = Record<string, unknown>> {
  insert: DoctypeAction<TDoc, Partial<TDoc>>
  delete: DoctypeAction<unknown, string>
  setValue: DoctypeAction<TDoc, Record<string, unknown> & { name: string }>
  runDocMethod: DoctypeAction<unknown, RunDocMethodInput>
  runMethod: DoctypeAction<unknown, RunMethodInput>
}

const INSERT_URL = 'frappe.client.insert'
const SET_VALUE_URL = 'frappe.client.set_value'
const DELETE_URL = 'frappe.client.delete'
const RUN_DOC_METHOD_URL = 'run_doc_method'

/**
 * The signal-based replacement for frappe-ui's `useDoctype`: the doctype-level
 * write actions (`insert`, `delete`, `setValue`, `runDocMethod`, `runMethod`),
 * each an inert resource that fires on `submit`.
 */
export function useDoctype<TDoc = Record<string, unknown>>(
  doctype: string,
  options: UseDoctypeOptions = {},
): UseDoctypeReturn<TDoc> {
  const { fetcher } = options

  const insertResource = createResource<TDoc, Partial<TDoc>>({
    url: INSERT_URL,
    method: 'POST',
    makeParams: (input) => ({ doc: { doctype, ...(input as Partial<TDoc>) } }),
    fetcher,
  })

  const deleteResource = createResource<unknown, string>({
    url: DELETE_URL,
    method: 'POST',
    makeParams: (input) => ({ doctype, name: input }),
    fetcher,
  })

  const setValueResource = createResource<
    TDoc,
    Record<string, unknown> & { name: string }
  >({
    url: SET_VALUE_URL,
    method: 'POST',
    makeParams: ({ name, ...values }) => ({ doctype, name, fieldname: values }),
    fetcher,
  })

  const runDocMethodResource = createResource<unknown, RunDocMethodInput>({
    url: RUN_DOC_METHOD_URL,
    method: 'POST',
    makeParams: ({ name, method, params }) => ({
      dt: doctype,
      dn: name,
      method,
      args: params ?? {},
    }),
    fetcher,
  })

  // `runMethod` POSTs to the method name itself, which is only known per call.
  // `makeParams` runs before the URL is resolved (see `createResource`), so the
  // signal it writes is already visible when the URL is read.
  const [methodUrl, setMethodUrl] = createSignal('')
  const runMethodResource = createResource<unknown, RunMethodInput>({
    url: () => methodUrl(),
    method: 'POST',
    makeParams: ({ method, params }) => {
      setMethodUrl(() => method)
      return params ?? {}
    },
    fetcher,
  })

  function toAction<TResult, TInput>(
    resource: Resource<TResult, TInput>,
  ): DoctypeAction<TResult, TInput> {
    return {
      data: resource.data,
      loading: resource.loading,
      error: resource.error,
      submit: (input: TInput) => resource.submit(input),
      reset: resource.reset,
    }
  }

  return {
    insert: toAction<TDoc, Partial<TDoc>>(insertResource),
    delete: toAction<unknown, string>(deleteResource),
    setValue: toAction<TDoc, Record<string, unknown> & { name: string }>(
      setValueResource,
    ),
    runDocMethod: toAction<unknown, RunDocMethodInput>(runDocMethodResource),
    runMethod: toAction<unknown, RunMethodInput>(runMethodResource),
  }
}
