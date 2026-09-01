import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
/** Point at an already-running dev server by setting PW_BASE_URL. */
const externalBase = process.env.PW_BASE_URL;
const baseURL = externalBase ?? `http://localhost:${PORT}`;

/**
 * E2E config. Boots the panel in dev against a `.env.local` that points at a
 * running Rust backend. Milestone-1 specs only assert public/auth surfaces.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalBase
    ? undefined
    : {
        command: `pnpm dev --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
