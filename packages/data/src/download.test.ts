import { describe, expect, it } from 'vitest'
import { csvText } from './download'

describe('download', () => {
  it('quotes every cell and doubles inner quotes', () => {
    expect(
      csvText([
        ['Name', 'Note'],
        ['Acme, Inc', 'Said "yes"'],
        ['Globex', 42],
      ]),
    ).toBe('"Name","Note"\r\n"Acme, Inc","Said ""yes"""\r\n"Globex","42"')
  })
})
