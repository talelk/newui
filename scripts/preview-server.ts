import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

/** Own the Vite process directly; pnpm may create a separate child process group. */
export function startPreview(port: number) {
  const require = createRequire(import.meta.url)
  const vite = path.join(
    path.dirname(require.resolve('vite/package.json')),
    'bin/vite.js',
  )
  const server = spawn(
    process.execPath,
    [
      vite,
      'preview',
      'apps/playground',
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  let stopped = false
  let diagnostics = ''
  const stop = () => {
    if (stopped) return
    stopped = true
    process.removeListener('exit', stop)
    process.removeListener('SIGINT', interrupt)
    process.removeListener('SIGTERM', terminate)
    if (server.exitCode !== null || !server.pid) return
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch {
      server.kill('SIGTERM')
    }
  }
  const interrupt = () => {
    stop()
    process.exit(130)
  }
  const terminate = () => {
    stop()
    process.exit(143)
  }
  process.once('exit', stop)
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', terminate)
  const ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Preview on ${port} did not start: ${diagnostics}`))
      stop()
    }, 30_000)
    server.stdout.on('data', (chunk: Buffer) => {
      diagnostics = `${diagnostics}${chunk.toString()}`.slice(-4096)
      if (diagnostics.includes('Local:')) {
        clearTimeout(timer)
        resolve()
      }
    })
    server.stderr.on('data', (chunk: Buffer) => {
      diagnostics = `${diagnostics}${chunk.toString()}`.slice(-4096)
    })
    server.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    server.once('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`Preview on ${port} exited (${code}): ${diagnostics}`))
    })
  })
  return { ready, stop }
}
