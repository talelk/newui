import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

/** Strip SGR colour codes — CI exports FORCE_COLOR, so piped output is coloured. */
function stripAnsi(text: string): string {
  return text.replace(/\p{Cc}\[[0-9;]*m/gu, '')
}

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
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clearInterval(probe)
      resolve()
    }
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      clearInterval(probe)
      reject(error)
      stop()
    }
    const timer = setTimeout(() => {
      fail(new Error(`Preview on ${port} did not start: ${diagnostics}`))
    }, 30_000)
    // An HTTP probe is the real readiness signal: CI exports FORCE_COLOR, and
    // the banner's ANSI codes break any text match on stdout.
    const probe = setInterval(() => {
      if (settled || server.exitCode !== null) return
      void fetch(`http://localhost:${port}/`)
        .then(() => finish())
        .catch(() => {})
    }, 100)
    server.stdout.on('data', (chunk: Buffer) => {
      diagnostics = `${diagnostics}${stripAnsi(chunk.toString())}`.slice(-4096)
      if (diagnostics.includes('Local:')) finish()
    })
    server.stderr.on('data', (chunk: Buffer) => {
      diagnostics = `${diagnostics}${stripAnsi(chunk.toString())}`.slice(-4096)
    })
    server.once('error', (error) => fail(error))
    server.once('exit', (code) => {
      fail(new Error(`Preview on ${port} exited (${code}): ${diagnostics}`))
    })
  })
  return { ready, stop }
}
