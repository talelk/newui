/**
 * Atomic design, as the site reads it.
 *
 * The registry records an `atomic` level per entry (see `scripts/atomic.ts` for
 * the rule and the judgement calls); this module is the presentation of those
 * four levels — their names, the one question each answers, and where they
 * live. One source, so the sidebar, the indexes and the reference pages cannot
 * disagree about what an organism is called.
 */
export type AtomicLevel = 'atom' | 'molecule' | 'organism' | 'template'

export interface AtomicMeta {
  key: AtomicLevel
  /** The level's name, plural — the section title. */
  label: string
  /** One entry's name, singular — "an atom", "a molecule". */
  singular: string
  /** The question this level answers. */
  question: string
  href: string
  description: string
}

export const ATOMIC: Record<AtomicLevel, AtomicMeta> = {
  atom: {
    key: 'atom',
    label: 'Atoms',
    singular: 'atom',
    question: 'What is this single element?',
    href: '/atoms',
    description:
      'One control or mark, with nothing else inside: a button, an input, a badge, the scroll viewport itself.',
  },
  molecule: {
    key: 'molecule',
    label: 'Molecules',
    singular: 'molecule',
    question: 'What is this interaction?',
    href: '/molecules',
    description:
      'Atoms assembled into one interaction: a field, a picker, a menu, a card, a dialog shell, a chart legend.',
  },
  organism: {
    key: 'organism',
    label: 'Organisms',
    singular: 'organism',
    question: 'What is this section?',
    href: '/organisms',
    description:
      'An independent region of a page: a sidebar, a filter bar, a board, a chart widget, an editor.',
  },
  template: {
    key: 'template',
    label: 'Templates',
    singular: 'template',
    question: 'How does the page open?',
    href: '/templates',
    description:
      'The arrangement: a frame, a title block, a navigation column, and where the content scrolls.',
  },
}

/** Reading order: atoms outward. */
export const ATOMIC_ORDER: AtomicLevel[] = [
  'atom',
  'molecule',
  'organism',
  'template',
]

/** The level for a path's first segment, when it is one of the four. */
export function levelOf(segment: string): AtomicLevel | undefined {
  return ATOMIC_ORDER.find((level) => ATOMIC[level].href === `/${segment}`)
}
