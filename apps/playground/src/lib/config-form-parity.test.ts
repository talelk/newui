import type { FieldConfig } from '@talelk/newui-data/form'
import type { ConfigFormField } from '@talelk/newui-organisms'
import { describe, expect, it } from 'vitest'

/**
 * `ConfigFormField` (organisms) mirrors `FieldConfig` (data): visual packages
 * may not import the data layer, yet one field-map object is passed to both
 * `createAppForm` and `ConfigForm`. This file is the one place that sees both
 * packages, so it pins the mirror — `pnpm typecheck` fails the moment either
 * side gains, drops or retypes a key.
 */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

type Row = { kind: string; url: string }
type Values = { mode: string; items: Row[] }

const topLevel: Same<FieldConfig<Values>, ConfigFormField<Values>> = true
const rowField: Same<
  FieldConfig<Values, Row>,
  ConfigFormField<Values, Row>
> = true
const keys: Same<keyof FieldConfig<Values>, keyof ConfigFormField<Values>> =
  true

describe('config-form field-map parity', () => {
  it('keeps FieldConfig and ConfigFormField structurally identical', () => {
    expect([topLevel, rowField, keys]).toEqual([true, true, true])
  })
})
