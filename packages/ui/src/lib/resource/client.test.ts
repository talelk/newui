import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getConfig,
  isAbortError,
  normalizeError,
  RequestError,
  request,
  resetConfig,
  setConfig,
} from './client'

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

function stubFetch(response: Response): FetchCall {
  const mock = vi.fn(async () => response)
  vi.stubGlobal('fetch', mock)
  return mock as unknown as FetchCall
}

afterEach(() => {
  vi.unstubAllGlobals()
  resetConfig()
})

describe('request', () => {
  it('POSTs a dotted method to /api/method and unwraps message', async () => {
    const fetchMock = stubFetch(mockResponse({ message: [1, 2, 3] }))
    const result = await request({
      url: 'frappe.client.get_list',
      params: { doctype: 'Task' },
    })

    expect(result).toEqual([1, 2, 3])
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/method/frappe.client.get_list',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ doctype: 'Task' }),
      }),
    )
  })

  it('appends GET params as the query string', async () => {
    const fetchMock = stubFetch(mockResponse({ message: { name: 'T-1' } }))
    await request({
      url: 'frappe.client.get',
      method: 'GET',
      params: { doctype: 'Task', name: 'T-1' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/method/frappe.client.get?doctype=Task&name=T-1',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('prepends the configured base URL, headers and credentials', async () => {
    setConfig({
      baseUrl: 'https://example.com/',
      headers: { 'X-Frappe-Site-Name': 'site' },
    })
    const fetchMock = stubFetch(mockResponse({ message: 'pong' }))
    await request({ url: '/api/method/ping' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/api/method/ping',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'X-Frappe-Site-Name': 'site',
        }),
      }),
    )
  })

  it('accepts a headers getter', async () => {
    setConfig({ headers: () => ({ Authorization: 'token abc' }) })
    const fetchMock = stubFetch(mockResponse({ message: 'ok' }))
    await request({ url: 'myapp.api.ping' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/method/myapp.api.ping',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'token abc' }),
      }),
    )
  })

  it('returns the whole body when it carries docs', async () => {
    stubFetch(mockResponse({ docs: [{ name: 'T-1' }], message: 'ignored' }))
    const result = await request({ url: 'run_doc_method' })
    expect(result).toEqual({ docs: [{ name: 'T-1' }], message: 'ignored' })
  })

  it('returns the whole body for the login endpoint', async () => {
    stubFetch(mockResponse({ message: 'Logged In', full_name: 'Ada' }))
    const result = await request({ url: '/api/method/login', method: 'POST' })
    expect(result).toEqual({ message: 'Logged In', full_name: 'Ada' })
  })

  it('rejects with a normalized RequestError on a non-2xx response', async () => {
    stubFetch(
      mockResponse(
        {
          exc_type: 'ValidationError',
          _server_messages: JSON.stringify([
            JSON.stringify({ message: 'Bad value' }),
          ]),
        },
        { ok: false, status: 417, statusText: 'Expectation Failed' },
      ),
    )

    const error = (await request({ url: 'x.y' }).catch(
      (e) => e,
    )) as RequestError
    expect(error).toBeInstanceOf(RequestError)
    expect(error.status).toBe(417)
    expect(error.excType).toBe('ValidationError')
    expect(error.messages).toEqual(['Bad value'])
  })

  it('falls back to Internal Server Error when the body has no message', async () => {
    stubFetch(mockResponse({}, { ok: false, status: 500 }))
    const error = (await request({ url: 'x.y' }).catch(
      (e) => e,
    )) as RequestError
    expect(error.messages).toEqual(['Internal Server Error'])
  })

  it('throws when url is missing', async () => {
    await expect(request({ url: '' })).rejects.toBeInstanceOf(RequestError)
  })
})

describe('config', () => {
  it('merges keys and resets', () => {
    setConfig({ baseUrl: '/base' })
    setConfig({ headers: { A: '1' } })
    expect(getConfig()).toEqual({ baseUrl: '/base', headers: { A: '1' } })
    resetConfig()
    expect(getConfig()).toEqual({})
  })
})

describe('normalizeError', () => {
  it('coerces arbitrary values and preserves the name', () => {
    expect(normalizeError('boom')).toBeInstanceOf(RequestError)

    const abort = new Error('aborted')
    abort.name = 'AbortError'
    const normalized = normalizeError(abort)
    expect(normalized).toBeInstanceOf(RequestError)
    expect(isAbortError(normalized)).toBe(true)
  })
})
