import {
  Avatar,
  Sidebar,
  SidebarCard,
  SidebarCollapseToggle,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarRailItem,
  SidebarSearch,
  SidebarSection,
} from '@newui/ui'
import { createMemo, createSignal, For, Show } from 'solid-js'

const ITEMS = [
  { label: 'Overview', icon: 'lucide-house' },
  { label: 'Inbox', icon: 'lucide-inbox', count: 4 },
  { label: 'Reports', icon: 'lucide-chart-no-axes-column' },
]
const ARCHIVED = ['Q3 launch', 'Website redesign']

/** The frappe anatomy: an icon rail and a wide sidebar side by side. */
export default function Demo() {
  const [active, setActive] = createSignal('Inbox')
  const [railActive, setRailActive] = createSignal('Acme')
  const [query, setQuery] = createSignal('')
  const [cardVisible, setCardVisible] = createSignal(true)
  const visible = createMemo(() =>
    ITEMS.filter((item) =>
      item.label.toLowerCase().includes(query().toLowerCase()),
    ),
  )
  return (
    <div class="flex h-96 overflow-hidden rounded-5 border border-outline-gray-1">
      <SidebarRail class="border-e border-outline-gray-1">
        <div class="flex flex-col items-center gap-2">
          <SidebarRailItem
            label="Acme"
            description="12 members"
            active={railActive() === 'Acme'}
            badge={3}
            onClick={() => setRailActive('Acme')}
          >
            <span class="text-xs font-semibold">AC</span>
          </SidebarRailItem>
          <SidebarRailItem
            label="Design guild"
            active={railActive() === 'Design guild'}
            badge={1}
            badgeStyle="dot"
            onClick={() => setRailActive('Design guild')}
          >
            <span class="text-xs font-semibold">DE</span>
          </SidebarRailItem>
        </div>
        <div class="flex flex-col items-center gap-2 pt-3 mt-auto">
          <SidebarRailItem
            label="Search"
            variant="ghost"
            icon="lucide-search"
          />
          <SidebarRailItem label="Rhea Kapoor">
            <Avatar size="xs" label="Rhea Kapoor" />
          </SidebarRailItem>
        </div>
      </SidebarRail>
      <Sidebar width="15rem" ariaLabel="Demo sidebar">
        <SidebarHeader
          title="Acme workspace"
          subtitle="A clearer way to work"
        />
        <SidebarSearch
          placeholder="Search pages…"
          value={query()}
          onInput={setQuery}
        />
        <div class="flex flex-col gap-0.5 px-1">
          <For each={visible()}>
            {(item) => (
              <SidebarItem
                label={item.label}
                icon={item.icon}
                active={active() === item.label}
                onClick={() => setActive(item.label)}
                suffix={
                  item.count ? (
                    <span class="rounded-full bg-surface-gray-2 px-1.5 py-px text-caption tabular-nums text-ink-gray-7">
                      {item.count}
                    </span>
                  ) : undefined
                }
              >
                {item.label}
              </SidebarItem>
            )}
          </For>
        </div>
        <SidebarSection label="Archived" collapsible defaultCollapsed>
          <div class="flex flex-col gap-0.5 px-1">
            <For each={ARCHIVED}>
              {(label) => (
                <SidebarItem
                  label={label}
                  active={active() === label}
                  onClick={() => setActive(label)}
                >
                  {label}
                </SidebarItem>
              )}
            </For>
          </div>
        </SidebarSection>
        <SidebarLabel divider>General</SidebarLabel>
        <div class="mt-auto flex flex-col gap-2 p-2">
          <Show when={cardVisible()}>
            <SidebarCard
              theme="amber"
              title="Trial ends in 5 days"
              description="Upgrade to keep every workspace."
              dismissible
              onDismiss={() => setCardVisible(false)}
              action={{
                label: 'Upgrade',
                onClick: ({ dismiss }) => dismiss(),
              }}
            />
          </Show>
          <SidebarCollapseToggle />
        </div>
      </Sidebar>
      <div class="min-w-0 flex-1 p-4">
        <p class="text-interface text-ink-gray-7">
          {railActive()} · {active()} — collapse the sidebar (or press ⌘B) and
          the items become a labelled icon rail.
        </p>
      </div>
    </div>
  )
}
