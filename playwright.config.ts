import process from 'node:process'

import { defineConfig, devices } from '@playwright/test'

const localServerUrl = 'http://127.0.0.1:5173'
const noProxyHosts = ['localhost', '127.0.0.1', '::1']
const noProxy = [process.env.NO_PROXY, process.env.no_proxy, ...noProxyHosts]
  .filter(Boolean)
  .join(',')

process.env.NO_PROXY = noProxy
process.env.no_proxy = noProxy

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['html'], ['list']],
  use: {
    baseURL: localServerUrl,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1',
    url: localServerUrl,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
