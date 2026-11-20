import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4173/canvas-rebuild/'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    channel: process.env.COURSEWORK_BROWSER_CHANNEL || undefined,
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
  },
})
