import { afterEach, describe, expect, it, vi } from 'vitest'
import { useList } from './useList'

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

describe('useList', () => {
  it('delegates to the list resource', async () => {
    const mock = vi.fn(async () => mockResponse({ message: [{ name: 'T-1' }] }))
    vi.stubGlobal('fetch', mock)

    const list = useList<{ name: string }>({ doctype: 'Task' })
    const rows = await list.reload()

    expect(rows).toEqual([{ name: 'T-1' }])
    expect(mock).toHaveBeenCalledWith(
      '/api/method/frappe.client.get_list',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
