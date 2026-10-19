import { describe, expect, it } from 'vitest'
import {
  markdownHeadings,
  parseMarkdown,
  slugifyHeading,
  withoutPropsSections,
} from './markdown'

describe('markdown headings (Slice E)', () => {
  it('slugifies heading text and strips inline markers', () => {
    expect(slugifyHeading('Behavior **notes**')).toBe('behavior-notes')
    expect(slugifyHeading('The `open` prop')).toBe('the-open-prop')
    expect(slugifyHeading('Props & slots!')).toBe('props-slots')
  })

  it('lists headings in document order, dropping the page title', () => {
    const headings = markdownHeadings(
      '# Button\n\n## Props\n\nText.\n\n### Sizes\n\n## Behavior\n',
    )
    expect(headings).toEqual([
      { id: 'props', label: 'Props', level: 2 },
      { id: 'sizes', label: 'Sizes', level: 3 },
      { id: 'behavior', label: 'Behavior', level: 2 },
    ])
  })

  it('drops Props sections for reference rendering, keeping the rest', () => {
    const spec =
      '# Button\n\nIntro.\n\n## Props\n\n| prop |\n\n### Sizes\n\nNested.\n\n## Behavior\n\nActs.\n'
    const stripped = withoutPropsSections(spec)
    expect(stripped).not.toContain('## Props')
    expect(stripped).not.toContain('Nested.')
    expect(stripped).toContain('## Behavior')
    expect(markdownHeadings(stripped).map((h) => h.id)).toEqual(['behavior'])
  })

  it('keeps a Props heading inside a code fence', () => {
    const spec = '## Usage\n\n```md\n## Props\n```\n\n## Behavior\n'
    expect(withoutPropsSections(spec)).toContain('## Props')
  })

  it('deduplicates repeated slugs so every anchor is unique', () => {
    const headings = markdownHeadings('## Notes\n\n## Notes\n\n## Notes\n')
    expect(headings.map((heading) => heading.id)).toEqual([
      'notes',
      'notes-2',
      'notes-3',
    ])
  })
})

describe('markdown lists', () => {
  it('joins a wrapped list item instead of splitting it into paragraphs', () => {
    const blocks = parseMarkdown(
      '- **One `h1`.** The title is the page title; the bar is a `span`\n  (`titleAs`), because two headings is one too many.\n- Second item.\n',
    )
    expect(blocks).toEqual([
      {
        kind: 'list',
        ordered: false,
        items: [
          '**One `h1`.** The title is the page title; the bar is a `span` (`titleAs`), because two headings is one too many.',
          'Second item.',
        ],
      },
    ])
  })

  it('stops the list at a blank line or an unindented paragraph', () => {
    const blocks = parseMarkdown('- one\n\nafter\n')
    expect(blocks).toEqual([
      { kind: 'list', ordered: false, items: ['one'] },
      { kind: 'paragraph', text: 'after' },
    ])
  })

  it('keeps ordered items separate from unordered ones', () => {
    const blocks = parseMarkdown('1. first\n2. second\n')
    expect(blocks).toEqual([
      { kind: 'list', ordered: true, items: ['first', 'second'] },
    ])
  })
})
