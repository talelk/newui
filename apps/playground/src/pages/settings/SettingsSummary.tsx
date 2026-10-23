import { Avatar, Badge, Button } from '@talelk/newui-atoms'
import { Section } from '@talelk/newui-organisms'
import { For, type JSX } from 'solid-js'
import type { NotificationPreferences } from './settings-fixtures'

export interface SettingsSummaryProps {
  name: string
  email: string
  notifications: NotificationPreferences
  memberNames: string[]
  memberCount: number
  memberSummary: string
  onEditProfile: () => void
  onEditNotifications: () => void
  onManageMembers: () => void
}

/**
 * The Settings landing: a scannable summary of what the dialog edits. The
 * dialog is the one editing surface; these cards are read-only projections of
 * the same local state, so there is no second settings form on the page.
 */
export function SettingsSummary(props: SettingsSummaryProps): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Section
          id="settings-profile-summary"
          surface="card"
          title="Profile"
          description="How teammates see you."
          actions={
            <Button
              size="sm"
              variant="outline"
              aria-label="Edit profile"
              onClick={props.onEditProfile}
            >
              Edit
            </Button>
          }
        >
          <div class="flex min-w-0 items-center gap-3">
            <Avatar size="2xl" label={props.name} />
            <div class="min-w-0">
              <p class="truncate text-base-medium text-ink-gray-9">
                {props.name}
              </p>
              <p class="truncate text-caption text-ink-gray-7">{props.email}</p>
              <Badge class="mt-2" variant="subtle" label="Owner" />
            </div>
          </div>
        </Section>

        <Section
          id="settings-notifications-summary"
          surface="card"
          title="Notifications"
          description="What reaches your inbox."
          actions={
            <Button
              size="sm"
              variant="outline"
              aria-label="Edit notifications"
              onClick={props.onEditNotifications}
            >
              Edit
            </Button>
          }
        >
          <dl class="flex flex-col gap-2 text-base">
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-ink-gray-7">Email digests</dt>
              <dd class="text-ink-gray-9">
                {props.notifications.digests
                  ? props.notifications.frequency
                  : 'Off'}
              </dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-ink-gray-7">Product updates</dt>
              <dd class="text-ink-gray-9">
                {props.notifications.productUpdates ? 'On' : 'Off'}
              </dd>
            </div>
            <div class="flex items-baseline justify-between gap-3">
              <dt class="text-ink-gray-7">Mentions</dt>
              <dd class="text-ink-gray-9">
                {props.notifications.mentions ? 'On' : 'Off'}
              </dd>
            </div>
          </dl>
        </Section>

        <Section
          id="settings-members-summary"
          surface="card"
          title="Members"
          description="Who has access to this workspace."
          actions={
            <Button
              size="sm"
              variant="outline"
              aria-label="Edit members"
              onClick={props.onManageMembers}
            >
              Edit
            </Button>
          }
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex shrink-0 items-center gap-1">
              <For each={props.memberNames.slice(0, 3)}>
                {(name) => <Avatar size="md" label={name} />}
              </For>
            </div>
            <div class="min-w-0">
              <p class="text-base-medium text-ink-gray-9">
                {props.memberCount === 1
                  ? '1 person'
                  : `${props.memberCount} people`}
              </p>
              <p class="truncate text-caption text-ink-gray-7">
                {props.memberSummary}
              </p>
            </div>
          </div>
        </Section>
      </div>

      <p class="text-caption text-ink-gray-7">
        Local demo — profile, notification and member changes stay on this page
        and reset on reload.
      </p>
    </div>
  )
}
