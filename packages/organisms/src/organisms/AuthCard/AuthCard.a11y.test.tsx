import { Button, TextInput } from '@newui/atoms'
import { render } from '@solidjs/testing-library'
import axe, { type AxeResults } from 'axe-core'
import { describe, expect, it } from 'vitest'
import { AuthCard } from './AuthCard'

const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
}

function summarize(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
}

describe('AuthCard accessibility', () => {
  it('has no axe violations for a sign-in card', async () => {
    const { container } = render(() => (
      <AuthCard
        title="Sign in"
        description="Welcome back. Enter your work account."
        footer={<a href="/sign-up">Create an account</a>}
      >
        <TextInput label="Email" type="email" />
        <Button variant="solid">Continue</Button>
      </AuthCard>
    ))
    expect(summarize(await axe.run(container, AXE_OPTIONS))).toEqual([])
  })
})
