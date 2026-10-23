import type { Page } from '@playwright/test'

/**
 * Switch the site theme through whichever surface owns the control.
 *
 * Documentation pages keep the three theme buttons in the masthead; application
 * recipes pin the same control in the sidebar footer. On a phone that footer is
 * inside the navigation drawer.
 */
export async function setTheme(
  page: Page,
  theme: 'light' | 'dark',
): Promise<void> {
  const control = page.getByRole('button', {
    name: `Use ${theme} theme`,
    exact: true,
  })
  if (await control.isVisible().catch(() => false)) {
    await control.click()
    return
  }

  const navigation = page.getByRole('button', {
    name: 'Open application navigation',
  })
  if (await navigation.isVisible().catch(() => false)) {
    await navigation.click()
    await control.click()
    await page.keyboard.press('Escape')
    return
  }

  // Standalone auth pages have no app drawer. Their compact control cycles
  // light → dark → system, so click until the requested scheme lands.
  const compact = page.getByRole('button', { name: /^Theme: / })
  if (await compact.isVisible().catch(() => false)) {
    for (let index = 0; index < 3; index += 1) {
      if (
        (await page.evaluate(() => document.documentElement.dataset.theme)) ===
        theme
      )
        return
      await compact.click()
      await page.waitForTimeout(50)
    }
  }
}
