import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDoc } from './useDoc'

function mockResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDoc', () => {
  it('delegates to the document resource', async () => {
    const mock = vi.fn(async () => mockResponse({ message: { name: 'T-1' } }))
    vi.stubGlobal('fetch', mock)

    const doc = useDoc<{ name: string }>({ doctype: 'Task', name: 'T-1' })

    await vi.waitFor(() => expect(doc.doc()).toEqual({ name: 'T-1' }))
    expect(mock).toHaveBeenCalledWith(
      '/api/method/frappe.client.get?doctype=Task&name=T-1',
      expect.objectContaining({ method: 'GET' }),
    )
  })
})
