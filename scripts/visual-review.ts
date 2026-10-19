/**
 * Visual review — the advisory pass, not a gate.
 *
 * `pnpm shots` writes the loop the design work runs on; this makes that loop
 * reviewable by machine without letting a model block a build. It renders a
 * route, runs the *deterministic* coherence sweep (the same inspector the
 * PR gates run), crops each reported region, and — only when
 * `NEWUI_VLM_ENDPOINT` is set — asks an OpenAI-compatible vision model for
 * a structured verdict per crop.
 *
 * The output is a bundle under `test-results/review/`:
 *
 *   findings.json  one entry per deterministic violation and per model finding
 *   crops/*.png    the flagged regions, 24px padded
 *   review.md      the human-facing summary
 *
 * Without the endpoint it still produces the bundle and exits 0; the model
 * is a reviewer, never the harness. `--require` fails the run when anything
 * is flagged (used by the nightly design loop, not by PR CI).
 *
 * Usage:
 *   pnpm review /blocks/stat-grid
 *   pnpm review --theme=dark /components/date-picker /spec
 *   NEWUI_VLM_ENDPOINT=http://localhost:8000/v1 NEWUI_VLM_MODEL=Qwen/Qwen3-VL pnpm review /spec --require
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { inspectCoherence, type Violation } from '../e2e/_lib/coherence'
import { startPreview } from './preview-server'

const PORT = 4186
const BASE = `http://localhost:${PORT}`

const args = process.argv.slice(2)
const flag = (name: string): string | undefined =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]
const requireClean = args.includes('--require')
const theme = flag('theme') ?? 'light'
const routes = args.filter((arg) => arg.startsWith('/'))
const outDir = path.resolve(process.cwd(), 'test-results', 'review')

const DEFAULT_ROUTES = ['/spec']
const selected = routes.length > 0 ? routes : DEFAULT_ROUTES

interface Finding {
  route: string
  theme: string
  source: 'deterministic' | 'vision'
  rule: string
  target: string
  details: string
  crop?: string
}

const rubric = `You are reviewing a screenshot crop from a component-library demo.
The page uses design tokens (semantic surface/ink/outline colors); the crop shows one flagged region.
Classify what you see as exactly one of:
- "defect" — content is unreadable, visibly clipped, misaligned with siblings, or a control looks broken.
- "design-suggestion" — acceptable but could be better.
Return JSON only: {"verdict": "defect"|"clean"|"design-suggestion", "note": "<one sentence>"}`

mkdirSync(path.join(outDir, 'crops'), { recursive: true })

const preview = startPreview(PORT)
const findings: Finding[] = []
const started = Date.now()

try {
  await preview.ready
  const browser = await chromium.launch({
    channel: process.env['NEWUI_SHOTS_CHROME'] ? 'chrome' : undefined,
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  })
  await context.addInitScript((value) => {
    localStorage.setItem('theme', value)
  }, theme)

  const vlm = process.env['NEWUI_VLM_ENDPOINT']
  const model = process.env['NEWUI_VLM_MODEL'] ?? 'qwen-vl'

  for (const route of selected) {
    const page = await context.newPage()
    // esbuild (under tsx) wraps named functions in `__name(...)`; Playwright's
    // test runner defines that global in the page, but a plain tsx script does
    // not. Without it, the inspector's serialized function throws on evaluate.
    await page.addInitScript(`globalThis.__name ??= (f) => f`)
    page.on('pageerror', (error) =>
      findings.push({
        route,
        theme,
        source: 'deterministic',
        rule: 'page-error',
        target: 'window',
        details: String(error).slice(0, 200),
      }),
    )
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 60_000 })
    await page
      .locator('main > *')
      .first()
      .waitFor({ timeout: 30_000 })
      .catch(() => {})
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
    })

    const slug = route
      .replace(/^\//, '')
      .replace(/[/?=&]/g, '-')
      .replace(/-+$/, '')
    const violations: Violation[] = await inspectCoherence(page)

    let index = 0
    for (const violation of violations) {
      const finding: Finding = {
        route,
        theme,
        source: 'deterministic',
        rule: violation.rule,
        target: violation.target,
        details: violation.details,
      }
      if (violation.bounds) {
        const pad = 24
        const clip = {
          x: Math.max(0, violation.bounds.x - pad),
          y: Math.max(0, violation.bounds.y - pad),
          width: Math.min(
            1440 - Math.max(0, violation.bounds.x - pad),
            violation.bounds.width + pad * 2,
          ),
          height: Math.min(
            900 - Math.max(0, violation.bounds.y - pad),
            violation.bounds.height + pad * 2,
          ),
        }
        const cropName = `${index}-${slug}-${violation.rule}.png`
        await page.screenshot({
          path: path.join(outDir, 'crops', cropName),
          clip,
          animations: 'disabled',
        })
        finding.crop = `crops/${cropName}`

        if (vlm) {
          const image = await page.screenshot({
            clip,
            type: 'png',
            animations: 'disabled',
          })
          try {
            const response = await fetch(
              `${vlm.replace(/\/$/, '')}/chat/completions`,
              {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  model,
                  messages: [
                    {
                      role: 'user',
                      content: [
                        { type: 'text', text: rubric },
                        {
                          type: 'image_url',
                          image_url: {
                            url: `data:image/png;base64,${Buffer.from(image).toString('base64')}`,
                          },
                        },
                      ],
                    },
                  ],
                  response_format: { type: 'json_object' },
                  max_tokens: 200,
                }),
              },
            )
            if (!response.ok) throw new Error(`VLM ${response.status}`)
            const body = (await response.json()) as {
              choices: { message: { content: string } }[]
            }
            const verdict = JSON.parse(
              body.choices[0]?.message.content ?? '{}',
            ) as {
              verdict?: string
              note?: string
            }
            if (verdict.verdict && verdict.verdict !== 'clean') {
              findings.push({
                route,
                theme,
                source: 'vision',
                rule: verdict.verdict,
                target: violation.target,
                details: verdict.note ?? 'no note',
                crop: finding.crop,
              })
            }
          } catch (error) {
            findings.push({
              route,
              theme,
              source: 'vision',
              rule: 'review-error',
              target: violation.target,
              details: `VLM unavailable: ${String(error).slice(0, 120)}`,
            })
          }
        }
      }
      findings.push(finding)
      index += 1
    }
    await page.close()
  }

  const summary = findings
    .map(
      (f) =>
        `- **${f.rule}** \`${f.route}\` — ${f.target}${f.details ? `: ${f.details}` : ''}${f.crop ? ` (${f.crop})` : ''}`,
    )
    .join('\n')
  writeFileSync(
    path.join(outDir, 'findings.json'),
    JSON.stringify(
      { generated: new Date().toISOString(), theme, findings },
      null,
      2,
    ),
  )
  writeFileSync(
    path.join(outDir, 'review.md'),
    `# Visual review — ${theme} · ${selected.join(', ')}\n\n` +
      (summary ||
        '_clean: deterministic sweep found nothing in the selected routes._') +
      `\n\n_VLM: ${vlm ? model : 'not configured — crops await human (or scheduled) review.'}_\n`,
  )

  const blockable = findings.filter(
    (f) => f.source === 'deterministic' || f.rule === 'defect',
  )
  console.warn(
    `review: ${findings.length} finding(s), ${blockable.length} blocking — test-results/review`,
  )
  if (requireClean && blockable.length > 0) process.exitCode = 1
} finally {
  console.warn(`(${Math.round((Date.now() - started) / 1000)}s)`)
  await Promise.resolve(preview.stop())
}
