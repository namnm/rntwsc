import { defineConfig, devices } from '@playwright/test'

const turbopackPort = 3200
const webpackPort = 3201
const vitePort = 3202

// see contribution/dev.md's "Running e2e tests" for why these use real
// production builds instead of next start/dev or vite's dev server
const standaloneServer = (cwd: string, port: number, copyFirst: boolean) => ({
  command: [
    ...(copyFirst ? ['pnpm copy'] : []),
    'pnpm build',
    `cp -r .next/static .next/standalone/${cwd}/.next/static`,
    `(cp -r public .next/standalone/${cwd}/public 2>/dev/null || true)`,
    `PORT=${port} node .next/standalone/${cwd}/server.js`,
  ].join(' && '),
  cwd: `./${cwd}`,
  url: `http://localhost:${port}`,
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
})

// vite preview serves the real vite build output as static files - see
// contribution/dev.md
const viteServer = {
  command: `pnpm build && npx vite preview --port ${vitePort} --strictPort`,
  cwd: './playground/vite',
  url: `http://localhost:${vitePort}`,
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'turbopack',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${turbopackPort}`,
      },
      testIgnore: ['**/routes-vite.spec.ts'],
    },
    {
      name: 'webpack',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${webpackPort}`,
      },
      testIgnore: ['**/routes-vite.spec.ts'],
    },
    // vite has its own spec instead of sharing routes.spec.ts/hydration-data.spec.ts -
    // see contribution/dev.md's "Running e2e tests"
    {
      name: 'vite',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${vitePort}`,
      },
      testMatch: ['**/routes-vite.spec.ts'],
    },
  ],
  webServer: [
    standaloneServer('playground/turbopack', turbopackPort, false),
    standaloneServer('playground/webpack', webpackPort, true),
    viteServer,
  ],
})
