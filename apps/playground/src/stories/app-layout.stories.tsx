import { AppLayout } from '@newui/layouts'
import { Button, SidebarRail, SidebarRailItem } from '@newui/ui'
import { For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

const NAV = ['Notifications', 'Leads', 'Deals', 'Contacts', 'Organizations']

function Example(props: { sidebar?: boolean }): JSX.Element {
  return (
    <DemoFrame>
      <AppLayout
        eyebrow="Workspace / Deals"
        title="Build a healthier pipeline"
        description="Every opportunity, a clear next step. Move from first conversation to a confident close."
        actions={
          <Button variant="solid" theme="blue" iconLeft="lucide-plus">
            New deal
          </Button>
        }
        navLabel="Deals navigation"
        rail={
          <SidebarRail>
            <SidebarRailItem label="Home" icon="lucide-house" route="/" />
            <SidebarRailItem
              label="Deals"
              icon="lucide-handshake"
              route="/deals"
              active
            />
            <SidebarRailItem label="Mail" icon="lucide-mail" route="/mail" />
          </SidebarRail>
        }
        brand={
          <span class="flex items-center gap-2 font-semibold">
            <img src="/favicon.svg" alt="" class="size-6" />
            newui
            <span class="hidden font-normal text-ink-gray-6 sm:inline">
              / Acme workspace
            </span>
          </span>
        }
        headerActions={
          <span class="grid size-7 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8">
            RK
          </span>
        }
        sidebar={
          props.sidebar === false ? undefined : (
            <div class="flex flex-col gap-0.5">
              <For each={NAV}>
                {(entry, index) => (
                  <button
                    type="button"
                    aria-current={index() === 2 ? 'page' : undefined}
                    class="flex h-8 items-center gap-2 rounded-3 px-2 text-start text-ink-gray-6 hover:bg-surface-gray-2 aria-[current=page]:bg-surface-blue-2 aria-[current=page]:text-ink-blue-8"
                  >
                    <span class="lucide-handshake size-4" aria-hidden="true" />
                    {entry}
                  </button>
                )}
              </For>
            </div>
          )
        }
        sidebarFooter={
          <a
            href="/examples"
            class="block rounded-3 px-2 py-1 text-caption text-ink-gray-6"
          >
            All examples ↗
          </a>
        }
        footer={
          <footer class="flex justify-between gap-2 text-caption text-ink-gray-6">
            <span>Local demo data · Built with newui</span>
            <span>Explore the examples →</span>
          </footer>
        }
      >
        <div class="grid gap-3 sm:grid-cols-3">
          <For each={['Pipeline value', 'Open opportunities', 'Closed won']}>
            {(label) => (
              <div class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-4">
                <span class="text-sm text-ink-gray-6">{label}</span>
                <p class="text-2xl-semibold text-ink-gray-9">1,036,500</p>
              </div>
            )}
          </For>
        </div>
      </AppLayout>
    </DemoFrame>
  )
}

/** The demo the stories render, and the site's inline embed. */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Layouts/AppLayout',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The frame with a navigation column, the way an application screen opens. */
export const Default: Story = {}

/** Without a sidebar: no column, no drawer, no menu button. */
export const WithoutNavigation: Story = {
  render: () => <Example sidebar={false} />,
}
