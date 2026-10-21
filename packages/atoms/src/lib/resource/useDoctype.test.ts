import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDoctype } from './useDoctype'

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

describe('useDoctype', () => {
  it('insert posts the wrapped doc', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { name: 'T-1' } }))
    const doctype = useDoctype<{ name: string }>('Task')

    const created = await doctype.insert.submit({ name: 'T-1' })

    expect(created).toEqual({ name: 'T-1' })
    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.insert')
    expect(bodyAt(fetchMock)).toEqual({ doc: { doctype: 'Task', name: 'T-1' } })
  })

  it('setValue splits the name out of the values', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { name: 'T-1' } }))
    const doctype = useDoctype('Task')

    await doctype.setValue.submit({ name: 'T-1', subject: 'X' })

    expect(bodyAt(fetchMock)).toEqual({
      doctype: 'Task',
      name: 'T-1',
      fieldname: { subject: 'X' },
    })
  })

  it('delete posts the name', async () => {
    const fetchMock = stubFetch(mockResponse({ message: 'ok' }))
    const doctype = useDoctype('Task')

    await doctype.delete.submit('T-1')

    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.delete')
    expect(bodyAt(fetchMock)).toEqual({ doctype: 'Task', name: 'T-1' })
  })

  it('runDocMethod posts dt/dn/method/args', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { ok: true } }))
    const doctype = useDoctype('Task')

    await doctype.runDocMethod.submit({
      name: 'T-1',
      method: 'submit',
      params: { force: true },
    })

    expect(urlAt(fetchMock)).toBe('/api/method/run_doc_method')
    expect(bodyAt(fetchMock)).toEqual({
      dt: 'Task',
      dn: 'T-1',
      method: 'submit',
      args: { force: true },
    })
  })

  it('runMethod posts to the method name', async () => {
    const fetchMock = stubFetch(mockResponse({ message: 'ok' }))
    const doctype = useDoctype('Task')

    await doctype.runMethod.submit({
      method: 'myapp.api.ping',
      params: { x: 1 },
    })

    expect(urlAt(fetchMock)).toBe('/api/method/myapp.api.ping')
    expect(bodyAt(fetchMock)).toEqual({ x: 1 })
  })
})
