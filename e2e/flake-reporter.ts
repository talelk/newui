import type {
  Reporter,
  TestCase,
  TestResult,
  TestSuite,
} from '@playwright/test'

/**
 * Flake reporter.
 *
 * A retry that silently turns red into green *hides* a real bug: the suite
 * says green while the bug reproduces every other run. This reporter collects
 * tests that failed an attempt and then passed, and prints them as flaky (exit
 * code stays green — that is the retry contract). When the list is non-empty,
 * the next step is a `--last-failed` reproduction, not a shrug.
 */
interface Outcome {
  attempts: number
  everFailed: boolean
  finalStatus: string
}

class FlakeReporter implements Reporter {
  private outcomes = new Map<string, Outcome>()

  private key(test: TestCase): string {
    return `${test.location.file}:${test.location.line} ${test.title}`
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const entry = this.outcomes.get(this.key(test)) ?? {
      attempts: 0,
      everFailed: false,
      finalStatus: result.status,
    }
    entry.attempts += 1
    entry.finalStatus = result.status
    if (result.status === 'failed' || result.status === 'timedOut')
      entry.everFailed = true
    this.outcomes.set(this.key(test), entry)
  }

  onEnd(): void {
    const flaky: string[] = []
    const doubledButGreen: string[] = []
    const walk = (suite: TestSuite): void => {
      for (const test of suite.allTests()) {
        const entry = this.outcomes.get(this.key(test))
        if (!entry || entry.attempts < 2) continue
        if (entry.everFailed && entry.finalStatus === 'passed')
          flaky.push(this.key(test))
        else if (!entry.everFailed && entry.finalStatus === 'passed')
          doubledButGreen.push(this.key(test))
      }
    }
    for (const suite of this.rootSuites) walk(suite)

    if (flaky.length) {
      console.warn('\n⚑ FLAKY — failed once, passed on retry; reproduce with:')
      for (const name of flaky)
        console.warn(`    node_modules/.bin/playwright test "${name}"`)
    }
    if (doubledButGreen.length) {
      console.warn(
        `\n⚑ ${doubledButGreen.length} test(s) ran twice without failing (load, not flake).`,
      )
    }
    if (!flaky.length && !doubledButGreen.length)
      console.warn('\n✓ flake report: all single-attempt, no retries fired')
  }

  private rootSuites: TestSuite[] = []
  onBegin(_config: unknown, suite: TestSuite): void {
    this.rootSuites = [suite]
  }
}

export default FlakeReporter
