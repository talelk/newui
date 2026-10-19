/**
 * The coherence engine: one deterministic capture, reused by every sweep spec.
 *
 * The per-family specs (button boxes, overlay stacking, scrollbars) each query
 * the browser their own way. This module generalises that: it renders a demo,
 * lets the page settle exactly the way `pnpm shots` does, and runs one in-page
 * sweep that answers the questions no class-name assertion can see —
 *
 *  - `viewport-overflow`  the page scrolls sideways that should not
 *  - `clipped-content`    an `overflow: hidden` ancestor pastes part of a child
 *                         off, and the child is *not* in a scrollable region
 *  - `truncated-text`     text is cut off without an ellipsis, a clamp, or a
 *                         way to reach the rest of it
 *  - `occluded-control`   a visible, enabled control whose sampled hit points
 *                         all land on something else — the invisible-overlay
 *                         bug, expressed as a rule
 *
 * Everything it reports is geometry and computed style, so the same sweep runs
 * against a real demo and against the planted-defect fixtures in
 * `e2e/fixtures/` — that is what makes calibration possible: an inspector that
 * never fires on a known-broken page is not an inspector, it is decoration.
 *
 * The vector collector (`collectStyleVectors`) is the other half: it records
 * what each `data-slot` element *resolves to* (padding, radius, type, colour)
 * so `role-coherence.spec.ts` can compare semantic peers across every demo in
 * the library, not just the ones a human thought to assert on.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Page } from '@playwright/test'

/** Demo keys, parsed from `demos.tsx` — the registry is the source of truth. */
export function demoNames(): string[] {
  const registry = readFileSync(
    path.join(process.cwd(), 'apps/playground/src/demos.tsx'),
    'utf8',
  )
  return [...registry.matchAll(/^\s{2}([A-Za-z0-9]+): \(\) => import/gm)].map(
    (match) => match[1],
  )
}

export type CoherenceRule =
  | 'viewport-overflow'
  | 'clipped-content'
  | 'truncated-text'
  | 'occluded-control'

export interface Violation {
  rule: CoherenceRule
  target: string
  details: string
  /** Viewport-space box of the affected element, for crop-based review. */
  bounds?: { x: number; y: number; width: number; height: number } | null
}

export interface InspectOptions {
  /** Restrict which rules run (calibration uses the full set). */
  rules?: CoherenceRule[]
}

/**
 * Load a demo the way the docs site does, then make the page *still*:
 * lazy chunk resolved, fonts landed, two frames painted. Measuring before the
 * webfont settles measures the fallback metrics — the lesson from the
 * responsive-spec's CI-only failure.
 */
export async function gotoDemo(
  page: Page,
  name: string,
  options?: { theme?: 'light' | 'dark' },
): Promise<void> {
  const theme = options?.theme ?? 'light'
  // Same key `pnpm shots` and the site chrome use — the app reads its scheme
  // from localStorage, not from the media query.
  await page.addInitScript((value) => {
    localStorage.setItem('theme', value)
  }, theme)
  await page.goto(`/play?c=${name}`)
  await expectMounted(page)
  await settle(page)
}

/** A demo is mounted when `main` has children — portal demos keep most of
 * their DOM outside `main`, so counting `main` children alone is enough. */
async function expectMounted(page: Page): Promise<void> {
  await page.locator('main > *').first().waitFor({ timeout: 15_000 })
  if ((await page.locator('main > *').count()) === 0) {
    throw new Error('demo did not mount')
  }
}

export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
  })
}

/**
 * The sweep itself. One `page.evaluate`, so all four rules observe the *same*
 * frame — no races between two inspectors measuring different layouts.
 */
export async function inspectCoherence(
  page: Page,
  options?: InspectOptions,
): Promise<Violation[]> {
  const rules: CoherenceRule[] = options?.rules ?? [
    'viewport-overflow',
    'clipped-content',
    'truncated-text',
    'occluded-control',
  ]
  return page.evaluate(
    (ruleList) => {
      const active = new Set<string>(ruleList)
      const issues: Violation[] = []
      const TOL = 1
      const CLIP = new Set(['hidden', 'clip'])

      const describe = (el: Element): string => {
        const slot = el.getAttribute('data-slot')
        const tag = el.tagName.toLowerCase()
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
        return (
          `${slot ? `[${slot}] ` : ''}${tag}` +
          (text ? ` "${text.slice(0, 40)}"` : '')
        )
      }

      const srHiddenStyle = (style: CSSStyleDeclaration): boolean =>
        (Boolean(style.clip) &&
          style.clip !== 'auto' &&
          /^rect\(\s*0px\s*,\s*0px\s*,\s*0px\s*,\s*0px\s*\)$/.test(
            style.clip,
          )) ||
        /inset\(\s*50%\s*\)/.test(style.clipPath || '')

      const visible = (el: Element): el is HTMLElement => {
        if (!(el instanceof HTMLElement)) return false
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden')
          return false
        if (Number(style.opacity) === 0) return false
        // A closed `details` keeps its boxes in the layout (absolute panels
        // included) while painting nothing; Chrome also hides the collapsed
        // subtree through the Shadow DOM slot, so a descendant's own computed
        // style still claims to be visible. Ask the engine, not the style:
        // checkVisibility tracks display, visibility, opacity and
        // content-visibility together.
        if (
          !el.checkVisibility({
            visibilityProperty: true,
            opacityProperty: true,
          })
        )
          return false
        // Belt to the browser's braces: collapsed `details` content across
        // engines — anything under a closed summary is *collapsed*, not hidden.
        const collapsed = el.closest('details:not([open])')
        if (collapsed && el.tagName !== 'SUMMARY' && !el.closest('summary'))
          return false
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return false
        // The visually-hidden idiom paints nothing on purpose — a chart's
        // accessible data-table fallback uses `clip: rect(0 …)`. Nothing under
        // such a box is content a user lost, so the whole subtree is out.
        // (Component clips like Rating's half-stars are *visual* and stay in.)
        for (let node: Element | null = el; node; node = node.parentElement) {
          if (srHiddenStyle(getComputedStyle(node))) return false
        }
        return true
      }

      /**
       * Is `el` inside a scrollable region? A clipped child of a *scrollable*
       * ancestor is reachable, so it is not a defect. Overflow `auto`/`scroll`
       * is certain; plain `overflow: hidden` on a container whose scrollHeight
       * exceeds its clientHeight is *not* automatically a scroll path — that is
       * exactly the clip bug. It only counts when the container carries the
       * library's scroll affordance (a `*-scroll*` / `*-viewport` slot, e.g.
       * ScrollArea's, which wheels/touch/keyboard do move), because an inert
       * hidden box with a stray scrollTop is the defect, not the exception.
       * The page itself is deliberately not an escape hatch: the whole document
       * scrolls almost always, and that is not permission to clip content.
       */
      const scrollable = (el: Element): boolean => {
        const style = getComputedStyle(el)
        if (['auto', 'scroll'].includes(style.overflowX)) return true
        if (['auto', 'scroll'].includes(style.overflowY)) return true
        const slot = el.getAttribute('data-slot') ?? ''
        const scrollsInPractice =
          el.scrollHeight > el.clientHeight + TOL ||
          el.scrollWidth > el.clientWidth + TOL
        return scrollsInPractice && /scroll|viewport/i.test(slot)
      }
      const scrollableAncestor = (el: HTMLElement): Element | null => {
        let parent = el.parentElement
        while (
          parent &&
          parent.tagName !== 'BODY' &&
          parent.tagName !== 'HTML'
        ) {
          if (scrollable(parent)) return parent
          parent = parent.parentElement
        }
        return null
      }

      const clipAncestor = (el: HTMLElement): Element | null => {
        let parent = el.parentElement
        while (parent) {
          const style = getComputedStyle(parent)
          const clipX = CLIP.has(style.overflowX)
          const clipY = CLIP.has(style.overflowY)
          if (clipX || clipY) {
            const bounds = parent.getBoundingClientRect()
            const child = el.getBoundingClientRect()
            const pastX =
              clipX &&
              (child.left < bounds.left - 4 || child.right > bounds.right + 4)
            const pastY =
              clipY &&
              (child.top < bounds.top - 4 || child.bottom > bounds.bottom + 4)
            if (pastX || pastY) return parent
          }
          parent = parent.parentElement
        }
        return null
      }

      const all = [...document.querySelectorAll('body *')].filter(
        (el) =>
          el instanceof HTMLElement &&
          visible(el) &&
          el.tagName !== 'STYLE' &&
          el.tagName !== 'SCRIPT',
      )

      // -- viewport-overflow ---------------------------------------------------
      if (active.has('viewport-overflow')) {
        const doc = document.documentElement
        const over = doc.scrollWidth - window.innerWidth
        if (over > TOL) {
          const offenders = all
            .map((el) => ({ el, rect: el.getBoundingClientRect() }))
            .filter(({ rect }) => rect.right > doc.clientWidth + TOL)
            .sort((a, b) => b.rect.right - a.rect.right)
            .slice(0, 5)
            .map(
              ({ el, rect }) =>
                `${describe(el)} right=${Math.round(rect.right)}`,
            )
          issues.push({
            rule: 'viewport-overflow',
            target: 'document',
            details: `page is ${Math.round(over)}px past the viewport; widest: ${offenders.join(' | ') || 'unknown'}`,
          })
        }
      }

      // -- clipped-content ------------------------------------------------------
      if (active.has('clipped-content')) {
        const reported = new WeakSet<Element>()
        for (const el of all) {
          // Only content that is itself a container or carries text can be a
          // victim; skipping empties keeps the report honest.
          const hasContent =
            el.childElementCount > 0 || (el.textContent ?? '').trim().length > 0
          if (!hasContent) continue
          if (scrollableAncestor(el)) continue
          const clipper = clipAncestor(el)
          if (!clipper) continue
          // The clipper's own clip is only a defect when it hides something a
          // user cannot reach. If the clipper is itself scrollable in practice,
          // skip (ScrollArea roots are overflow:hidden on purpose).
          const scroll = scrollableAncestor(clipper as HTMLElement)
          if (scroll) continue
          // One report per clipper — the descendants would all name the same bug.
          if (reported.has(clipper)) continue
          reported.add(clipper)
          issues.push({
            rule: 'clipped-content',
            target: describe(el),
            details: `clipped by ${describe(clipper)} without a scroll path`,
          })
        }
      }

      // -- truncated-text -------------------------------------------------------
      if (active.has('truncated-text')) {
        for (const el of all) {
          if (el.childElementCount > 0) continue // leaves own the text question
          const text = (el.textContent ?? '').trim()
          if (text.length === 0) continue
          const style = getComputedStyle(el)
          const clipsX = CLIP.has(style.overflowX)
          const clipsY = CLIP.has(style.overflowY)
          if (!clipsX && !clipsY) continue
          if (style.textOverflow === 'ellipsis') continue
          if (style.webkitLineClamp && style.webkitLineClamp !== 'none')
            continue
          const cutX = el.scrollWidth > el.clientWidth + 1
          const cutY = el.scrollHeight > el.clientHeight + 1
          if (!cutX && !cutY) continue
          if (scrollableAncestor(el)) continue
          issues.push({
            rule: 'truncated-text',
            target: describe(el),
            details: `text cut off (${cutX ? 'x' : ''}${cutY ? 'y' : ''}) with no ellipsis, clamp or scroll: "${text.slice(0, 60)}"`,
          })
        }
      }

      // -- occluded-control ------------------------------------------------------
      if (active.has('occluded-control')) {
        const INTERACTIVE = [
          'a[href]',
          'button',
          'input:not([type="hidden"])',
          'select',
          'textarea',
          '[role="button"]',
          '[role="link"]',
          '[role="checkbox"]',
          '[role="radio"]',
          '[role="switch"]',
          '[role="tab"]',
          '[role="menuitem"]',
          '[role="option"]',
          '[role="combobox"]',
          '[role="slider"]',
          '[contenteditable]',
        ].join(',')
        for (const raw of document.querySelectorAll<HTMLElement>(INTERACTIVE)) {
          if (!visible(raw)) continue
          if ((raw as HTMLButtonElement).disabled) continue
          if (raw.getAttribute('aria-disabled') === 'true') continue
          // Zag hides native controls behind a styled layer; when the element
          // itself is invisible ink (appearance:none + zero opacity or a
          // visually-hidden box) its hit points are someone else's problem.
          const style = getComputedStyle(raw)
          if (style.pointerEvents === 'none') continue
          let rect = raw.getBoundingClientRect()
          if (rect.width < 4 || rect.height < 4) continue

          // Out of view is not occlusion — centre it and measure again.
          if (
            rect.top < 0 ||
            rect.bottom > window.innerHeight ||
            rect.left < 0 ||
            rect.right > window.innerWidth
          ) {
            raw.scrollIntoView({ block: 'center', inline: 'center' })
            rect = raw.getBoundingClientRect()
          }
          // Sample a spread across the box; the centre is not enough — an
          // overlay can cover the middle and miss the label.
          const fractions = [
            [0.5, 0.5],
            [0.25, 0.5],
            [0.75, 0.5],
          ]
          let occluding: string | null = null
          let hits = 0
          for (const [fx, fy] of fractions) {
            const x = rect.left + rect.width * fx
            const y = rect.top + rect.height * fy
            if (x < 0 || x >= window.innerWidth) continue
            if (y < 0 || y >= window.innerHeight) continue
            const top = document.elementFromPoint(x, y)
            if (top && (raw === top || raw.contains(top))) hits += 1
            else if (!occluding) occluding = top ? describe(top) : 'nothing'
          }
          if (hits === 0 && fractions.length > 0) {
            issues.push({
              rule: 'occluded-control',
              target: describe(raw),
              details: `every sampled point lands on ${occluding ?? 'nothing'}`,
            })
          }
        }
      }

      return issues
    },
    [...rules],
  )
}

/* --------------------------------------------------------------------------
 * Role style vectors — "two things that play the same role must resolve to
 * the same thing". Collected once per demo, compared across the library.
 * -------------------------------------------------------------------------- */

export interface StyleVector {
  /** `slot|variant|size|theme`, the identity of a semantic role instance. */
  key: string
  features: Record<string, string | null>
}

const FEATURE_PROPS = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'borderTopLeftRadius',
  'borderTopWidth',
  'fontSize',
  'color',
  'backgroundColor',
] as const

/**
 * For every visible `[data-slot]` element, record the computed-style features
 * that define its role. Colours are reduced through a canvas so `oklch()`
 * serialisation quirks cannot masquerade as drift — the same trick the
 * style-tokens spec plays.
 */
export async function collectStyleVectors(page: Page): Promise<StyleVector[]> {
  return page.evaluate(
    (featureProps) => {
      const toRgb = (value: string): string | null => {
        if (value === 'transparent' || value === 'currentcolor') return null
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        try {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, 1, 1)
          ctx.fillStyle = value
          ctx.fillRect(0, 0, 1, 1)
          const d = ctx.getImageData(0, 0, 1, 1).data
          return `${d[0]},${d[1]},${d[2]}`
        } catch {
          return null
        }
      }
      const theme = document.documentElement.getAttribute('data-theme') ?? ''
      const out: StyleVector[] = []
      // A role needs *samples*, not the whole table: cap instances per key so a
      // 2000-row list cannot turn a sweep into thousands of canvas probes.
      const perKey = new Map<string, number>()
      const CAP = 6
      for (const el of document.querySelectorAll<HTMLElement>('[data-slot]')) {
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') continue
        const rect = el.getBoundingClientRect()
        if (rect.width <= 1 || rect.height <= 1) continue
        const key = [
          el.getAttribute('data-slot'),
          el.getAttribute('data-variant') ?? '',
          el.getAttribute('data-size') ?? '',
          el.getAttribute('data-state')
            ? `state=${el.getAttribute('data-state')}`
            : '',
          el.getAttribute('data-highlighted') ? 'highlighted' : '',
          el.hasAttribute('data-disabled') ||
          el.getAttribute('aria-disabled') === 'true'
            ? 'disabled'
            : '',
          theme,
        ].join('|')
        const seen = perKey.get(key) ?? 0
        if (seen >= CAP) continue
        perKey.set(key, seen + 1)
        const features: Record<string, string | null> = {}
        for (const prop of featureProps) {
          const value = style[prop as never] as string
          if (prop === 'color' || prop === 'backgroundColor') {
            features[prop] = toRgb(value)
          } else {
            features[prop] = value || null
          }
        }
        // Line-height is only meaningful in px; `normal` means "inherited flow"
        // and is not drift when components differ that way.
        const lh = style.lineHeight
        features.lineHeight = lh === 'normal' ? null : lh
        out.push({ key, features })
      }
      return out
    },
    [...FEATURE_PROPS] as string[],
  )
}

/** Merge per-demo vectors into `key -> instances + observed feature values`. */
export function mergeVectors(
  target: Map<string, KeyAggregate>,
  vectors: StyleVector[],
): void {
  for (const { key, features } of vectors) {
    let aggregate = target.get(key)
    if (!aggregate) {
      aggregate = { instances: 0, features: new Map() }
      target.set(key, aggregate)
    }
    aggregate.instances += 1
    for (const [feature, value] of Object.entries(features)) {
      if (value === null) continue
      const values = aggregate.features.get(feature) ?? new Set<string>()
      values.add(value)
      aggregate.features.set(feature, values)
    }
  }
}

export interface KeyAggregate {
  instances: number
  features: Map<string, Set<string>>
}

/**
 * Peer groups that diverge: a role × variant × state that appears at least
 * `minInstances` times but resolves a feature to more than one value. The
 * threshold matters — one stray sample is not drift; four samples disagreeing
 * is.
 */
export function divergingRoles(
  aggregates: Map<string, KeyAggregate>,
  minInstances = 4,
): string[] {
  const report: string[] = []
  for (const [key, aggregate] of [...aggregates].sort()) {
    if (aggregate.instances < minInstances) continue
    for (const [feature, values] of [...aggregate.features].sort()) {
      if (values.size <= 1) continue
      report.push(
        `${key} ×${aggregate.instances} — ${feature}: ${[...values].slice(0, 4).join(' / ')}`,
      )
    }
  }
  return report
}
