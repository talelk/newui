import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('authentication validates credentials and offers a local demo session', async ({
  page,
}) => {
  await page.goto('/examples/authentication/fullscreen')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Work email', exact: false })
    .fill('rhea@example.com')
  await page
    .getByLabel('Password', { exact: false })
    .first()
    .fill('correct-demo-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Open the dashboard', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText('local demo session')
  await page.getByRole('button', { name: 'Back to sign in' }).click()
  await page.getByRole('tab', { name: 'Sign up', exact: true }).click()
  await expect(
    page.getByRole('textbox', { name: 'Full name', exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Use a sign-in link instead' }).click()
  await page
    .getByRole('textbox', { name: 'Work email', exact: false })
    .fill('rhea@example.com')
  await page.getByRole('button', { name: 'Send demo link' }).click()
  await expect(
    page.getByRole('heading', { name: 'Check your demo inbox' }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText('No email was sent')
})

test('business cards validate, add members, update preferences and copy a share link', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/examples/cards/fullscreen')
  await page.getByRole('button', { name: 'Create demo account' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Account name', exact: false })
    .fill('Rhea Kapoor')
  await page
    .getByRole('textbox', { name: 'Account email', exact: false })
    .fill('rhea@example.com')
  await page.getByRole('button', { name: 'Create demo account' }).click()
  await expect(
    page.getByText('Demo account created for Rhea Kapoor.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Invite email' })
    .fill('ana@example.com')
  await page.getByRole('button', { name: 'Add demo member' }).click()
  await expect(
    page.getByText('3 members in this workspace.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Copy link', exact: true }).click()
  await expect(page.getByText('Link copied.', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://acme.example/reports/september',
  )
  await page.getByRole('switch', { name: 'Weekly digest', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(
    page.getByRole('switch', { name: 'Weekly digest', exact: true }),
  ).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Submit demo report' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'at least 10 characters' }),
  ).toBeVisible()
  await page
    .getByRole('textbox', { name: 'What happened?' })
    .fill('The report export needs a clearer filename.')
  await page.getByRole('button', { name: 'Submit demo report' }).click()
  await expect(
    page.getByText(
      'Your medium priority billing report is saved in this demo.',
      { exact: true },
    ),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Star project', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Starred', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})

for (const route of [
  '/examples/authentication/fullscreen',
  '/examples/cards/fullscreen',
]) {
  for (const theme of ['light', 'dark']) {
    test(`${route} is accessible and fits at 390px in ${theme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 900 })
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      await page.getByRole('button', { name: theme, exact: true }).click()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1)
      const result = await new AxeBuilder({ page }).analyze()
      expect(result.violations).toEqual([])
    })
  }
}
