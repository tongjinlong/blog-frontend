import { z } from 'zod'

const optionalUrlSchema = z.union([z.url(), z.literal('')]).optional()
const booleanStringSchema = z
  .union([z.literal('true'), z.literal('false'), z.boolean(), z.undefined()])
  .transform((value) => value === true || value === 'true')
const appEnvironmentSchema = z.enum(['development', 'test', 'staging', 'production'])

const appEnvSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('Blog Frontend'),
  VITE_APP_ENV: appEnvironmentSchema.default('development'),
  VITE_API_BASE_URL: z.string().trim().min(1).default('/api'),
  VITE_SENTRY_DSN: optionalUrlSchema.transform((value) => value || undefined),
  VITE_SENTRY_RELEASE: z.string().trim().optional(),
  VITE_SOURCEMAP: booleanStringSchema.default(false),
  PROD: z.boolean().default(false),
  DEV: z.boolean().default(false)
})

const runtimeConfigSchema = z.object({
  APP_NAME: z.string().trim().min(1).optional(),
  APP_ENV: appEnvironmentSchema.optional(),
  API_BASE_URL: z.string().trim().min(1).optional(),
  SENTRY_DSN: optionalUrlSchema.transform((value) => value || undefined),
  SENTRY_RELEASE: z.string().trim().optional()
})

export type RuntimeAppConfig = z.input<typeof runtimeConfigSchema>

export type AppEnv = {
  name: string
  env: 'development' | 'test' | 'staging' | 'production'
  apiBaseUrl: string
  sentryDsn?: string
  sentryRelease?: string
  enableSourcemap: boolean
  isProd: boolean
  isDev: boolean
}

function readRuntimeConfig(): RuntimeAppConfig {
  if (typeof window === 'undefined') {
    return {}
  }

  return window.__APP_CONFIG__ ?? {}
}

export function parseAppEnv(
  env: Partial<ImportMetaEnv>,
  runtimeConfig: RuntimeAppConfig = {}
): AppEnv {
  const parsed = appEnvSchema.parse(env)
  const runtime = runtimeConfigSchema.parse(runtimeConfig)
  const runtimeEnv = runtime.APP_ENV ?? parsed.VITE_APP_ENV

  return {
    name: runtime.APP_NAME ?? parsed.VITE_APP_NAME,
    env: runtimeEnv,
    apiBaseUrl: runtime.API_BASE_URL ?? parsed.VITE_API_BASE_URL,
    sentryDsn: runtime.SENTRY_DSN ?? parsed.VITE_SENTRY_DSN,
    sentryRelease: runtime.SENTRY_RELEASE ?? parsed.VITE_SENTRY_RELEASE,
    enableSourcemap: parsed.VITE_SOURCEMAP,
    isProd: runtimeEnv === 'production',
    isDev: runtimeEnv === 'development' || parsed.DEV
  }
}

export const appEnv = parseAppEnv(import.meta.env, readRuntimeConfig())
