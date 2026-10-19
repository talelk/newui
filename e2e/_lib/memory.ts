import type { Page } from '@playwright/test'

/**
 * Memory probes — heap truth, not vibes.
 *
 * `performance.memory` is sampled, coarse, and Chrome-only-deprecated. The
 * harness goes through CDP instead: `Runtime.getHeapUsage` is precise, and
 * `HeapProfiler.collectGarbage` forces the collection that lets you tell
 * "retained objects" apart from "objects the next GC was going to free
 * anyway". Any leak budget measured without a forced GC measures noise.
 *
 * Churn measurement mirrors `disposal.test.tsx` — that test proves the unit
 * level (mount/unmount 100×, `document.body` unchanged); this proves the page
 * level, where listeners held by a window, a Zag machine, or a timer can keep
 * a heap growing even when the DOM never moves.
 */

export interface MemoryProbe {
  /** Live JS heap, bytes. Precise (CDP), not the sampled `performance.memory`. */
  heapBytes: () => Promise<number>
  /** Every node in the document — the DOM side of the leak story. */
  domNodes: () => Promise<number>
  /** Force a full collection; always call before reading a *delta*. */
  forceGc: () => Promise<void>
  /** Detach the CDP session; call in a finally. */
  close: () => Promise<void>
}

export async function createMemoryProbe(page: Page): Promise<MemoryProbe> {
  const client = await page.context().newCDPSession(page)
  return {
    async heapBytes() {
      const { usedSize } = await client.send('Runtime.getHeapUsage')
      return usedSize
    },
    domNodes() {
      return page.evaluate(() => document.querySelectorAll('*').length)
    },
    async forceGc() {
      await client.send('HeapProfiler.collectGarbage')
      // Let transient cycles die, then collect again: one pass can still
      // measure the graph the previous pass was about to free.
      await page.waitForTimeout(60)
      await client.send('HeapProfiler.collectGarbage')
    },
    close() {
      return client.detach()
    },
  }
}

export interface ChurnResult {
  /** Heap bytes retained after the GC-delta two passes — the real number. */
  heapDelta: number
  /** Node growth across the churn. */
  domDelta: number
  heapBefore: number
  heapAfter: number
}

/**
 * Run `action` `cycles` times between settled baselines.
 *
 * A warmup pass first: the first cycle of a portal demo allocates module-level
 * portal hosts and Zag singleton state that get allocated exactly once and
 * would otherwise read as "the first cycle leaked" forever.
 */
export async function measureChurn(
  page: Page,
  probe: MemoryProbe,
  cycles: number,
  action: () => Promise<void>,
  options?: { settleMs?: number; warmup?: number },
): Promise<ChurnResult> {
  const settleMs = options?.settleMs ?? 40
  for (let i = 0; i < (options?.warmup ?? 3); i += 1) await action()
  await probe.forceGc()
  const heapBefore = await probe.heapBytes()
  const domBefore = await probe.domNodes()
  for (let i = 0; i < cycles; i += 1) {
    await action()
    await page.waitForTimeout(settleMs)
  }
  await probe.forceGc()
  const heapAfter = await probe.heapBytes()
  const domAfter = await probe.domNodes()
  return {
    heapDelta: heapAfter - heapBefore,
    domDelta: domAfter - domBefore,
    heapBefore,
    heapAfter,
  }
}

/** MB with one decimal — the unit every budget is written in. */
export const mb = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`
