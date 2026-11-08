import { useLocation, useNavigate } from '@solidjs/router'
import type { UrlStateAdapter } from '@talelk/newui-data'

/**
 * The router half of the URL contract.
 *
 * `createUrlState` (and through it `createDashboardState` and
 * `createServerTableState`) round-trips what a link must carry, but the kit
 * never imports a router — the app supplies the adapter. This file is that
 * bridge for `@solidjs/router`: read the query string once, write it back
 * with `replace`, never push.
 *
 * One bridge is shared by every surface on the page. Each `createUrlState`
 * instance hands back only its own keys when it writes, so the bridge keeps
 * the keys it has seen for *this* instance and rewrites just those — the
 * dashboard's `range` and `f:region` and the table's `table.sorting` can
 * coexist in one query string without clobbering each other.
 */
export function createUrlStateBridge(): UrlStateAdapter {
  const location = useLocation()
  const navigate = useNavigate()
  const owned = new Set<string>()
  return {
    search: () => location.search,
    replace: (params) => {
      const current = new URLSearchParams(location.search)
      for (const key of owned) current.delete(key)
      for (const [key, value] of params) {
        current.set(key, value)
        owned.add(key)
      }
      const search = current.toString()
      navigate(`${location.pathname}${search ? `?${search}` : ''}`, {
        replace: true,
        scroll: false,
      })
    },
  }
}
