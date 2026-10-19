/**
 * Serve the built Storybook statically, on its own origin.
 *
 * The browser harness and `pnpm shots` drive story URLs (`/iframe.html?id=…`),
 * so they need the static output on a stable port (6007 by default) while the
 * site itself stays on 4173/4182. `pnpm storybook:serve` builds first when the
 * output is missing (`--build` always, `--no-build` never) and then answers;
 * `scripts/shots.ts` imports the same functions in-process.
 */
import { spawnSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(root, 'apps/playground')

export const STORYBOOK_OUT = path.join(appDir, 'storybook-static')
export const STORYBOOK_PORT = 6007

const ready = () =>
  existsSync(path.join(STORYBOOK_OUT, 'iframe.html')) &&
  existsSync(path.join(STORYBOOK_OUT, 'index.json'))

/** The storybook bin the playground installed, whatever pnpm aliased it to. */
function storybookBin(): string {
  const require = createRequire(path.join(appDir, 'package.json'))
  const manifestPath = require.resolve('storybook/package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    bin: string | Record<string, string>
  }
  const bin =
    typeof manifest.bin === 'string' ? manifest.bin : manifest.bin['storybook']
  if (!bin) throw new Error('the storybook package declares no `storybook` bin')
  return path.resolve(path.dirname(manifestPath), bin)
}

export function buildStorybook(): void {
  const result = spawnSync(
    process.execPath,
    [storybookBin(), 'build', '-o', STORYBOOK_OUT, '--quiet'],
    { cwd: appDir, stdio: 'inherit' },
  )
  if (result.status !== 0)
    throw new Error(`storybook build failed with code ${result.status}`)
}

const MIME: Record<string, string> = {
  css: 'text/css',
  html: 'text/html',
  ico: 'image/x-icon',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  map: 'application/json',
  mjs: 'text/javascript',
  png: 'image/png',
  svg: 'image/svg+xml',
  ttf: 'font/ttf',
  txt: 'text/plain',
  woff: 'font/woff',
  woff2: 'font/woff2',
}

export interface StorybookServer {
  ready: Promise<void>
  stop: () => void
}

export function serveStorybook(options: {
  port?: number
  /** `'if-missing'` (default), `true` (always), or `false` (never). */
  build?: boolean | 'if-missing'
}): StorybookServer {
  const port = options.port ?? STORYBOOK_PORT
  const build = options.build ?? 'if-missing'
  const shouldBuild = build === true || (build === 'if-missing' && !ready())
  if (shouldBuild) buildStorybook()
  if (!ready())
    throw new Error(
      `no Storybook build in ${path.relative(root, STORYBOOK_OUT)} — run \`pnpm storybook:build\``,
    )

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://localhost:${port}`)
    let pathname: string
    try {
      pathname = decodeURIComponent(url.pathname)
    } catch {
      response.writeHead(400).end('bad path')
      return
    }
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = path.normalize(path.join(STORYBOOK_OUT, pathname))
    // The static root is the only directory that may be read; a `..` escape
    // would serve the repository.
    if (!file.startsWith(STORYBOOK_OUT + path.sep)) {
      response.writeHead(403).end('forbidden')
      return
    }
    if (!existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end(`not found: ${pathname}`)
      return
    }
    const type = MIME[path.extname(file).slice(1)] ?? 'application/octet-stream'
    response.writeHead(200, {
      'content-type': type,
      // Determinism over caching: the harness reloads frames constantly and a
      // stale iframe is a lie.
      'cache-control': 'no-store',
    })
    if (request.method === 'HEAD') {
      response.end()
      return
    }
    createReadStream(file).pipe(response)
  })

  const stopped = new Promise<void>((resolve) => {
    server.once('close', resolve)
  })
  const listening = new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })

  const stop = () => {
    if (!server.listening) return
    server.close()
  }
  process.once('exit', stop)
  process.once('SIGINT', () => {
    stop()
    process.exit(130)
  })
  process.once('SIGTERM', () => {
    stop()
    process.exit(143)
  })

  return {
    ready: listening.then(() => {
      console.warn(`storybook static on http://localhost:${port}`)
    }),
    stop: () => {
      stop()
      void stopped
    },
  }
}

const isEntry =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntry) {
  const portArg = process.argv.indexOf('--port')
  const port = portArg > -1 ? Number(process.argv[portArg + 1]) : STORYBOOK_PORT
  const build: boolean | 'if-missing' = process.argv.includes('--build')
    ? true
    : process.argv.includes('--no-build')
      ? false
      : 'if-missing'
  try {
    const server = serveStorybook({ port, build })
    server.ready.catch((error: unknown) => {
      console.error(
        `[storybook] cannot serve on ${port}: ${
          error instanceof Error ? error.message : error
        }`,
      )
      process.exit(1)
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
