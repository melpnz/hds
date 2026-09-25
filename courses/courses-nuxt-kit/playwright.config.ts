import { defineConfig } from '@playwright/test'

const requestedChannel = process.env.PLAYWRIGHT_CHANNEL
const browserChannel = requestedChannel && requestedChannel !== 'chromium'
  ? requestedChannel
  : process.platform === 'win32' && !requestedChannel
    ? 'msedge'
    : undefined

export default defineConfig({
  testDir: './tests/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    ...(browserChannel ? { channel: browserChannel } : {}),
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      NUXT_TELEMETRY_DISABLED: '1'
    }
  }
})
