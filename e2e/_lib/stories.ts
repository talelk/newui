import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, type Page } from '@playwright/test'

/**
 * The story driver.
 *
 * Since the Storybook migration the sweep unit is a *story*: `generated/
 * stories.json` is Storybook's own index (written by `pnpm stories`), so the
 * harness drives exactly what Storybook serves — every state a component
 * documents, not just its default — and an id is a link that cannot drift.
 *
 * The static build answers on its own origin (`pnpm storybook:serve`, 6007),
 * while the site stays on 4173/4182. Pages that need a component use
 * `storyIdFor(name)`; the sweeps use `storyIds()`.
 */

export interface Story {
  id: string
  title: string
  name: string
  exportName: string
  importPath: string
  tags: string[]
}

/** Where the static Storybook build answers, overridable for CI. */
export const STORYBOOK_BASE =
  process.env['NEWUI_STORYBOOK_BASE'] ?? 'http://localhost:6007'

let cached: Story[] | undefined

export function stories(): Story[] {
  if (!cached) {
    const file = path.join(
      process.cwd(),
      'apps/playground/src/generated/stories.json',
    )
    cached = (JSON.parse(readFileSync(file, 'utf8')) as { stories: Story[] })
      .stories
  }
  return cached
}

/** Every story id — the sweep unit, ids sorted. `no-sweep` is the escape hatch. */
export function storyIds(): string[] {
  return stories()
    .filter((story) => !story.tags.includes('no-sweep'))
    .map((story) => story.id)
}

/**
 * The story a component's deep links use: its `Default`, or its first story.
 * A name the index does not know is a broken link, so it throws here.
 */
export function storyIdFor(component: string, name = 'Default'): string {
  const titled = stories().filter(
    (story) => story.title.split('/').at(-1) === component,
  )
  const story = titled.find((candidate) => candidate.name === name) ?? titled[0]
  if (!story) throw new Error(`no story documents “${component}”`)
  return story.id
}

/** A story URL, theme and direction carried as Storybook URL globals. */
export function storyUrl(
  id: string,
  options?: { theme?: 'light' | 'dark'; dir?: 'ltr' | 'rtl' },
): string {
  const params = new URLSearchParams({ id, viewMode: 'story' })
  const values: string[] = []
  if (options?.theme) values.push(`theme:${options.theme}`)
  if (options?.dir) values.push(`dir:${options.dir}`)
  if (values.length > 0) params.set('globals', values.join(','))
  return `${STORYBOOK_BASE}/iframe.html?${params.toString()}`
}

/**
 * The story rendered. Inline stories put their DOM inside the frame anchor
 * (`.storybook/preview.tsx` renders it even for portal-only stories); overlay
 * stories keep it in `body`, outside `#storybook-root`. A story that threw
 * shows Storybook's error display instead — caught, not screenshotted.
 */
async function hasStoryOutput(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const frame = document.querySelector('[data-story-frame]')
    if (frame && frame.children.length > 0) return true
    const root = document.querySelector('#storybook-root')
    for (const element of document.querySelectorAll('body [data-slot]')) {
      if (!root?.contains(element)) return true
    }
    return false
  })
}

export async function expectStoryMounted(page: Page): Promise<void> {
  const failure = page.locator('.sb-errordisplay:visible')
  // The preview either mounts the decorator frame or shows Storybook's error
  // display; wait for whichever lands first, so a broken story fails as a
  // broken story rather than as a 30-second "main never appeared" timeout.
  await expect
    .poll(
      async () => {
        if ((await failure.count()) > 0) return 'failed'
        return (await page.locator('main [data-story-frame]').count()) > 0
          ? 'mounted'
          : 'pending'
      },
      { timeout: 15_000 },
    )
    .not.toBe('pending')
  if ((await failure.count()) > 0)
    throw new Error('the story failed to render (Storybook error display)')
  await expect.poll(() => hasStoryOutput(page), { timeout: 15_000 }).toBe(true)
}

/** Wait for the page to be *still*: fonts landed, two frames painted. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
  })
}

/** Load one story the way a user deep link does, then hold until it is still. */
export async function gotoStory(
  page: Page,
  id: string,
  options?: { theme?: 'light' | 'dark'; dir?: 'ltr' | 'rtl' },
): Promise<void> {
  await page.goto(storyUrl(id, options))
  await expectStoryMounted(page)
  await settle(page)
}
