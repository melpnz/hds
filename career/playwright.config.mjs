import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { channel: 'msedge', headless: true, baseURL: 'http://127.0.0.1:4178', viewport: { width: 1440, height: 1000 } },
  webServer: { command: 'node tools/serve.mjs', url: 'http://127.0.0.1:4178/showcase/components.html', reuseExistingServer: false }
});
