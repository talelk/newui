import { type Config, createTailwindMerge } from 'tailwind-merge'
import { twMergeConfig } from './tw-merge.config'

/**
 * Class merging, on a config pruned to the utilities this library emits.
 *
 * `tailwind-merge`'s default config ships every Tailwind group (~14 kB gzip,
 * paid by every component). `createTailwindMerge` takes a *full* config — there
 * is no partial path — so the config lives beside this file and
 * `tw-merge.test.ts` proves it agrees with the default for every pair of
 * utilities this repo actually uses. If a group is missing, that test fails
 * rather than a class silently failing to override.
 */
export const twMerge = createTailwindMerge(
  // `as const` gives the config literal types for the test; the cast bridges
  // its readonly arrays to tailwind-merge's mutable `Config`.
  () => twMergeConfig as unknown as Config<string, string>,
)
