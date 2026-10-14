import { normalizeProps, useMachine } from '@zag-js/solid'
import { type Accessor, createContext, createMemo, useContext } from 'solid-js'

/**
 * Zag, re-exported through the Solid adapter.
 *
 * `useMachine(machine, props)` then `connect(service, normalizeProps)` is the
 * shape every component needs; `normalizeProps` maps Zag's React-shaped props
 * onto Solid's (`className` → `class`, `onChange` → `onInput`, …).
 */
export { mergeProps, normalizeProps, useMachine } from '@zag-js/solid'

/**
 * The machine + connected-API pair, in one call.
 *
 * Every Zag-backed component needs exactly this, and the API must be a memo so
 * `api().open` re-runs when the machine's state changes. `props` is an accessor
 * so the machine sees reactive values rather than a snapshot.
 *
 * `Api` is explicit because Zag's `connect` is generic (`connect<T, P>`), so it
 * cannot be inferred from the machine; the type is already written at the call
 * site as `ReturnType<typeof zag.connect>`.
 */
export function createZagApi<Api, Service = unknown>(
  machine: unknown,
  connect: (service: never, normalize: never) => Api,
  props: () => Record<string, unknown>,
): { service: Service; api: Accessor<Api> } {
  const service = useMachine(machine as never, props as never)
  const api = createMemo(() =>
    connect(service as never, normalizeProps as never),
  )
  return { service: service as Service, api }
}

/**
 * A compound family's context: one provider at the root, one accessor hook for
 * the parts. The error names the family, so a part used outside its root says
 * which root it wants.
 */
export function createZagContext<Api>(name: string) {
  const context = createContext<Accessor<Api>>()

  function useApi(): Accessor<Api> {
    const value = useContext(context)
    if (!value) {
      throw new Error(`${name} parts must be used within <${name}.Root>`)
    }
    return value
  }

  return { context, useApi }
}
