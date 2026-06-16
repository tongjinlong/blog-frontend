import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

import { appEnv } from '@/config/env.config'
import { logger } from '@/utils/logger'

export function setupMonitoring(app: App, router: Router) {
  if (appEnv.sentryDsn) {
    Sentry.init({
      app,
      dsn: appEnv.sentryDsn,
      environment: appEnv.env ?? (appEnv.isProd ? 'production' : 'development'),
      release: appEnv.sentryRelease,
      integrations: [Sentry.browserTracingIntegration({ router })],
      tracesSampleRate: appEnv.isProd ? 0.1 : 1
    })
  }

  app.config.errorHandler = (error, instance, info) => {
    logger.error('vue error', { error, instance, info })
    Sentry.captureException(error)
  }

  window.addEventListener('error', (event) => {
    logger.error('window error', event.error)
    Sentry.captureException(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('unhandled rejection', event.reason)
    Sentry.captureException(event.reason)
  })

  router.onError((error) => {
    logger.error('router error', error)
    Sentry.captureException(error)
  })

  const reportWebVital = (metric: unknown) => {
    logger.info('web vital', metric)
  }

  onCLS(reportWebVital)
  onFCP(reportWebVital)
  onINP(reportWebVital)
  onLCP(reportWebVital)
  onTTFB(reportWebVital)
}
