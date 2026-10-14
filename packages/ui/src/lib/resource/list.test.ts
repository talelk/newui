import { afterEach, describe, expect, it, vi } from 'vitest'
import { createListResource } from './list'

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

function bodyAt(mock: FetchCall, index = 0): Record<string, unknown> {
  const call = mock.mock.calls[index]
  return JSON.parse(String(call?.[1]?.body)) as Record<string, unknown>
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createListResource', () => {
  it('reloads from the list endpoint with filters and a window limit', async () => {
    const fetchMock = stubFetch(
      mockResponse({ message: [{ name: 'T-1' }, { name: 'T-2' }] }),
    )
    const list = createListResource({
      doctype: 'Task',
      filters: { status: 'Open' },
      pageLength: 20,
    })

    const rows = await list.reload()

    expect(rows).toEqual([{ name: 'T-1' }, { name: 'T-2' }])
    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.get_list')
    expect(bodyAt(fetchMock)).toEqual({
      doctype: 'Task',
      filters: { status: 'Open' },
      start: 0,
      limit: 20,
      limit_start: 0,
      limit_page_length: 20,
    })
    expect(list.hasNextPage()).toBe(false)
    expect(list.hasPreviousPage()).toBe(false)
  })

  it('next advances the window and refetches', async () => {
    const page = Array.from({ length: 20 }, (_, i) => ({ name: `T-${i}` }))
    const fetchMock = stubFetch(
      mockResponse({ message: page }),
      mockResponse({ message: page }),
    )
    const list = createListResource({ doctype: 'Task', pageLength: 20 })

    await list.reload()
    expect(list.hasNextPage()).toBe(true)

    await list.next()
    expect(list.start()).toBe(20)
    expect(list.hasPreviousPage()).toBe(true)
    expect(bodyAt(fetchMock, 1)).toEqual({
      doctype: 'Task',
      filters: null,
      start: 0,
      limit: 40,
      limit_start: 0,
      limit_page_length: 40,
    })

    await list.previous()
    expect(list.start()).toBe(0)
    expect(bodyAt(fetchMock, 2)).toEqual({
      doctype: 'Task',
      filters: null,
      start: 0,
      limit: 20,
      limit_start: 0,
      limit_page_length: 20,
    })
  })

  it('setFilters resets to the first page and refetches', async () => {
    const fetchMock = stubFetch(
      mockResponse({ message: [] }),
      mockResponse({ message: [] }),
    )
    const list = createListResource({ doctype: 'Task', pageLength: 20 })

    await list.next()
    await list.setFilters({ status: 'Closed' })

    expect(list.start()).toBe(0)
    expect(list.filters()).toEqual({ status: 'Closed' })
    expect(bodyAt(fetchMock, 1)).toEqual({
      doctype: 'Task',
      filters: { status: 'Closed' },
      start: 0,
      limit: 20,
      limit_start: 0,
      limit_page_length: 20,
    })
  })

  it('sets error and resolves on failure', async () => {
    stubFetch({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({}),
      text: async () => JSON.stringify({ _error_message: 'boom' }),
    } as unknown as Response)
    const list = createListResource({ doctype: 'Task' })

    const rows = await list.reload()

    expect(rows).toBe(null)
    expect(list.error()).not.toBe(null)
    expect(list.loading()).toBe(false)
  })

  it('applies transform to the rows', async () => {
    stubFetch(mockResponse({ message: [{ name: 'T-1' }, { name: 'T-2' }] }))
    const list = createListResource<{ name: string }>({
      doctype: 'Task',
      transform: (rows) => rows.slice(0, 1),
    })

    const rows = await list.reload()
    expect(rows).toEqual([{ name: 'T-1' }])
    expect(list.data()).toEqual([{ name: 'T-1' }])
  })
})
