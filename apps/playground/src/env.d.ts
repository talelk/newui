/// <reference types="vite/client" />

/**
 * The app's env contract. Declaring the key is what lets `storybook.ts` read
 * it with dot access — Vite only statically replaces `import.meta.env.KEY`,
 * never `import.meta.env['KEY']`, so a bracket read silently falls back at
 * build time (the same shape as the dead 6006 origin bug).
 */
interface ImportMetaEnv {
  /** Static Storybook origin for embeds and deep links. */
  readonly VITE_STORYBOOK_BASE?: string
}
