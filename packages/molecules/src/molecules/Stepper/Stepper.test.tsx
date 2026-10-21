import { render } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

const STEPS = [
  { value: 'account', label: 'Account' },
  { value: 'payment', label: 'Payment' },
  { value: 'review', label: 'Review' },
]

describe('Stepper', () => {
  it('renders a named navigation landmark with an ordered list', () => {
    const { container } = render(() => (
      <Stepper steps={STEPS} defaultValue="payment" label="Checkout progress" />
    ))
    const nav = container.querySelector('nav[data-slot="stepper"]')
    expect(nav?.getAttribute('aria-label')).toBe('Checkout progress')
    expect(container.querySelectorAll('ol li').length).toBe(3)
  })

  it('marks the current step and completed steps', () => {
    const { container } = render(() => (
      <Stepper steps={STEPS} defaultValue="review" label="Progress" />
    ))
    const current = container.querySelector('[aria-current="step"]')
    expect(current?.getAttribute('aria-label')).toContain('3. Review')
    const states = [
      ...container.querySelectorAll('[data-slot="stepper-step"]'),
    ].map((step) => step.getAttribute('data-state'))
    expect(states).toEqual(['complete', 'complete', 'current'])
  })

  it('linear mode lets completed steps navigate, not future ones', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <Stepper
        steps={STEPS}
        defaultValue="payment"
        onValueChange={onValueChange}
        label="Progress"
      />
    ))
    const markers = [
      ...document.querySelectorAll('[data-slot="stepper-marker"]'),
    ] as HTMLButtonElement[]
    await userEvent.click(markers[0] as HTMLButtonElement)
    expect(onValueChange).toHaveBeenCalledWith('account')
    expect(markers[2]?.disabled).toBe(true)
  })

  it('free navigation opens every enabled step', () => {
    render(() => (
      <Stepper
        steps={STEPS}
        linear={false}
        defaultValue="account"
        label="Progress"
      />
    ))
    const markers = [
      ...document.querySelectorAll('[data-slot="stepper-marker"]'),
    ] as HTMLButtonElement[]
    // The current step is the status, not a destination — everything else navigates.
    const reachable = markers.filter((marker) => !marker.disabled)
    expect(reachable).toHaveLength(2)
  })

  it('a disabled step is never reachable', async () => {
    const onValueChange = vi.fn()
    render(() => (
      <Stepper
        steps={
          [
            STEPS[0],
            { value: 'payment', label: 'Payment', disabled: true },
            STEPS[2],
          ] as never
        }
        linear={false}
        defaultValue="account"
        onValueChange={onValueChange}
        label="Progress"
      />
    ))
    const markers = [
      ...document.querySelectorAll('[data-slot="stepper-marker"]'),
    ] as HTMLButtonElement[]
    await userEvent.click(markers[1] as HTMLButtonElement)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
