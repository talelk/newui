import type {
  Community,
  Discussion,
  DiscussionReply,
  Space,
} from './discussions'

const now = Date.now()
const ago = (minutes: number) => now - minutes * 60_000
const reply = (
  author: string,
  body: string,
  minutesAgo: number,
  unread = false,
): DiscussionReply => ({
  author,
  body,
  createdAt: ago(minutesAgo),
  unread,
})

export const COMMUNITIES: Community[] = [
  { id: 'design', name: 'Design', icon: 'lucide-shapes' },
  { id: 'engineering', name: 'Engineering', icon: 'lucide-code' },
  { id: 'marketing', name: 'Marketing', icon: 'lucide-megaphone' },
]

/**
 * Communities own their own spaces. The first space in each group is the one
 * the community switcher opens.
 */
export const SPACES: Space[] = [
  { community: 'design', name: 'Design System', icon: 'lucide-shapes' },
  { community: 'design', name: 'Website', icon: 'lucide-globe' },
  { community: 'design', name: 'Brand', icon: 'lucide-sparkles' },
  { community: 'design', name: 'Announcements', icon: 'lucide-megaphone' },
  { community: 'design', name: 'Illustrations', icon: 'lucide-pen-tool' },
  { community: 'design', name: 'Research', icon: 'lucide-flask-conical' },
  { community: 'design', name: 'Archive', icon: 'lucide-archive' },

  { community: 'engineering', name: 'Frontend', icon: 'lucide-code' },
  { community: 'engineering', name: 'Platform', icon: 'lucide-server' },
  { community: 'engineering', name: 'API', icon: 'lucide-braces' },
  {
    community: 'engineering',
    name: 'Incidents',
    icon: 'lucide-triangle-alert',
  },
  { community: 'engineering', name: 'Archive', icon: 'lucide-archive' },

  { community: 'marketing', name: 'Campaigns', icon: 'lucide-megaphone' },
  { community: 'marketing', name: 'Content', icon: 'lucide-file-text' },
  { community: 'marketing', name: 'Events', icon: 'lucide-calendar' },
  { community: 'marketing', name: 'Brand', icon: 'lucide-sparkles' },
  { community: 'marketing', name: 'Archive', icon: 'lucide-archive' },
]

/**
 * Every count the page shows is derived from this fixture: reply counts come
 * from `replies`, unread counts from `replies[].unread`, and last activity from
 * the newest of `createdAt` and its replies. Times are relative to page load.
 */
export const DISCUSSIONS: Discussion[] = [
  {
    id: 'design-review-onboarding',
    title: 'Design review: new onboarding flow',
    author: 'Evan You',
    excerpt:
      'I went through the latest prototype and left comments on the empty states…',
    body: 'I went through the latest prototype and left comments on the empty states, the first-run checklist and the hand-off between the invite step and the workspace. The flow is close; the empty states still explain the product twice.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(1440),
    replies: [
      reply(
        'Priya Nair',
        'I agree on the duplicate explanation. The checklist can carry that job once the first step is done.',
        180,
      ),
      reply(
        'Sam Rivera',
        'I dropped a shorter empty-state variant in the review file. It uses the same illustration at a smaller size.',
        95,
        true,
      ),
      reply(
        'Nadia Haddad',
        'Can we review the hand-off copy before Thursday? It is the only part that still reads like setup documentation.',
        40,
        true,
      ),
    ],
  },
  {
    id: 'icon-size-grid',
    title: 'Proposal: consolidate icon sizes to a 4px grid',
    author: 'Priya Nair',
    excerpt:
      'We currently ship icons in 7 sizes. I propose we standardize on 16 / 20 / 24…',
    body: 'We currently ship icons in 7 sizes. I propose we standardize on 16 / 20 / 24 / 32 and map every existing use to one of those. The 18px and 22px instances are the hardest to move because they sit beside text.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(2880),
    replies: [
      reply(
        'Evan You',
        'Four steps is the right simplification. I would keep the 32px exception for standalone action tiles only.',
        300,
      ),
      reply(
        'Yuki Tanaka',
        'The 22px menu glyphs are the only place where 24 looks too loud. I will test both in the command palette.',
        150,
        true,
      ),
    ],
  },
  {
    id: 'dark-mode-tokens',
    title: 'Dark mode tokens are ready for review',
    author: 'Sam Rivera',
    excerpt:
      'All semantic tokens now have dark values. The contrast checks pass except…',
    body: 'All semantic tokens now have dark values. The contrast checks pass except the disabled blue button and the muted text on elevated surfaces. I have left the two failing pairs in the review file with suggested replacements.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(4320),
    replies: [
      reply(
        'Ana Costa',
        'The disabled blue pair is a real legibility problem. Dropping it to the gray disabled recipe feels more consistent with the rest of the system.',
        480,
      ),
      reply(
        'Tom Becker',
        'I checked the elevated-surface pair against AA at 12px; it is just under. The replacement token clears it.',
        200,
        true,
      ),
      reply(
        'Leo Martins',
        'I can take the screenshot pass once the two values are settled.',
        120,
        true,
      ),
    ],
  },
  {
    id: 'q3-roadmap',
    title: 'Q3 roadmap discussion',
    author: 'Ana Costa',
    excerpt:
      'Carrying over from the planning call — here are the three themes we agreed on…',
    body: 'Carrying over from the planning call — here are the three themes we agreed on: faster setup, a calmer notification model, and a smaller default sidebar. I have written the trade-offs under each theme.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(5760),
    replies: [
      reply(
        'Maya Iyer',
        'The calmer notification model is the one with the clearest user story. I would sequence it before the sidebar work.',
        1560,
      ),
      reply(
        'Chris Doyle',
        'Faster setup depends on the invite step, which is already in the onboarding review. We should link the two.',
        1080,
      ),
    ],
  },
  {
    id: 'weekly-design-crit',
    title: 'Weekly design crit — notes and action items',
    author: 'Maya Iyer',
    excerpt:
      'Thanks everyone for joining. Summary of the feedback on the settings redesign…',
    body: 'Thanks everyone for joining. Summary of the feedback on the settings redesign: the two-pane frame works, the group labels need more contrast, and the mobile tab list should not become a second navigation problem.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(6000),
    replies: [
      reply(
        'Priya Nair',
        'I will take the contrast pass and the mobile drill-down exploration for next week.',
        1800,
      ),
    ],
  },
  {
    id: 'accessibility-audit',
    title: 'Accessibility audit results are in',
    author: 'Tom Becker',
    excerpt:
      'We failed 6 of the WCAG AA checks, mostly around focus visibility and…',
    body: 'We failed 6 of the WCAG AA checks, mostly around focus visibility and labelling custom comboboxes. The audit includes the exact selectors and a short recording for each failure.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(7200),
    replies: [
      reply(
        'Evan You',
        'The combobox names are reproducible in the settings dialog. I can add the explicit labels today.',
        600,
        true,
      ),
      reply(
        'Sam Rivera',
        'I will re-run the contrast checks after the token changes land.',
        480,
        true,
      ),
      reply(
        'Priya Nair',
        'The focus-visible failures are all in the dense table headers. I have a patch ready for review.',
        360,
        true,
      ),
    ],
  },
  {
    id: 'spacing-token-names',
    title: 'Naming convention for spacing tokens',
    author: 'Nadia Haddad',
    excerpt:
      'Are we going with t-shirt sizes or numeric steps? Both have tradeoffs for…',
    body: 'Are we going with t-shirt sizes or numeric steps? Both have tradeoffs for discovery and for the generated CSS. Numeric steps make the 4px rhythm obvious; t-shirt names make component intent easier to read.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(4800),
    replies: [
      reply(
        'Leo Martins',
        'I lean numeric. The rare semantic alias can sit on top without renaming the scale.',
        300,
      ),
      reply(
        'Maya Iyer',
        'Numeric wins for hand-off. I would still keep role names in the component recipes.',
        240,
        true,
      ),
    ],
  },
  {
    id: 'motion-guidelines',
    title: 'Motion guidelines — first draft',
    author: 'Omar Farouk',
    excerpt:
      'Durations, easing curves, and when not to animate. Would love a sanity check…',
    body: 'Durations, easing curves, and when not to animate. The first draft proposes 150–250ms for state changes, no entrance choreography for application screens, and a reduced-motion path for every transition.',
    community: 'design',
    space: 'Design System',
    createdAt: ago(3600),
    replies: [
      reply(
        'Yuki Tanaka',
        'The 150–250ms range feels right for overlays. I would explicitly ban looping attention animations.',
        180,
      ),
    ],
  },
  {
    id: 'empty-state-illustrations',
    title: 'Rethinking the empty state illustrations',
    author: 'Leo Martins',
    excerpt:
      'The current set feels dated. I sketched a lighter, more geometric direction…',
    body: 'The current set feels dated. I sketched a lighter, more geometric direction with fewer strokes and one accent shape. It scales down cleanly and does not compete with the empty-state copy.',
    community: 'design',
    space: 'Website',
    createdAt: ago(8640),
    replies: [
      reply(
        'Priya Nair',
        'The lighter direction is much better in dark mode. I would keep the accent to a single shape per illustration.',
        720,
        true,
      ),
      reply(
        'Maya Iyer',
        'The smaller size reads well in the mobile feed. I can update the docs frames once the set is final.',
        600,
      ),
    ],
  },
  {
    id: 'tooltip-max-width',
    title: 'Should tooltips have a max width?',
    author: 'Yuki Tanaka',
    excerpt:
      'Long labels wrap awkwardly right now. I think capping at 240px reads better…',
    body: 'Long labels wrap awkwardly right now. I think capping at 240px reads better and keeps the tooltip from turning into a paragraph. The trade-off is that some API descriptions will need a second line.',
    community: 'design',
    space: 'Website',
    createdAt: ago(10080),
    replies: [
      reply(
        'Evan You',
        '240px is a good default. I would let the content opt into a wider size rather than making every tooltip fluid.',
        1200,
      ),
    ],
  },
  {
    id: 'revised-color-ramp',
    title: 'Feedback wanted: revised color ramp',
    author: 'Isabel Ortiz',
    excerpt:
      'Bumped the mid-tones for better contrast. Take a look at gray-5 through 7…',
    body: 'Bumped the mid-tones for better contrast. Take a look at gray-5 through 7: the new steps hold AA on both the canvas and the elevated surface, but the ramp is slightly cooler than before.',
    community: 'design',
    space: 'Brand',
    createdAt: ago(5760),
    replies: [
      reply(
        'Sam Rivera',
        'The cooler cast is fine on the canvas. I want to check it against the amber unread badge before we lock it.',
        420,
        true,
      ),
      reply(
        'Tom Becker',
        'The contrast numbers look solid. The 7 step is the one to watch for muted captions.',
        300,
        true,
      ),
    ],
  },
  {
    id: 'logo-clear-space',
    title: 'Logo clear-space on dark surfaces',
    author: 'Priya Nair',
    excerpt:
      'The mark looks cramped at 24px on the dark canvas. I would like a little more…',
    body: 'The mark looks cramped at 24px on the dark canvas. I would like a little more clear-space around the glyph and a slightly quieter container. The light version is fine; this is a dark-surface problem.',
    community: 'design',
    space: 'Brand',
    createdAt: ago(7200),
    replies: [
      reply(
        'Nadia Haddad',
        'I can test a 2px inset on the 24px mark. It should not change the 32px lockup.',
        900,
      ),
    ],
  },

  {
    id: 'button-variant-migration',
    title: 'Migrating buttons to the new variant API',
    author: 'Chris Doyle',
    excerpt:
      'Codemod is ready. It covers ~90% of call sites; the rest need a manual pass…',
    body: 'Codemod is ready. It covers ~90% of call sites; the rest need a manual pass because they combine a solid theme with a disabled label. I have listed the remaining files in the migration branch.',
    community: 'engineering',
    space: 'Frontend',
    createdAt: ago(4320),
    replies: [
      reply(
        'Priya Nair',
        'The disabled blue buttons are the only visual change I noticed. The gray disabled recipe reads better in both themes.',
        540,
        true,
      ),
      reply(
        'Yuki Tanaka',
        'I will take the remaining table and toolbar call sites tomorrow.',
        120,
      ),
    ],
  },
  {
    id: 'flaky-date-picker',
    title: 'Flaky date picker spec on WebKit',
    author: 'Priya Nair',
    excerpt:
      'The date picker spec fails intermittently on WebKit when the month changes…',
    body: 'The date picker spec fails intermittently on WebKit when the month changes during the test. The failure is a race with the focus move, not a rendering difference. I have a reproduction in the branch.',
    community: 'engineering',
    space: 'Frontend',
    createdAt: ago(5760),
    replies: [
      reply(
        'Sam Rivera',
        'The focus move should be awaited before the assertion. I can adjust the helper if you want a second pair of eyes.',
        840,
        true,
      ),
    ],
  },
  {
    id: 'deploy-preview-timeout',
    title: 'Deploy previews are timing out',
    author: 'Sam Rivera',
    excerpt:
      'Three previews in a row timed out during install. The build cache looks…',
    body: 'Three previews in a row timed out during install. The build cache looks healthy, so I suspect the registry is the bottleneck. I have captured the timings from the last five runs.',
    community: 'engineering',
    space: 'Platform',
    createdAt: ago(2880),
    replies: [
      reply(
        'Chris Doyle',
        'The install step is waiting on a cold package. I will pin the workspace lockfile in the preview image.',
        240,
        true,
      ),
    ],
  },
  {
    id: 'job-retry-rfc',
    title: 'RFC: background job retries',
    author: 'Chris Doyle',
    excerpt:
      'The current retry policy is three attempts with no jitter. I would like to…',
    body: 'The current retry policy is three attempts with no jitter. I would like to add exponential backoff, a dead-letter queue and a visible failure state in the admin table.',
    community: 'engineering',
    space: 'Platform',
    createdAt: ago(8640),
    replies: [
      reply(
        'Sam Rivera',
        'The dead-letter queue is worth the extra surface. I would keep the admin status read-only for now.',
        1320,
      ),
    ],
  },

  {
    id: 'launch-narrative',
    title: 'Launch narrative for the new dashboard',
    author: 'Maya Iyer',
    excerpt:
      'The story is “less setup, more signal”. I drafted the opening and the three…',
    body: 'The story is “less setup, more signal”. I drafted the opening and the three proof points: a faster first chart, a calmer notification model and a workspace that stays legible on a phone.',
    community: 'marketing',
    space: 'Campaigns',
    createdAt: ago(2880),
    replies: [
      reply(
        'Isabel Ortiz',
        'The first proof point is the strongest. I would lead with the before/after chart rather than the feature list.',
        180,
        true,
      ),
      reply(
        'Omar Farouk',
        'The opening is a little long for the landing page. I can tighten it without losing the three points.',
        60,
        true,
      ),
    ],
  },
  {
    id: 'acme-case-study',
    title: 'Case study: Acme finance team',
    author: 'Isabel Ortiz',
    excerpt:
      'The interview notes are in. Their biggest win was replacing three spreadsheets…',
    body: 'The interview notes are in. Their biggest win was replacing three spreadsheets with one review queue. I have quotes cleared for the case study and a rough outline for the page.',
    community: 'marketing',
    space: 'Campaigns',
    createdAt: ago(10080),
    replies: [
      reply(
        'Maya Iyer',
        'The review queue is the story. I would cut the setup details and spend the space on the before/after workflow.',
        2160,
      ),
    ],
  },
  {
    id: 'docs-voice-tone',
    title: 'Docs voice and tone pass',
    author: 'Omar Farouk',
    excerpt:
      'I read the install and first-component pages aloud. A few sentences still…',
    body: 'I read the install and first-component pages aloud. A few sentences still sound like internal notes. I have suggested replacements that keep the copy concrete and remove the hedging.',
    community: 'marketing',
    space: 'Content',
    createdAt: ago(12000),
    replies: [
      reply(
        'Nadia Haddad',
        'The shorter install intro is much clearer. I would keep the note about what is intentionally not shipped.',
        3000,
      ),
    ],
  },
  {
    id: 'community-ama',
    title: 'Community AMA planning',
    author: 'Maya Iyer',
    excerpt:
      'I would like to run a 30-minute AMA in the last week of the month. The format…',
    body: 'I would like to run a 30-minute AMA in the last week of the month. The format would be a short roadmap update followed by questions from the community, with the transcript posted in Announcements.',
    community: 'marketing',
    space: 'Events',
    createdAt: ago(4320),
    replies: [
      reply(
        'Leo Martins',
        'The transcript is the useful artifact. I can prepare a short visual recap for the follow-up post.',
        480,
        true,
      ),
    ],
  },
]
