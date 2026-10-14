import { afterEach, describe, expect, it, vi } from 'vitest'
import { RequestError } from './client'
import { createResource } from './resource'

function mockResponse(
  body: unknown,
  init: { ok?: boolean; status?: number; statusText?: string } = {},
): Response {
  const { ok = true, status = 200, statusText = 'OK' } = init
  return {
    ok,
    status,
    statusText,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response
}

interface FetchCall {
  mock: { calls: Array<[string, RequestInit]> }
}

function stubFetch(...responses: Response[]): FetchCall {
  const mock = vi.fn()
  for (const response of responses) mock.mockResolvedValueOnce(response)
  vi.stubGlobal('fetch', mock)
  return mock as unknown as FetchCall
}

function urlAt(mock: FetchCall, index = 0): string {
  return mock.mock.calls[index]?.[0] ?? ''
}

function bodyAt(mock: FetchCall, index = 0): Record<string, unknown> {
  const call = mock.mock.calls[index]
  return JSON.parse(String(call?.[1]?.body)) as Record<string, unknown>
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createResource', () => {
  it('loads data and tracks the loading transition', async () => {
    stubFetch(mockResponse({ message: { name: 'T-1' } }))
    const resource = createResource<{ name: string }>({
      url: 'frappe.client.get',
      method: 'GET',
    })

    expect(resource.loading()).toBe(false)
    const promise = resource.reload()
    expect(resource.loading()).toBe(true)

    const data = await promise
    expect(data).toEqual({ name: 'T-1' })
    expect(resource.data()).toEqual({ name: 'T-1' })
    expect(resource.loading()).toBe(false)
    expect(resource.error()).toBe(null)
    expect(resource.fetched()).toBe(true)
  })

  it('reload resolves on error, sets error and restores previous data', async () => {
    stubFetch(
      mockResponse({ message: { name: 'A' } }),
      mockResponse(
        { _error_message: 'nope' },
        { ok: false, status: 500, statusText: 'Server Error' },
      ),
    )
    const resource = createResource<{ name: string }>({
      url: 'frappe.client.get',
      method: 'GET',
    })

    await resource.reload()
    const result = await resource.reload()

    expect(result).toEqual({ name: 'A' })
    expect(resource.data()).toEqual({ name: 'A' })
    expect(resource.error()).toBeInstanceOf(RequestError)
    expect(resource.loading()).toBe(false)
  })

  it('submit rejects on error', async () => {
    stubFetch(
      mockResponse(
        { _error_message: 'bad' },
        { ok: false, status: 400, statusText: 'Bad Request' },
      ),
    )
    const resource = createResource({ url: 'frappe.client.insert' })

    await expect(resource.submit()).rejects.toBeInstanceOf(RequestError)
    expect(resource.error()).toBeInstanceOf(RequestError)
  })

  it('sends makeParams output to the configured url and method', async () => {
    const fetchMock = stubFetch(mockResponse({ message: 'ok' }))
    const resource = createResource<string, { name: string }>({
      url: 'frappe.client.delete',
      method: 'POST',
      makeParams: ({ name }) => ({ doctype: 'Task', name }),
    })

    await resource.submit({ name: 'T-1' })

    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.delete')
    expect(bodyAt(fetchMock)).toEqual({ doctype: 'Task', name: 'T-1' })
  })

  it('auto fetches on creation', async () => {
    const fetchMock = stubFetch(mockResponse({ message: 1 }))
    const resource = createResource<number>({
      url: 'myapp.api.count',
      method: 'GET',
      auto: true,
    })

    await vi.waitFor(() => expect(resource.data()).toBe(1))
    expect(fetchMock.mock.calls.length).toBe(1)
  })

  it('supports setData and reset', () => {
    const resource = createResource<number>({ url: 'x', initialData: 0 })

    resource.setData(5)
    expect(resource.data()).toBe(5)

    resource.setData((current) => (current ?? 0) + 1)
    expect(resource.data()).toBe(6)

    resource.reset()
    expect(resource.data()).toBe(0)
    expect(resource.fetched()).toBe(false)
    expect(resource.loading()).toBe(false)
  })

  it('aborts an in-flight request without surfacing an error', async () => {
    const mock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }),
    )
    vi.stubGlobal('fetch', mock)

    const resource = createResource({ url: 'myapp.api.slow' })
    const promise = resource.reload()
    expect(resource.loading()).toBe(true)

    resource.abort()
    await promise

    expect(resource.loading()).toBe(false)
    expect(resource.error()).toBe(null)
  })

  it('discards a superseded response', async () => {
    let resolveFirst: ((value: Response) => void) | undefined
    const first = new Promise<Response>((resolve) => {
      resolveFirst = resolve
    })
    const mock = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(mockResponse({ message: { name: 'second' } }))
    vi.stubGlobal('fetch', mock)

    const resource = createResource<{ name: string }>({
      url: 'frappe.client.get',
      method: 'GET',
    })

    const stale = resource.reload()
    const fresh = resource.reload()
    resolveFirst?.(mockResponse({ message: { name: 'first' } }))
    await Promise.all([stale, fresh])

    expect(resource.data()).toEqual({ name: 'second' })
  })
})
