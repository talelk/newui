import { expect, test } from '@playwright/test'

/**
 * Keyboard and focus behaviour — the parts only a real browser can prove.
 */
test('components keep their box metrics (no silently dropped utility)', async ({
  page,
}) => {
  await page.goto('/spec')
  const button = page.getByRole('button', { name: 'Save' })
  await expect(button).toBeVisible()

  // `px-*` and `h-*` are different axes. A merge config that makes an axis
  // family self-conflicting deletes one of them and the control collapses —
  // invisible in a class-name assertion, obvious in the box metrics.
  const metrics = await button.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      paddingLeft: Number.parseFloat(style.paddingLeft),
      height: el.getBoundingClientRect().height,
    }
  })

  expect(
    metrics.paddingLeft,
    `padding-left = ${metrics.paddingLeft}px`,
  ).toBeGreaterThan(0)
  expect(metrics.height, `height = ${metrics.height}px`).toBeGreaterThanOrEqual(
    24,
  )
})

test('the password reveal toggle meets the 24px target size', async ({
  page,
}) => {
  await page.goto('/spec')
  const toggle = page.getByRole('button', { name: 'Show password' })
  await expect(toggle).toBeVisible()

  // WCAG 2.2 target-size: a 20px icon button fails; the hit area must be ≥24px.
  const box = await toggle.boundingBox()
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(24)
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(24)
})

test('keyboard focus is visible (focus-visible ring)', async ({ page }) => {
  await page.goto('/spec')
  // The pages are code-split and mount asynchronously; wait for the app before
  // pressing Tab, or focus lands on <body> and there is no ring to measure.
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  await page.keyboard.press('Tab')

  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el) return null
    const style = getComputedStyle(el)
    return {
      tag: el.tagName,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    }
  })

  expect(outline).not.toBeNull()
  expect(outline?.outlineStyle).not.toBe('none')
  expect(Number.parseFloat(outline?.outlineWidth ?? '0')).toBeGreaterThan(0)
})

test('dialog traps focus and closes on Escape', async ({ page }) => {
  await page.goto('/spec')
  await page.getByRole('button', { name: 'Open dialog' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // Focus moved into the dialog.
  const focusInside = await page.evaluate(
    () => !!document.activeElement?.closest('[role="dialog"]'),
  )
  expect(focusInside).toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('tabs respond to arrow keys', async ({ page }) => {
  await page.goto('/spec')
  await page.getByRole('tab', { name: 'One' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Two' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('switch toggles with Space', async ({ page }) => {
  await page.goto('/spec')
  const control = page.locator('[data-slot="switch-control"]').first()
  const input = page.locator('input[role="switch"]').first()

  await expect(input).toHaveAttribute('aria-checked', 'false')
  await input.focus()
  await page.keyboard.press('Space')
  await expect(input).toHaveAttribute('aria-checked', 'true')
  await expect(control).toBeVisible()
})

test('select opens and commits a choice', async ({ page }) => {
  await page.goto('/spec')
  await page.locator('[data-slot="select-trigger"]').click()
  await page.getByText('Paid').click()
  await expect(page.locator('[data-slot="select-trigger"]')).toContainText(
    'Paid',
  )
})

test('multiselect accumulates removable chips', async ({ page }) => {
  await page.goto('/spec')
  const input = page.getByRole('combobox', { name: 'Labels' })

  await input.click()
  await page.getByRole('option', { name: 'Bug' }).click()
  await page.getByRole('option', { name: 'Docs' }).click()
  await expect(page.locator('[data-slot="multiselect-chip"]')).toHaveCount(2)

  await page.getByRole('button', { name: 'Remove Bug' }).click()
  await expect(page.locator('[data-slot="multiselect-chip"]')).toHaveCount(1)
})

test('combobox filters and commits a choice', async ({ page }) => {
  await page.goto('/spec')
  const input = page.getByRole('combobox', { name: 'Assignee' })

  await input.click()
  await expect(page.getByRole('option', { name: 'Alex Rivera' })).toBeVisible()

  await input.fill('sam')
  await expect(page.getByRole('option')).toHaveCount(1)

  await page.getByRole('option', { name: 'Sam Lee' }).click()
  await expect(input).toHaveValue('Sam Lee')
})

test('date picker opens and closes the calendar', async ({ page }) => {
  await page.goto('/spec')
  const input = page.getByRole('textbox', { name: 'Due date' })

  await input.click()
  await expect(page.getByRole('grid')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('grid')).toBeHidden()
})

test('the per-component demo route renders a component', async ({ page }) => {
  await page.goto('/play?c=Button')
  // The docs embed this route in an iframe, so it must render standalone.
  await expect(page.getByRole('button', { name: 'Solid' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Loading' })).toBeVisible()
  for (const name of ['Solid', 'Loading', 'Disabled', 'Add']) {
    expect(
      await page
        .getByRole('button', { name, exact: true })
        .evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(28)
  }
  expect(
    await page
      .getByRole('button', { name: 'md', exact: true })
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBe(32)
})

test('the mobile-shell route renders full-screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/examples/discussions/fullscreen')
  // `MobileShell` is `fixed inset-0`, so it lives on its own route rather than
  // inline in the scrolling site.
  await expect(
    page.getByRole('heading', { name: 'Design System', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Back to playground' }),
  ).toBeVisible()
})

test('tooltip appears on keyboard focus', async ({ page }) => {
  await page.goto('/spec')
  // Real keyboard navigation (not programmatic focus) so the focus is
  // `:focus-visible` — Zag opens the tooltip only for focus-visible, which is
  // the WCAG 1.4.13 behaviour.
  let focused = false
  for (let index = 0; index < 40; index += 1) {
    await page.keyboard.press('Tab')
    const text = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? '',
    )
    if (text === 'Hover me') {
      focused = true
      break
    }
  }
  expect(focused).toBe(true)
  await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 3000 })
})

test('analytics control defaults align, reserve both adornments and show focus and invalid state', async ({
  page,
}) => {
  await page.goto('/spec')
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeVisible()
  for (const selector of [
    '[data-slot="button"]',
    '[data-slot="text-input"]',
    '[data-slot="select-control"]',
    '[data-slot="combobox-control"]',
    '[data-slot="multiselect-control"]',
    '[data-slot="date-picker-control"]',
    '[data-slot="tab-buttons"]',
  ]) {
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height),
      selector,
    ).toBe(28)
  }
  const amount = page.getByRole('textbox', { name: 'Invoice amount' })
  const padding = await amount.evaluate((el) => {
    const style = getComputedStyle(el)
    return [
      Number.parseFloat(style.paddingInlineStart),
      Number.parseFloat(style.paddingInlineEnd),
    ]
  })
  expect(padding.every((value) => value >= 32)).toBe(true)
  await page.keyboard.press('Tab')
  await amount.focus()
  expect(
    await amount.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe('none')
  const invalid = page.getByRole('textbox', { name: 'Invalid email' })
  await expect(invalid).toHaveAttribute('aria-invalid', 'true')
  expect(
    await invalid.evaluate((el) => getComputedStyle(el).borderColor),
  ).not.toBe(await amount.evaluate((el) => getComputedStyle(el).borderColor))
})
