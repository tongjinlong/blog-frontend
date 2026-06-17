import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios'

import { appEnv } from '@/config/env.config'

export const DEFAULT_API_TIMEOUT_MS = 10_000

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'unknown'

type ApiErrorOptions = {
  kind: ApiErrorKind
  status?: number
  payload?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly payload?: unknown

  constructor(message: string, options: ApiErrorOptions) {
    super(message)
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
    this.payload = options.payload
  }
}

export type ApiClientOptions = {
  baseURL?: string
  timeoutMs?: number
  adapter?: AxiosAdapter
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data

    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return new ApiError(error.message || 'Request timeout', {
        kind: 'timeout',
        status,
        payload
      })
    }

    if (status) {
      return new ApiError(error.message || `Request failed with status ${status}`, {
        kind: 'http',
        status,
        payload
      })
    }

    return new ApiError(error.message || 'Network error', {
      kind: 'network',
      payload
    })
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { kind: 'unknown' })
  }

  return new ApiError('Unknown API error', { kind: 'unknown', payload: error })
}

export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const client = axios.create({
    adapter: options.adapter,
    baseURL: options.baseURL ?? appEnv.apiBaseUrl,
    timeout: options.timeoutMs ?? DEFAULT_API_TIMEOUT_MS
  })

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(normalizeApiError(error))
  )

  return client
}

export const http = createApiClient()

export async function request<TData>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<TData>['data']> {
  const response = await http.request<TData>(config)

  return response.data
}
