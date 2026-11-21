import { defineConfig } from "@playwright/test";

// End-to-end tests drive the production build in a real browser.
// `npm run test:e2e` builds the app, serves it with `vite preview` and runs e2e/*.spec.ts.
//
// Playwright downloads its own Chromium with `npx playwright install chromium`.
// Set PLAYWRIGHT_CHANNEL=chrome to use an installed Google Chrome instead.
const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
