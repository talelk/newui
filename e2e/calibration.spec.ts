import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test } from '@playwright/test'
import { type CoherenceRule, inspectCoherence, settle } from './_lib/coherence'

/**
 * Calibration — the harness tests its own eyes.
 *
 * Every detector is planted into a deliberately broken fixture page and must
 * name the defect it claims to catch; a clean page must produce silence.
 * Without this, "the sweep is green" only means the sweep is quiet — and a
 * quiet sweep that cannot see a known-broken page is worse than none, because
 * it launders the gap into confidence.
 *
 * This is the same distinction the rest of the repo draws: deterministic
 * inspectors collect the facts, the fixtures prove the facts are collected.
 */

const fixture = (name: string) =>
  pathToFileURL(path.join(process.cwd(), 'e2e', 'fixtures', `${name}.html`))
    .href

async function open(page: import('@playwright/test').Page, name: string) {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(fixture(name))
  await settle(page)
  return inspectCoherence(page)
}

async function assertFlags(
  page: import('@playwright/test').Page,
  name: string,
  rule: CoherenceRule,
) {
  const violations = await open(page, name)
  expect(
    violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
    `${name}.html is planted with a ${rule} defect; nothing flagged it`,
  ).toContainEqual(expect.stringContaining(rule))
}

test('the sweep stays silent on a clean page', async ({ page }) => {
  const violations = await open(page, 'clean')
  expect(
    violations.map((v) => `${v.rule} — ${v.target}: ${v.details}`),
    'clean.html plants zero defects — any report is a false positive',
  ).toEqual([])
})

test('the sweep sees sideways overflow', async ({ page }) => {
  await assertFlags(page, 'overflow', 'viewport-overflow')
})

test('the sweep sees a clip with no scroll path', async ({ page }) => {
  await assertFlags(page, 'clipped', 'clipped-content')
})

test('the sweep sees unreachable truncated text', async ({ page }) => {
  await assertFlags(page, 'truncated', 'truncated-text')
})

test('the sweep sees an occluded control', async ({ page }) => {
  await assertFlags(page, 'occluded', 'occluded-control')
})
