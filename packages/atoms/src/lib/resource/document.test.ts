import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDocumentResource } from './document'

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

describe('createDocumentResource', () => {
  it('loads the document and tracks dirty state', async () => {
    stubFetch(mockResponse({ message: { name: 'T-1', subject: 'Hi' } }))
    const resource = createDocumentResource<{ name: string; subject: string }>({
      doctype: 'Task',
      name: 'T-1',
      auto: false,
    })

    await resource.reload()
    expect(resource.doc()).toEqual({ name: 'T-1', subject: 'Hi' })
    expect(resource.originalDoc()).toEqual({ name: 'T-1', subject: 'Hi' })
    expect(resource.isDirty()).toBe(false)

    resource.setDoc((doc) => ({
      ...(doc ?? { name: '', subject: '' }),
      subject: 'Bye',
    }))
    expect(resource.doc()).toEqual({ name: 'T-1', subject: 'Bye' })
    expect(resource.isDirty()).toBe(true)
  })

  it('save posts only the changed fields', async () => {
    const fetchMock = stubFetch(
      mockResponse({ message: { name: 'T-1', subject: 'Hi', status: 'Open' } }),
      mockResponse({
        message: { name: 'T-1', subject: 'Bye', status: 'Open' },
      }),
    )
    const resource = createDocumentResource({
      doctype: 'Task',
      name: 'T-1',
      auto: false,
    })

    await resource.reload()
    resource.setDoc((doc) => ({
      ...(doc as Record<string, unknown>),
      subject: 'Bye',
    }))
    await resource.save()

    expect(urlAt(fetchMock, 1)).toBe('/api/method/frappe.client.set_value')
    expect(bodyAt(fetchMock, 1)).toEqual({
      doctype: 'Task',
      name: 'T-1',
      fieldname: { subject: 'Bye' },
    })
    expect(resource.isDirty()).toBe(false)
  })

  it('save with no changes does not hit the network', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { name: 'T-1' } }))
    const resource = createDocumentResource({
      doctype: 'Task',
      name: 'T-1',
      auto: false,
    })

    await resource.reload()
    expect(fetchMock.mock.calls.length).toBe(1)

    await resource.save()
    expect(fetchMock.mock.calls.length).toBe(1)
  })

  it('setValue posts explicit values', async () => {
    const fetchMock = stubFetch(
      mockResponse({ message: { name: 'T-1' } }),
      mockResponse({ message: { name: 'T-1', subject: 'X' } }),
    )
    const resource = createDocumentResource({
      doctype: 'Task',
      name: 'T-1',
      auto: false,
    })

    await resource.reload()
    await resource.setValue({ subject: 'X' })

    expect(bodyAt(fetchMock, 1)).toEqual({
      doctype: 'Task',
      name: 'T-1',
      fieldname: { subject: 'X' },
    })
    expect(resource.doc()).toEqual({ name: 'T-1', subject: 'X' })
  })

  it('delete posts and clears the document', async () => {
    const fetchMock = stubFetch(
      mockResponse({ message: { name: 'T-1' } }),
      mockResponse({ message: 'ok' }),
    )
    const resource = createDocumentResource({
      doctype: 'Task',
      name: 'T-1',
      auto: false,
    })

    await resource.reload()
    await resource.delete()

    expect(urlAt(fetchMock, 1)).toBe('/api/method/frappe.client.delete')
    expect(bodyAt(fetchMock, 1)).toEqual({ doctype: 'Task', name: 'T-1' })
    expect(resource.doc()).toBe(null)
  })

  it('fetches on creation by default', async () => {
    stubFetch(mockResponse({ message: { name: 'T-1' } }))
    const resource = createDocumentResource({ doctype: 'Task', name: 'T-1' })

    await vi.waitFor(() => expect(resource.doc()).toEqual({ name: 'T-1' }))
  })
})
