import { afterEach, describe, expect, it, vi } from 'vitest'
import { useNewDoc } from './useNewDoc'

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

describe('useNewDoc', () => {
  it('builds a doc and inserts it', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { name: 'T-9' } }))
    const newDoc = useNewDoc<{ name: string; subject: string }>('Task', {
      subject: 'Hi',
    })

    expect(newDoc.doc()).toEqual({ subject: 'Hi' })
    newDoc.setDoc((doc) => ({ ...doc, subject: 'Bye' }))

    const created = await newDoc.submit()

    expect(created).toEqual({ name: 'T-9' })
    expect(urlAt(fetchMock)).toBe('/api/method/frappe.client.insert')
    expect(bodyAt(fetchMock)).toEqual({
      doc: { doctype: 'Task', subject: 'Bye' },
    })
  })

  it('reset clears the draft', async () => {
    stubFetch(mockResponse({ message: { name: 'T-9' } }))
    const newDoc = useNewDoc<{ subject: string }>('Task', { subject: 'Hi' })

    newDoc.setDoc({ subject: 'Bye' })
    newDoc.reset()

    expect(newDoc.doc()).toEqual({ subject: 'Hi' })
    expect(newDoc.data()).toBe(null)
  })
})
