import { spawnSync } from 'node:child_process'

/**
 * Install the harness's pinned Chromium with a short retry loop.
 *
 * Playwright's browser CDN occasionally resolves to a dead edge on hosted
 * runners (the error is a bare ENOTFOUND before any bytes move). That is not a
 * code failure and it should not red the whole browser job, so retry the
 * download a few times before giving up.
 */
const attempts = 3

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = spawnSync(
    'pnpm',
    ['exec', 'playwright', 'install', 'chromium'],
    {
      stdio: 'inherit',
    },
  )
  if (result.status === 0) process.exit(0)

  if (attempt < attempts) {
    process.stderr.write(
      `\n[playwright] download failed (attempt ${attempt}/${attempts}); retrying…\n\n`,
    )
    await new Promise((resolve) => setTimeout(resolve, 5_000))
  }
}

process.exit(1)
