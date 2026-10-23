export const STATUSES = ['Open', 'Replied', 'Resolved', 'Paused'] as const
export type Status = (typeof STATUSES)[number]
export const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low']
export const AGENTS = [
  'Unassigned',
  'Priya Nair',
  'Rhea Kapoor',
  'Sam Rivera',
  'Ana Costa',
]
export interface Ticket {
  id: string
  subject: string
  customer: string
  status: Status
  priority: string
  agent: string
  response: string
  resolution: string
  messages: string[]
}
const SUBJECTS = [
  'Cannot connect custom domain',
  'Invoice shows wrong billing address',
  'Webhook deliveries fail intermittently',
  'Need help importing customer records',
  'Request to add workspace seats',
  'Dashboard stopped refreshing',
  'Unable to reset password',
  'Question about API rate limits',
]
/**
 * Priority is independent of the four-state status cycle and the five-slot
 * agent/SLA cycle. A 7-item pattern against 4 and 5 breaks the perfect
 * Open=Urgent=Breached=Unassigned correlation the old fixture had, so the
 * queue demonstrates real triage.
 */
const PRIORITY_PATTERN = [
  'Urgent',
  'High',
  'Medium',
  'Low',
  'High',
  'Medium',
  'Low',
] as const
export const INITIAL: Ticket[] = Array.from({ length: 32 }, (_, index) => ({
  id: `TKT-${1024 - index}`,
  subject: SUBJECTS[index % 8] ?? 'Support request',
  customer:
    ['Acme Corp', 'Globex', 'Northloop', 'Brightwave'][index % 4] ??
    'Acme Corp',
  status: STATUSES[index % 4] ?? 'Open',
  priority: PRIORITY_PATTERN[index % PRIORITY_PATTERN.length] ?? 'Medium',
  agent: AGENTS[index % 5] ?? 'Unassigned',
  response:
    index % 5 === 0
      ? 'Breached · 18m'
      : index % 4 === 2
        ? 'Met · 6m'
        : 'Due in 8m',
  resolution: index % 4 === 2 ? 'Met · 2h' : 'Due in 3h',
  messages: [
    `We need some help with ${SUBJECTS[index % 8]?.toLowerCase()}. Could your team take a look?`,
  ],
}))
