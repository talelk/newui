import { EventClient } from '@tanstack/devtools-event-client'
import { createSignal } from 'solid-js'
import type { ProjectStatus } from '../data/records'

/**
 * The starter's product event map.
 *
 * These are the events the app emits for its own runtime inspection. They are
 * typed at the source: a renamed field or a wrong payload fails `tsc`, not the
 * panel that reads it.
 */
export type StarterDevtoolsEvents = {
  'query:error': { message: string }
  'filters:status': { status: string }
  'record:open': { id: string; name: string; status: ProjectStatus }
  'record:create': {
    id: string
    name: string
    owner: string
    status: ProjectStatus
    budget: number
  }
  'record:update': { id: string; name: string; status: ProjectStatus }
  'record:delete': { id: string; name: string }
  'record:archive': { ids: string[] }
  'session:sign-in': { name: string; email: string }
  'session:sign-out': { name: string }
  'settings:save': {
    workspace: string
    timezone: string
    weeklyDigest: boolean
    mentions: boolean
  }
}

export type StarterDevtoolsEntry = {
  [Name in keyof StarterDevtoolsEvents]: {
    id: number
    name: Name
    at: number
    payload: StarterDevtoolsEvents[Name]
  }
}[keyof StarterDevtoolsEvents]

export const STARTER_DEVTOOLS_PLUGIN_ID = 'acme-starter'

const MAX_ENTRIES = 80

const [entries, setEntries] = createSignal<StarterDevtoolsEntry[]>([])
let nextId = 1
let client: EventClient<StarterDevtoolsEvents> | undefined

/**
 * The log is read by the product panel and written by the emit helper below.
 * Keeping the two together means a closed panel never loses an interaction.
 */
export const starterEventLog = entries

/** The same client the event bus sees; created lazily so production can drop it. */
function eventClient(): EventClient<StarterDevtoolsEvents> {
  client ??= new EventClient<StarterDevtoolsEvents>({
    pluginId: STARTER_DEVTOOLS_PLUGIN_ID,
  })
  return client
}

/**
 * Record a typed product event and publish it to the TanStack Devtools bus.
 *
 * The DEV guard means production dead-code eliminates the log write, the event
 * client and its bus plumbing; the product code keeps one no-op call site.
 */
export function emitStarterEvent<Name extends keyof StarterDevtoolsEvents>(
  name: Name,
  payload: StarterDevtoolsEvents[Name],
): void {
  if (!import.meta.env.DEV) return
  const entry = {
    id: nextId++,
    name,
    at: Date.now(),
    payload,
  } as StarterDevtoolsEntry
  setEntries((current) => [entry, ...current].slice(0, MAX_ENTRIES))
  eventClient().emit(name, payload)
}

export function clearStarterEvents(): void {
  setEntries([])
}
