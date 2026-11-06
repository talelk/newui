import type { ECharts } from 'echarts/core'
import { connect } from 'echarts/core'
import {
  type Accessor,
  createContext,
  createMemo,
  createUniqueId,
  type JSX,
  useContext,
} from 'solid-js'

/**
 * Linked highlighting across charts. echarts' `connect` group registry is
 * module-global, so two unrelated widgets that both pick `group: 'sync'`
 * would silently link. `useChartGroup` owns the namespacing — every id it
 * hands out is `newui.<name>.<id>`, unique to this app tree — and charts
 * join and leave it as they mount and unmount.
 *
 * Cross-filtering is *not* this file's business: that is
 * `createDashboardState`'s `cross`, consumed and emitted through the
 * callbacks the page wires up. This is the cheaper, pointer-level link —
 * hover and axis-pointer mirroring — that echarts gives us for free.
 */

/** Group ids this library registered, with the instances carrying them. */
const registry = new Map<string, Set<ECharts>>()

/** Put one instance into a namespaced group and (re)connect it. */
export function joinChartGroup(id: string, chart: ECharts): void {
  let members = registry.get(id)
  if (!members) {
    members = new Set()
    registry.set(id, members)
  }
  members.add(chart)
  // `chart.group` tags the instance; `connect` mirrors the registered
  // actions' events across every tagged instance. It is idempotent, so
  // connecting again when a late sibling mounts is safe.
  chart.group = id
  connect(id)
}

/** Drop one instance from its group. The group id stays alive for siblings. */
export function leaveChartGroup(id: string, chart: ECharts): void {
  const members = registry.get(id)
  if (!members) return
  members.delete(chart)
  if (!members.size) registry.delete(id)
  // Deliberately no `disconnect(id)`: the id is namespaced to this hook, and
  // disposing the instances already ends the linkage. A global disconnect
  // would kill the link for any sibling still mounting.
}

const ChartGroupContext = createContext<Accessor<string> | undefined>()

/** The handle `useChartGroup` returns. */
export type ChartGroup = {
  /** The namespaced echarts group id: `newui.<name>.<id>`. */
  id: string
  /** Render charts inside this provider to link them. */
  Provider: (props: { children?: JSX.Element }) => JSX.Element
}

/**
 * Create a linked-highlight group. Every chart rendered under the returned
 * `Provider` joins the namespaced group, so a hover on one mirrors onto the
 * others without any wiring on the individual charts.
 *
 * ```tsx
 * const trends = useChartGroup('trends')
 * <trends.Provider>
 *   <LineChart data={signups} x="month" y="count" />
 *   <LineChart data={revenue} x="month" y="amount" />
 * </trends.Provider>
 * ```
 */
export function useChartGroup(name: string): ChartGroup {
  const id = `newui.${name}.${createUniqueId()}`
  const Provider = (props: { children?: JSX.Element }): JSX.Element => (
    <ChartGroupProvider id={id}>{props.children}</ChartGroupProvider>
  )
  return { id, Provider }
}

/** The group id published by the enclosing `useChartGroup` provider. */
export function useChartGroupId(): Accessor<string | undefined> {
  const context = useContext(ChartGroupContext)
  return () => context?.()
}

/**
 * Publish a group id — the `id` from `useChartGroup`, or any namespaced id —
 * to every chart rendered below, so they link without a prop on each one.
 */
export function ChartGroupProvider(props: {
  id: string
  children?: JSX.Element
}): JSX.Element {
  const id = createMemo(() => props.id)
  return (
    <ChartGroupContext.Provider value={id}>
      {props.children}
    </ChartGroupContext.Provider>
  )
}
