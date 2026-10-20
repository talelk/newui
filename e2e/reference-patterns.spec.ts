import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { COMPONENTS } from '../apps/playground/src/generated/components'
import { REFERENCE_EXAMPLES } from '../apps/playground/src/lib/reference-examples'
import { hrefOf } from '../apps/playground/src/lib/reference-href'

test('editor grammar changes preserve edits and read-only prevents writing', async ({
  page,
}) => {
  await page.goto('/organisms/code-editor')
  const editor = page.getByRole('textbox', { name: 'Code editor', exact: true })
  await editor.fill('const edited = 42')
  await page.getByRole('combobox', { name: 'Code language' }).click()
  await page.getByRole('option', { name: 'python', exact: true }).click()
  await expect(editor).toHaveText('const edited = 42')
  await page.getByText('Read-only code', { exact: true }).click()
  await expect(editor).toHaveAttribute('contenteditable', 'false')
  await page.getByRole('button', { name: 'Reset document' }).click()
  await expect(editor).toHaveText('const revenue = 24680')
})

test('every isolated registry example renders its own destination without page errors', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const entry of REFERENCE_EXAMPLES) {
    await test.step(entry.source, async () => {
      await page.goto(entry.href)
      await expect(
        page.getByRole('heading', { name: entry.name, exact: true, level: 1 }),
      ).toBeVisible()
      await expect(
        page.getByRole('link', {
          name: 'Full component contract or application',
        }),
      ).toHaveAttribute('href', entry.implementation)
      await expect(
        page.getByText('Loading example…', { exact: true }),
      ).toBeHidden()
      expect(errors, entry.source).toEqual([])
    })
  }
})

test('all shipped references resolve contracts, source and live demos in both schemes', async ({
  page,
}) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const theme of ['light', 'dark']) {
    for (const entry of COMPONENTS.filter((entry) => entry.shipped)) {
      await test.step(`${entry.name} ${theme}`, async () => {
        await page.goto(hrefOf(entry))
        await page.evaluate((scheme) => {
          document.documentElement.dataset['theme'] = scheme
        }, theme)
        await expect(
          page.getByRole('heading', {
            name: entry.name,
            exact: true,
            level: 1,
          }),
        ).toBeVisible()
        await expect(
          page.getByText('Loading demo…', { exact: true }),
        ).toBeHidden()
        await expect(
          page.getByText('Loading the contract…', { exact: true }),
        ).toBeHidden()
        await expect(
          page.getByText(
            'The contract could not be loaded. Reload the page to try again.',
          ),
        ).toHaveCount(0)
        await expect(
          page.getByText('No demo registered for this component yet.'),
        ).toHaveCount(0)
        expect(errors, `${entry.name} ${theme}`).toEqual([])
      })
    }
  }
})

test('carousel supports buttons, vertical layout and keyboard position', async ({
  page,
}) => {
  await page.goto('/pages/patterns/carousel')
  await page.getByRole('button', { name: 'Next slide', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Slide 2 of 5')
  await page.getByRole('combobox', { name: 'Orientation', exact: true }).click()
  await page.getByRole('option', { name: 'Vertical', exact: true }).click()
  await page.getByRole('region', { name: 'Slides', exact: true }).focus()
  await page.keyboard.press('End')
  await expect(page.getByRole('status')).toContainText('Slide 5 of 5')
})

test('command palette searches and opens a destination with the keyboard', async ({
  page,
}) => {
  await page.goto('/pages/patterns/command')
  await page.getByRole('button', { name: 'Open command palette' }).click()
  const search = page.getByRole('combobox', {
    name: 'Command palette search',
    exact: true,
  })
  await search.fill('installation')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs$/)
})

test('verification accepts pasted digits and reports errors and success', async ({
  page,
}) => {
  await page.goto('/pages/patterns/verification')
  await page.getByRole('button', { name: 'Verify code', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('123456')
  await page
    .getByRole('textbox', { name: 'Verification code', exact: false })
    .fill('123456')
  await page.getByRole('button', { name: 'Verify code', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Code verified')
})

test('layout resize has native keyboard control and drawer saves shared data', async ({
  page,
}) => {
  await page.goto('/pages/patterns/layout')
  await page.getByRole('slider', { name: /Left panel width/ }).focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByText('Left panel width · 26%', { exact: true }),
  ).toBeVisible()
  await page.goto('/pages/patterns/navigation')
  await page
    .getByRole('button', { name: 'Edit in a drawer', exact: true })
    .click()
  await page
    .getByRole('textbox', { name: 'Workspace name', exact: false })
    .fill('Northstar workspace')
  await page
    .getByRole('button', { name: 'Save workspace', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(
    page.getByText('Current workspace: Northstar workspace', { exact: true }),
  ).toBeVisible()
})

for (const name of [
  'carousel',
  'command',
  'layout',
  'navigation',
  'verification',
  'analytics-widgets',
]) {
  for (const theme of ['light', 'dark']) {
    test(`${name} pattern is accessible and fits narrow screens in ${theme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 900 })
      await page.goto(`/pages/patterns/${name}`)
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(page.locator('h1')).toBeVisible()
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
      await page.setViewportSize({ width: 320, height: 900 })
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl'
        document.documentElement.style.fontSize = '200%'
      })
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1)
    })
  }
}
