export const STAGES = [
  'Qualification',
  'Negotiation',
  'Ready to close',
  'Won',
] as const
export type Stage = (typeof STAGES)[number]
export interface Deal {
  id: string
  organization: string
  amount: number
  owner: string
  stage: Stage
  source: string
  /** Expected close date while the deal is open. */
  due: string
  /** The date the deal was won. Kept apart so a Won card never claims a future close. */
  closed?: string
}
export const OWNERS = ['Priya Nair', 'Ana Costa', 'Sam Rivera', 'Rhea Kapoor']
const ORGANIZATIONS = [
  'Globex',
  'Stark Industries',
  'Wayne Corp',
  'Cyberdyne',
  'Vandelay',
  'Acme Corp',
  'Umbrella Labs',
  'Wonka Industries',
  'Duff Co',
  'Hooli',
  'Pied Piper',
  'Massive Dynamic',
  'Initech',
  'Soylent Corp',
  'Tyrell Corp',
]
const AMOUNTS = [
  45000, 110000, 32000, 76000, 28500, 120000, 88000, 54000, 39000, 205000,
  64000, 175000, 240000, 96000, 132000,
]
const DUE_OFFSETS = [-4, -1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, -30, -24, -18]
const DEMO_OFFSET = 14

/**
 * A local `YYYY-MM-DD` date, offset from today.
 *
 * The fixture is relative to the day the demo is opened: a static October 2026
 * pipeline reads as "everything is overdue" a week later. Two open deals stay
 * deliberately overdue so the board's overdue treatment is visible; the rest
 * sit in the next few weeks.
 */
export function isoDay(offset: number, from = new Date()): string {
  const date = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + offset,
    12,
  )
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** The create dialog's default: two weeks out, never in the past. */
export function defaultCloseDate(): string {
  return isoDay(DEMO_OFFSET)
}

const today = new Date()

export const initialDeals: Deal[] = ORGANIZATIONS.map((organization, index) => {
  const stage: Stage =
    index < 5
      ? 'Qualification'
      : index < 9
        ? 'Negotiation'
        : index < 12
          ? 'Ready to close'
          : 'Won'
  const due = isoDay(DUE_OFFSETS[index] ?? DEMO_OFFSET, today)
  return {
    id: `DEAL-${index + 1}`,
    organization,
    amount: AMOUNTS[index] ?? 45000,
    owner: OWNERS[index % 4] ?? (OWNERS[0] as string),
    stage,
    source:
      ['Inbound', 'Referral', 'Outbound', 'Partner'][index % 4] ?? 'Inbound',
    due,
    ...(stage === 'Won' ? { closed: due } : {}),
  }
})

/** Reorder a single opportunity without mutating the previous undo snapshot. */
export function placeDeal(
  rows: Deal[],
  id: string,
  stage: Stage,
  before?: string,
): Deal[] {
  const record = rows.find((row) => row.id === id)
  if (!record || before === id) return rows
  const remaining = rows.filter((row) => row.id !== id)
  const index = before
    ? remaining.findIndex((row) => row.id === before && row.stage === stage)
    : -1
  remaining.splice(index < 0 ? remaining.length : index, 0, {
    ...record,
    stage,
  })
  return remaining
}
