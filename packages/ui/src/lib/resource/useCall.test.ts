import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCall } from './useCall'

function mockResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body),
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useCall', () => {
  it('fetches immediately and exposes signals', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { count: 3 } }))
    const call = useCall<{ count: number }>({
      url: 'frappe.client.get_count',
      method: 'GET',
    })

    await vi.waitFor(() => expect(call.data()).toEqual({ count: 3 }))
    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.get_count')
    expect(call.loading()).toBe(false)
    expect(call.error()).toBe(null)
  })

  it('does not fetch when immediate is false', async () => {
    const fetchMock = stubFetch(mockResponse({ message: 1 }))
    const call = useCall<number>({
      url: 'myapp.api.count',
      method: 'GET',
      immediate: false,
    })

    expect(fetchMock.mock.calls.length).toBe(0)
    await call.reload()
    expect(fetchMock.mock.calls.length).toBe(1)
    expect(call.data()).toBe(1)
  })
})
