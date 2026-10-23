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

  await page
    .getByRole('button', { name: 'Open application navigation' })
    .click()
  await control.click()
  await page.keyboard.press('Escape')
}
