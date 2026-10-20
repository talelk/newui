import { Navigate, useLocation } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { componentBySlug } from '../generated/components'
import { hrefOf } from '../lib/reference-href'

/**
 * The pre-atomic URLs, redirected.
 *
 * The site renamed its sections to atomic design's levels; the old paths were
 * public long enough that a bookmark, a search result or a link in an issue is
 * likely to land on one. `/components/:name` cannot be rewritten by prefix —
 * the name decides whether the entry is an atom or a molecule — so the redirect
 * reads the registry and resolves the canonical URL the same way the reference
 * page does.
 *
 * This page imports the registry, so it is lazy: the shell must not pay for it
 * on every route.
 */
const PREFIX_MOVES = [
  [/^\/blocks/, '/organisms'],
  [/^\/layouts/, '/templates'],
  [/^\/charts/, '/organisms'],
  [/^\/editors/, '/organisms'],
  [/^\/examples/, '/pages'],
] as const

export function LegacyRedirect(): JSX.Element {
  const location = useLocation()

  const target = () => {
    const path = location.pathname

    if (path === '/components' || path === '/components/') return '/atoms'
    if (path.startsWith('/components/')) {
      // Read the remainder off the path: a splat's param name varies with the
      // router version, and the URL is the one thing both agree on. The last
      // segment is the slug even if a stale link carried a trailing path.
      const rest = path.replace(/^\/components\/?/, '')
      const slug = rest.split('/').filter(Boolean).pop() ?? ''
      const entry = componentBySlug(slug)
      return entry ? hrefOf(entry) : '/atoms'
    }

    for (const [pattern, prefix] of PREFIX_MOVES) {
      if (pattern.test(path)) return path.replace(pattern, prefix)
    }
    return '/'
  }

  return <Navigate href={target()} />
}
