import { describe, expect, it } from 'vitest'

import { parseAppEnv } from '../../src/config/env.config'

describe('parseAppEnv', () => {
  it('maps valid Vite env values to typed app env values', () => {
    expect(
      parseAppEnv({
        VITE_APP_NAME: 'Blog Frontend',
        VITE_APP_ENV: 'production',
        VITE_API_BASE_URL: '/api',
        VITE_SENTRY_DSN: '',
        VITE_SENTRY_RELEASE: 'release-1',
        VITE_SOURCEMAP: 'true',
        PROD: true,
        DEV: false
      } as unknown as ImportMetaEnv)
    ).toEqual({
      name: 'Blog Frontend',
      env: 'production',
      apiBaseUrl: '/api',
      sentryDsn: undefined,
      sentryRelease: 'release-1',
      enableSourcemap: true,
      isProd: true,
      isDev: false
    })
  })

  it('uses defaults for optional values', () => {
    expect(parseAppEnv({} as ImportMetaEnv)).toEqual({
      name: 'Blog Frontend',
      env: 'development',
      apiBaseUrl: '/api',
      sentryDsn: undefined,
      sentryRelease: undefined,
      enableSourcemap: false,
      isProd: false,
      isDev: true
    })
  })

  it('uses runtime config before build-time Vite env values', () => {
    expect(
      parseAppEnv(
        {
          VITE_APP_NAME: 'Build Name',
          VITE_APP_ENV: 'production',
          VITE_API_BASE_URL: '/api',
          VITE_SENTRY_DSN: '',
          VITE_SENTRY_RELEASE: 'build-release',
          VITE_SOURCEMAP: 'false',
          PROD: true,
          DEV: false
        } as unknown as ImportMetaEnv,
        {
          APP_NAME: 'Runtime Name',
          APP_ENV: 'development',
          API_BASE_URL: 'https://dev-api.example.com',
          SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
          SENTRY_RELEASE: 'runtime-release'
        }
      )
    ).toEqual({
      name: 'Runtime Name',
      env: 'development',
      apiBaseUrl: 'https://dev-api.example.com',
      sentryDsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      sentryRelease: 'runtime-release',
      enableSourcemap: false,
      isProd: false,
      isDev: true
    })
  })

  it('rejects invalid environment names', () => {
    expect(() =>
      parseAppEnv({
        VITE_APP_ENV: 'prod'
      } as unknown as ImportMetaEnv)
    ).toThrow()
  })

  it('rejects invalid Sentry DSN values', () => {
    expect(() =>
      parseAppEnv({
        VITE_SENTRY_DSN: 'not-a-url'
      } as unknown as ImportMetaEnv)
    ).toThrow()
  })
})
