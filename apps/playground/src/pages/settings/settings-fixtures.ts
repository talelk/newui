export type MemberRole = 'Admin' | 'Member'

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: MemberRole
}

export type NotificationFrequency = 'Daily' | 'Weekly' | 'Monthly'

export interface NotificationPreferences {
  digests: boolean
  frequency: NotificationFrequency
  productUpdates: boolean
  mentions: boolean
}

export interface Profile {
  name: string
  email: string
}

export const INITIAL_PROFILE: Profile = {
  name: 'Rhea Kapoor',
  email: 'rhea@example.com',
}

export const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: 'member-priya',
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'Admin',
  },
  {
    id: 'member-sam',
    name: 'Sam Rivera',
    email: 'sam@example.com',
    role: 'Member',
  },
  {
    id: 'member-noor',
    name: 'Noor Haddad',
    email: 'noor@example.com',
    role: 'Member',
  },
]

export const INITIAL_NOTIFICATIONS: NotificationPreferences = {
  digests: true,
  frequency: 'Weekly',
  productUpdates: false,
  mentions: true,
}

export const NOTIFICATION_FREQUENCIES: NotificationFrequency[] = [
  'Daily',
  'Weekly',
  'Monthly',
]
