import { expect, test } from '@playwright/test'

/**
 * Performance budgets, measured in a real browser.
 *
 * These are smoke budgets, not lab-grade measurements: they catch a regression
 * that makes a page visibly slow (a layout thrash, a blocking mount, a list that
 * no longer renders cheaply) without being flaky on shared CI hardware.
 *
 * The LCP/list budgets were raised when the library roughly doubled: `/spec`
 * deliberately renders ~35 components, so it loads the core atomic chunks by
 * design. The real per-component cost is the gzip budget in `scripts/size.ts`
 * (enforced separately); this stays a tripwire for a genuine slowdown.
 */
test('page metrics: LCP and CLS within budget', async ({ page }) => {
  await page.goto('/spec')
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

  const metrics = await page.evaluate(
    () =>
      new Promise<{ lcp: number; cls: number }>((resolve) => {
        let cls = 0
        let lcp = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            hadRecentInput: boolean
            value: number
          }[]) {
            if (!entry.hadRecentInput) cls += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })

        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          lcp = entries[entries.length - 1]?.startTime ?? 0
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        setTimeout(() => resolve({ lcp, cls }), 1500)
      }),
  )

  expect(metrics.cls, `CLS = ${metrics.cls}`).toBeLessThan(0.1)
  expect(metrics.lcp, `LCP = ${metrics.lcp}ms`).toBeLessThan(3500)
})

test('opening a dialog stays under an interaction budget', async ({ page }) => {
  await page.goto('/spec')
  // Let the app mount and settle so this measures a warm interaction, not the
  // cold chunk load after `goto`.
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  await page.waitForTimeout(300)

  const start = Date.now()
  await page.getByRole('button', { name: 'Open dialog' }).click()
  await page.locator('[data-slot="dialog-content"]').waitFor()
  const elapsed = Date.now() - start
  expect(elapsed, `dialog open = ${elapsed}ms`).toBeLessThan(600)
})

test('a 2000-row list renders within budget', async ({ page }) => {
  await page.goto('/spec?rows=2000')
  await expect(page.getByText('Row 2000')).toBeVisible()

  const ms = await page.evaluate(
    () => (window as unknown as { __listMs?: number }).__listMs ?? -1,
  )
  expect(ms, `list render = ${ms}ms`).toBeGreaterThanOrEqual(0)
  expect(ms, `list render = ${ms}ms`).toBeLessThan(2500)
})

test('theme toggle does not cause a layout shift', async ({ page }) => {
  await page.goto('/spec?theme=dark')
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()

  // Measure the shift the swap itself causes. Comparing exact pixel widths is
  // flaky: a theme swap can change the scrollbar, which is a layout change the
  // metric correctly ignores (`hadRecentInput`) but a width assertion does not.
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let value = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            hadRecentInput: boolean
            value: number
          }[]) {
            if (!entry.hadRecentInput) value += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: false })

        document.documentElement.setAttribute('data-theme', 'light')
        setTimeout(() => resolve(value), 400)
      }),
  )

  expect(cls, `theme swap CLS = ${cls}`).toBeLessThan(0.1)
})
