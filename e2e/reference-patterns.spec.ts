import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { COMPONENTS } from '../apps/playground/src/generated/components'
import {
  PATTERNS,
  REFERENCE_EXAMPLES,
} from '../apps/playground/src/lib/reference-examples'
import { hrefOf } from '../apps/playground/src/lib/reference-href'
import { gotoStory, storyIdFor } from './_lib/stories'

test('editor grammar changes preserve edits and read-only prevents writing', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await gotoStory(page, storyIdFor('CodeEditor'))
  const editor = page.getByRole('textbox', {
    name: 'Code editor',
    exact: true,
  })
  await expect(editor).toBeEditable()
  await editor.fill('const edited = 42')
  await page.getByRole('combobox', { name: 'Code language' }).click()
  await page.getByRole('option', { name: 'python', exact: true }).click()
  await expect(editor).toHaveText('const edited = 42')
  await page.getByText('Read-only code', { exact: true }).click()
  await expect(editor).toHaveAttribute('contenteditable', 'false')
  await page.getByRole('button', { name: 'Reset document' }).click()
  await expect(editor).toHaveText('const revenue = 24680')
})

test('registry examples resolve to a live atomic or recipe destination', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const destinations = [
    ...new Set(REFERENCE_EXAMPLES.map((entry) => entry.href)),
  ]
  for (const destination of destinations) {
    await test.step(destination, async () => {
      await page.goto(destination)
      await expect(page.locator('h1').first()).toBeVisible()
      expect(errors, destination).toEqual([])
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

test('component demos and structured previews render without a Storybook process', async ({
  page,
}) => {
  await page.goto('/atoms/button')
  await expect(
    page.getByRole('button', { name: 'Solid', exact: true }),
  ).toBeVisible()

  await page.goto('/organisms/page-toolbar?viewport=desktop')
  const iframe = page.locator('iframe')
  await expect(iframe).toHaveAttribute('src', /\/preview\/page-toolbar/)
  await expect(
    page.frameLocator('iframe').getByText('New ticket', { exact: true }),
  ).toBeVisible()

  await page.goto('/organisms/compositions/sidebar-01')
  await expect(
    page
      .frameLocator('iframe')
      .getByText('Getting Started', { exact: true })
      .first(),
  ).toBeVisible()
})

test('carousel supports buttons, vertical layout and keyboard position', async ({
  page,
}) => {
  await page.goto('/kit/recipes/carousel')
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
  await page.goto('/kit/recipes/command')
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
  await page.goto('/kit/recipes/verification')
  await page.getByRole('button', { name: 'Verify code', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('123456')
  await page
    .getByRole('textbox', { name: 'Verification code', exact: false })
    .fill('123456')
  await page.getByRole('button', { name: 'Verify code', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Code verified')
})

test('the multi-step form validates, reviews and completes', async ({
  page,
}) => {
  await page.goto('/kit/recipes/forms')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Enter a workspace name to continue.'),
  ).toBeVisible()

  await page.getByRole('textbox', { name: 'Workspace name' }).fill('Northstar')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Teammate email' })
    .fill('team@northstar.test')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Northstar', { exact: true })).toBeVisible()
  await expect(
    page.getByText('team@northstar.test', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Create workspace' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Workspace setup complete',
  )
})

test('enterprise overlays cover confirmation, form dialog and mobile sheet', async ({
  page,
}) => {
  await page.goto('/kit/recipes/overlays')
  await page.getByRole('button', { name: 'Confirm removal' }).click()
  const confirmation = page.getByRole('dialog', { name: 'Remove workspace?' })
  await expect(confirmation).toBeVisible()
  await confirmation.getByRole('button', { name: 'Remove workspace' }).click()
  await expect(confirmation).toBeHidden()

  await page.getByRole('button', { name: 'Edit workspace' }).click()
  const editor = page.getByRole('dialog', { name: 'Edit workspace' })
  await editor
    .getByRole('textbox', { name: 'Workspace name' })
    .fill('Northstar')
  await editor.getByRole('button', { name: 'Save changes' }).click()
  await expect(editor).toBeHidden()

  await page.getByRole('button', { name: 'Edit in a sheet' }).click()
  const sheet = page.getByRole('dialog', { name: 'Edit workspace' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('button', { name: 'Cancel' }).click()
  await expect(sheet).toBeHidden()
})

test('layout resize has native keyboard control and drawer saves shared data', async ({
  page,
}) => {
  await page.goto('/kit/recipes/layout')
  await page.getByRole('slider', { name: /Left panel width/ }).focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByText('Left panel width · 26%', { exact: true }),
  ).toBeVisible()
  await page.goto('/kit/recipes/navigation')
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

for (const { slug: name } of PATTERNS) {
  for (const theme of ['light', 'dark']) {
    test(`${name} pattern is accessible and fits narrow screens in ${theme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 900 })
      await page.goto(`/kit/recipes/${name}`)
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
