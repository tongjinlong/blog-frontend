import { appEnv } from '@/config/env.config'

export const logger = {
  info(message: string, context?: unknown) {
    if (appEnv.isDev) {
      console.info(message, context)
    }
  },
  warn(message: string, context?: unknown) {
    console.warn(message, context)
  },
  error(message: string, context?: unknown) {
    console.error(message, context)
  }
}
