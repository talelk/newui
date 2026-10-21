# Colour scales shifted for WCAG AA

**Status**: accepted

## Context

An earlier set of colour recipes predates a systematic contrast pass: `Button`
`blue-solid` used `surface-blue-6`, `Badge` subtle text used `ink-blue-7`, etc.
Against the WCAG AA threshold (4.5:1 for text, 3:1 for UI), several of those
pairings fail.

## Decision

Shift the recipes so every foreground/background pairing meets **WCAG AA**, and
assert it in `packages/tailwind/src/contrast.test.ts` (both themes). The shifts:

- coloured solid fills: `surface-<theme>-8` (amber `-9`),
- coloured subtle/outline/ghost text: `ink-<theme>-8`,
- muted text on base: `ink-gray-6`.

## Rationale

A pairing that fails is a legibility bug, not a taste call. The contrast test is
the contract; a new pairing without a passing ratio fails CI.

## Consequences

- The rendered colours intentionally differ from the earlier recipes.
- `text-ink-base` stands in for `text-white` on solid fills.
- Reversing a shift means adding a passing contrast pair, not just editing a
  class.
