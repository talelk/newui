import { twMerge } from './tw-merge'

/**
 * The variant resolver, in-house.
 *
 * `tailwind-variants` cost ~14.5 kB gzip (it bundles its own merge integration)
 * on every component, and the only features this library used were `base`,
 * `variants`, `compoundVariants` and `defaultVariants`. This is those four,
 * typed, with no dependency — the conflict merge stays in `tailwind-merge`,
 * whose engine we do need.
 */
export type ClassValue = string | number | boolean | null | undefined
export type ClassList = ClassValue | readonly ClassValue[]

type VariantValue = string | boolean | null | undefined
// Deliberately shallow: a recursive `ClassList` inside a `Record<string, …>`
// makes TypeScript's instantiation explode on the mapped types below.
type VariantMap = Record<string, Record<string, string | readonly string[]>>

export interface TvConfig<V extends VariantMap> {
  base?: ClassList
  variants?: V
  compoundVariants?: Array<
    Partial<Record<keyof V, VariantValue>> & { class: ClassList }
  >
  defaultVariants?: Partial<Record<keyof V, VariantValue>>
}

/**
 * The per-axis selection a recipe accepts. An axis whose keys are exactly
 * `true`/`false` (a boolean variant) accepts a boolean; every other axis
 * accepts only its declared values, so `theme` stays a union of colour names
 * rather than widening to `boolean`.
 */
type AxisValue<K> = [K] extends ['true' | 'false'] ? boolean : K

export type VariantSelection<V extends VariantMap> = {
  [P in keyof V]?: AxisValue<keyof V[P]> | null
}

/**
 * The recipe function. It carries the config's variant shape as a phantom field
 * so `VariantProps<typeof recipe>` can recover it — the same trick
 * `tailwind-variants` used, without the dependency.
 */
export interface TvFn<V extends VariantMap> {
  (props?: VariantSelection<V> & TvOptions): string
  readonly __variants?: V
}

/**
 * The props of a recipe. The fallback is `object` (no members) rather than an
 * index signature, so an interface extending it is never forced to `never`.
 */
export type VariantProps<C> =
  C extends TvFn<infer V>
    ? V extends VariantMap
      ? VariantSelection<V>
      : object
    : object

function toArray(value: ClassList | undefined): ClassValue[] {
  if (value === undefined || value === null || value === false) return []
  return Array.isArray(value)
    ? (value.flat(Number.POSITIVE_INFINITY) as ClassValue[])
    : [value as ClassValue]
}

/** Join class values, dropping falsy ones — the `clsx` behaviour, in ~10 lines. */
export function cx(...inputs: ClassValue[]): string {
  return toArray(inputs).filter(Boolean).join(' ')
}

/** Join and resolve Tailwind conflicts, so a caller's class always wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(cx(...inputs))
}

export interface TvOptions {
  class?: ClassValue
}

export function tv<V extends VariantMap>(config: TvConfig<V>): TvFn<V> {
  const variants = (config.variants ?? {}) as VariantMap

  return ((props: VariantSelection<V> & TvOptions = {}): string => {
    const { class: override, ...selected } = props as Record<
      string,
      VariantValue
    > &
      TvOptions

    const resolved: Record<string, VariantValue> = {}
    for (const axis of Object.keys(variants)) {
      const value = selected[axis] ?? config.defaultVariants?.[axis]
      if (value !== undefined && value !== null) resolved[axis] = value
    }

    const classes = toArray(config.base)

    for (const [axis, value] of Object.entries(resolved)) {
      const variantClass = variants[axis]?.[String(value)]
      if (variantClass) classes.push(...toArray(variantClass))
    }

    for (const compound of config.compoundVariants ?? []) {
      const { class: compoundClass, ...conditions } = compound as Record<
        string,
        VariantValue | ClassList
      >
      const matches = Object.entries(conditions).every(
        ([axis, value]) => String(resolved[axis]) === String(value),
      )
      if (matches) classes.push(...toArray(compoundClass as ClassList))
    }

    if (override) classes.push(...toArray(override as ClassList))

    return twMerge(cx(...classes))
  }) as TvFn<V>
}
