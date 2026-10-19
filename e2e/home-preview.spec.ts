import { expect, test } from '@playwright/test'

test('home previews load on scroll and are live controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      name: 'Clarity for your next data application.',
    }),
  ).toBeVisible()
  // Not paid for at first paint: the placeholder link stands in.
  await expect(page.getByRole('button', { name: 'Save changes' })).toHaveCount(
    0,
  )
  // A real wheel scroll: the section can be on screen at first paint on a
  // tall viewport, and previews intentionally load only after scrolling.
  await page.mouse.move(720, 450)
  await page.mouse.wheel(0, 800)
  const save = page.getByRole('button', { name: 'Save changes' })
  await expect(save).toBeVisible()
  const notify = page.getByRole('switch', { name: 'Email notifications' })
  await expect(notify).toBeChecked()
  await notify.focus()
  await page.keyboard.press('Space')
  await expect(notify).not.toBeChecked()
  await save.click()
  await expect(page.getByRole('button', { name: 'Saving…' })).toBeVisible()
})
