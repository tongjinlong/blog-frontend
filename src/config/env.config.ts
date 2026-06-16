export const appEnv = {
  name: import.meta.env.VITE_APP_NAME,
  env: import.meta.env.VITE_APP_ENV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryRelease: import.meta.env.VITE_SENTRY_RELEASE,
  enableSourcemap: import.meta.env.VITE_SOURCEMAP === 'true',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV
}
