export type MailFolder =
  | 'Inbox'
  | 'Archive'
  | 'Sent'
  | 'Drafts'
  | 'Trash'
  | 'Snoozed'
export const MAIL_CATEGORIES = [
  'Primary',
  'Transactions',
  'Updates',
  'Promotions',
] as const
export interface MailMessage {
  id: string
  name: string
  email: string
  subject: string
  body: string
  folder: MailFolder
  category: (typeof MAIL_CATEGORIES)[number]
  unread: boolean
  starred: boolean
  muted: boolean
  label: 'Work' | 'Personal'
  /** ISO timestamp used by the list and the reading pane. */
  receivedAt: string
  replies: string[]
}

const SUBJECTS = [
  [
    'September launch checklist',
    'Sarah Tran',
    'The refreshed workspace is looking great. Can you review the launch checklist before our Thursday meeting?',
  ],
  [
    'Your September invoice is ready',
    'Acme Billing',
    'Your invoice for September is ready. The total is $480.00. Your payment method will be charged automatically.',
  ],
  [
    'A faster way to find your work',
    'Product team',
    'Search now supports saved filters and keyboard shortcuts. Open your workspace to try the new experience.',
  ],
  [
    'An invitation to our product workshop',
    'Events team',
    'Join us for a practical session on designing a clearer analytics workspace. Bring your questions and ideas.',
  ],
  [
    'Notes from our onboarding call',
    'Grace Liu',
    'Thank you for the walkthrough. The team is excited to get started. Here are the two questions we had about workspace permissions.',
  ],
  [
    'Payment received — thank you',
    'Acme Billing',
    'We received your payment of $600.00. You can find the receipt in your billing settings. No action is needed.',
  ],
  [
    'Scheduled maintenance this Sunday',
    'Operations',
    'We will upgrade the database on Sunday from 02:00 to 03:00 UTC. Your workspace will remain available in read-only mode.',
  ],
  [
    'Your early-access invitation',
    'Design partners',
    'We would love your feedback on our new reporting tools. Reply to this email to join the early-access programme.',
  ],
  [
    'Feedback on the new editor',
    'Tom Becker',
    'The new editor is a big improvement. One small request: could we add a shortcut for inserting a table?',
  ],
  [
    'Team seats updated',
    'Acme Billing',
    'Your workspace now has 12 seats. The additional seats will be prorated on your next invoice.',
  ],
  [
    'Security review complete',
    'Priya Nair',
    'We have finished the workspace security review. All permissions look correct and the audit report is attached to our project.',
  ],
  [
    'Design systems roundtable',
    'Community',
    'A few teams are meeting next week to discuss accessible design systems. We would love to hear about your experience.',
  ],
] as const

/**
 * A fixed recent run for the demo, newest first. The UI renders these relative
 * to the reader's day (time, Yesterday, weekday, date).
 */
const RECEIVED_AT = [
  '2026-10-23T09:42:00.000Z',
  '2026-10-23T08:15:00.000Z',
  '2026-10-22T17:05:00.000Z',
  '2026-10-22T11:30:00.000Z',
  '2026-10-21T15:20:00.000Z',
  '2026-10-20T09:00:00.000Z',
  '2026-10-18T13:45:00.000Z',
  '2026-10-16T10:10:00.000Z',
  '2026-10-14T16:25:00.000Z',
  '2026-10-12T08:30:00.000Z',
  '2026-10-09T14:00:00.000Z',
  '2026-10-06T12:00:00.000Z',
] as const

export const initialMail: MailMessage[] = SUBJECTS.map(
  ([subject, name, body], index) => ({
    id: `MAIL-${index + 1}`,
    name,
    email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`,
    subject,
    body: `Hi Rhea,\n\n${body}\n\nBest,\n${name}`,
    folder: 'Inbox',
    category: MAIL_CATEGORIES[index % MAIL_CATEGORIES.length] ?? 'Primary',
    unread: index % 3 !== 0,
    starred: index === 0 || index === 4,
    muted: false,
    label: index % 3 === 0 ? 'Personal' : 'Work',
    receivedAt: RECEIVED_AT[index] ?? '1970-01-01T00:00:00.000Z',
    replies: [],
  }),
)

export function filterMail(
  messages: readonly MailMessage[],
  folder: string,
  query: string,
  unread: boolean,
  category: string,
) {
  const needle = query.trim().toLowerCase()
  return messages.filter(
    (message) =>
      (folder === 'Starred'
        ? message.starred && message.folder !== 'Trash'
        : folder === 'Work' || folder === 'Personal'
          ? message.label === folder && message.folder !== 'Trash'
          : message.folder === folder) &&
      (!unread || message.unread) &&
      (category === 'All categories' || message.category === category) &&
      `${message.name} ${message.email} ${message.subject} ${message.body}`
        .toLowerCase()
        .includes(needle),
  )
}

export function patchMail(
  messages: readonly MailMessage[],
  ids: readonly string[],
  patch: Partial<MailMessage>,
): MailMessage[] {
  const selected = new Set(ids)
  return messages.map((message) =>
    selected.has(message.id) ? { ...message, ...patch } : message,
  )
}
