import { type AxiosAdapter, AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import { createApiClient, normalizeApiError } from '../../src/api/http'

describe('createApiClient', () => {
  it('uses configured baseURL and timeout values', async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: 'OK'
    })
    const client = createApiClient({
      adapter,
      baseURL: 'https://api.example.com',
      timeoutMs: 1234
    })

    const response = await client.get('/health')

    expect(response.config.baseURL).toBe('https://api.example.com')
    expect(response.config.timeout).toBe(1234)
    expect(response.data).toEqual({ ok: true })
  })

  it('normalizes timeout errors', async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError('timeout of 1ms exceeded', 'ECONNABORTED', config)
    }
    const client = createApiClient({ adapter })

    await expect(client.get('/slow')).rejects.toMatchObject({
      kind: 'timeout',
      name: 'ApiError'
    })
  })
})

describe('normalizeApiError', () => {
  it('keeps unknown errors in a predictable shape', () => {
    expect(normalizeApiError(new Error('boom'))).toMatchObject({
      kind: 'unknown',
      message: 'boom',
      name: 'ApiError'
    })
  })
})
