/// <reference types="vite/client" />

declare module '*.vue' {
  import type { Component } from 'vue'

  const component: Component
  export default component
}

interface Window {
  __APP_CONFIG__?: {
    APP_NAME?: string
    APP_ENV?: 'development' | 'test' | 'staging' | 'production'
    API_BASE_URL?: string
    SENTRY_DSN?: string
    SENTRY_RELEASE?: string
  }
}
