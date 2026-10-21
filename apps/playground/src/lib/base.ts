/**
 * The deploy base, in the two shapes the app needs.
 *
 * Vite exposes `BASE_URL` with a trailing slash (`/` locally, `/newui/` on a
 * project Pages site). Router links want the bare prefix, while asset URLs
 * want the slash. Keeping both here means a hard-coded `/` cannot slip into a
 * new page and break the deployed build.
 */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Turn a site-absolute path into one that respects the deploy base. */
export function sitePath(path: string): string {
  if (!path.startsWith('/')) return path
  return `${BASE_PATH}${path}`
}

/** Resolve a file in `public/` against the deploy base. */
export function assetUrl(file: string): string {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`
}

/** Remove the deploy prefix from a router pathname for route-relative logic. */
export function stripBase(pathname: string): string {
  if (!BASE_PATH) return pathname
  if (pathname === BASE_PATH) return '/'
  return pathname.startsWith(`${BASE_PATH}/`)
    ? pathname.slice(BASE_PATH.length)
    : pathname
}
