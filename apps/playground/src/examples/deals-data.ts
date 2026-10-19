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
  due: string
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
export const initialDeals: Deal[] = ORGANIZATIONS.map(
  (organization, index) => ({
    id: `DEAL-${index + 1}`,
    organization,
    amount:
      [
        45000, 110000, 32000, 76000, 28500, 120000, 88000, 54000, 39000, 205000,
        64000, 175000, 240000, 96000, 132000,
      ][index] ?? 45000,
    owner: OWNERS[index % 4] ?? (OWNERS[0] as string),
    stage:
      index < 5
        ? 'Qualification'
        : index < 9
          ? 'Negotiation'
          : index < 12
            ? 'Ready to close'
            : 'Won',
    source:
      ['Inbound', 'Referral', 'Outbound', 'Partner'][index % 4] ?? 'Inbound',
    due: `2026-10-${String(index + 4).padStart(2, '0')}`,
  }),
)

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
