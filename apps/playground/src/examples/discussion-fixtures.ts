import type { Discussion } from './discussions'
export const DISCUSSIONS: Discussion[] = [
  {
    title: 'Design review: new onboarding flow',
    author: 'Evan You',
    excerpt:
      'I went through the latest prototype and left comments on the empty states…',
    comments: 14,
    lastActivity: '2h',
    unread: 3,
  },
  {
    title: 'Proposal: consolidate icon sizes to a 4px grid',
    author: 'Priya Nair',
    excerpt:
      'We currently ship icons in 7 sizes. I propose we standardize on 16 / 20 / 24…',
    comments: 32,
    lastActivity: '5h',
    unread: 1,
  },
  {
    title: 'Dark mode tokens are ready for review',
    author: 'Sam Rivera',
    excerpt:
      'All semantic tokens now have dark values. The contrast checks pass except…',
    comments: 21,
    lastActivity: '1d',
    unread: 5,
  },
  {
    title: 'Q3 roadmap discussion',
    author: 'Ana Costa',
    excerpt:
      'Carrying over from the planning call — here are the three themes we agreed on…',
    comments: 8,
    lastActivity: '2d',
    unread: 0,
  },
  {
    title: 'Weekly design crit — notes and action items',
    author: 'Maya Iyer',
    excerpt:
      'Thanks everyone for joining. Summary of the feedback on the settings redesign…',
    comments: 5,
    lastActivity: '3d',
    unread: 0,
  },
  {
    title: 'Rethinking the empty state illustrations',
    author: 'Leo Martins',
    excerpt:
      'The current set feels dated. I sketched a lighter, more geometric direction…',
    comments: 17,
    lastActivity: '4h',
    unread: 2,
  },
  {
    title: 'Naming convention for spacing tokens',
    author: 'Nadia Haddad',
    excerpt:
      'Are we going with t-shirt sizes or numeric steps? Both have tradeoffs for…',
    comments: 26,
    lastActivity: '6h',
    unread: 4,
  },
  {
    title: 'Accessibility audit results are in',
    author: 'Tom Becker',
    excerpt:
      'We failed 6 of the WCAG AA checks, mostly around focus visibility and…',
    comments: 41,
    lastActivity: '8h',
    unread: 7,
  },
  {
    title: 'Should tooltips have a max width?',
    author: 'Yuki Tanaka',
    excerpt:
      'Long labels wrap awkwardly right now. I think capping at 240px reads better…',
    comments: 9,
    lastActivity: '10h',
    unread: 0,
  },
  {
    title: 'Migrating buttons to the new variant API',
    author: 'Chris Doyle',
    excerpt:
      'Codemod is ready. It covers ~90% of call sites; the rest need a manual pass…',
    comments: 18,
    lastActivity: '12h',
    unread: 1,
  },
  {
    title: 'Feedback wanted: revised color ramp',
    author: 'Isabel Ortiz',
    excerpt:
      'Bumped the mid-tones for better contrast. Take a look at gray-5 through 7…',
    comments: 23,
    lastActivity: '1d',
    unread: 0,
  },
  {
    title: 'Motion guidelines — first draft',
    author: 'Omar Farouk',
    excerpt:
      'Durations, easing curves, and when not to animate. Would love a sanity check…',
    comments: 12,
    lastActivity: '1d',
    unread: 3,
  },
]
