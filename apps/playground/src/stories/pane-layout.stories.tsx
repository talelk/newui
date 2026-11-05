import { Badge } from '@talelk/newui-atoms'
import { PaneLayout } from '@talelk/newui-templates'
import { createSignal, For, type JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DemoFrame } from './demo-frame'

const MESSAGES = [
  {
    from: 'Priya Nair',
    subject: 'September launch checklist',
    preview: 'Six items left before we can cut the release.',
    unread: true,
  },
  {
    from: 'Ana Costa',
    subject: 'Renewal terms for Globex',
    preview: 'They want the annual figure split across two entities.',
  },
  {
    from: 'Sam Rivera',
    subject: 'Support rotation next week',
    preview: 'Two people are out; can you take Thursday?',
  },
]

const FALLBACK = {
  from: '',
  subject: 'No conversation selected',
  preview: '',
  unread: false,
}

function Example(props: {
  compactEnd?: boolean
  collapsible?: 'start' | 'end' | 'both'
  defaultCollapsed?: 'none' | 'start' | 'end'
}): JSX.Element {
  const [selected, setSelected] = createSignal(0)
  const message = () => MESSAGES[selected()] ?? FALLBACK

  return (
    <DemoFrame>
      <div class="h-[26rem] overflow-hidden rounded-card border border-outline-gray-1 bg-surface-elevation-1">
        <PaneLayout
          defaultSize={40}
          compactAt="sm"
          active={props.compactEnd ? 'end' : 'start'}
          collapsible={props.collapsible}
          defaultCollapsed={props.defaultCollapsed}
          start={
            <ul aria-label="Conversations" class="h-full overflow-y-auto">
              <For each={MESSAGES}>
                {(item, index) => (
                  <li>
                    <button
                      type="button"
                      class="flex w-full flex-col gap-1 border-b border-outline-gray-1 p-3 text-start hover:bg-surface-gray-2 focus-visible:focus-ring aria-[current=true]:bg-surface-blue-1"
                      aria-current={selected() === index() ? 'true' : undefined}
                      onClick={() => setSelected(index())}
                    >
                      <span class="flex items-center justify-between gap-2">
                        <span class="truncate font-medium">{item.from}</span>
                        <span class="text-caption text-ink-gray-7">09:24</span>
                      </span>
                      <span class="truncate">{item.subject}</span>
                      <span class="line-clamp-2 text-caption text-ink-gray-7">
                        {item.preview}
                      </span>
                    </button>
                  </li>
                )}
              </For>
            </ul>
          }
          end={
            <div class="flex h-full flex-col gap-3 overflow-y-auto p-4">
              <div class="flex items-center gap-2">
                <h2 class="text-section">{message().subject}</h2>
                <Badge size="sm" theme="gray">
                  Inbox
                </Badge>
              </div>
              <p class="text-caption text-ink-gray-7">
                {message().from} · to me
              </p>
              <p class="text-base text-ink-gray-8">{message().preview}</p>
              <p class="text-base text-ink-gray-7">
                Drag the divider between the panes, or focus it and use the
                arrow keys. Double-click it to go back to the default split;
                with the panes collapsible, Enter folds the nearer pane away.
              </p>
            </div>
          }
        />
      </div>
    </DemoFrame>
  )
}

/** The demo the stories render, and the site's inline embed. */
export function Demo(): JSX.Element {
  return <Example />
}

const meta = {
  title: 'Templates/PaneLayout',
  component: Demo,
  excludeStories: ['Demo'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** A list beside a record, with the divider the reader drags. */
export const Default: Story = {}

/** Compact: the record is the active pane, so a narrow viewport shows it alone. */
export const RecordOpen: Story = {
  render: () => <Example compactEnd />,
}

/** The start pane folded away — Enter on the divider brings it back. */
export const Collapsed: Story = {
  render: () => (
    <Example collapsible="start" defaultCollapsed="start" compactEnd />
  ),
}

/**
 * Three panes by composition: a PaneLayout inside the other's `end`, each with
 * its own separator. This is the master-detail workspace, and the composition
 * is the API.
 */
function ThreePane(): JSX.Element {
  const BOARDS = ['Inbox', 'Engineering', 'Support']
  const RECORDS = [
    'September launch checklist',
    'Renewal terms for Globex',
    'Support rotation next week',
  ]
  const [board, setBoard] = createSignal(0)

  return (
    <DemoFrame>
      <div class="h-[26rem] overflow-hidden rounded-card border border-outline-gray-1 bg-surface-elevation-1">
        <PaneLayout
          defaultSize={22}
          minStartSize={14}
          maxStartSize={40}
          compactAt="md"
          collapsible="start"
          start={
            <nav
              aria-label="Boards"
              class="flex h-full flex-col border-e border-outline-gray-1"
            >
              <For each={BOARDS}>
                {(name, index) => (
                  <button
                    type="button"
                    class="border-b border-outline-gray-1 p-3 text-start hover:bg-surface-gray-2 focus-visible:focus-ring aria-[current=true]:bg-surface-blue-1"
                    aria-current={board() === index() ? 'true' : undefined}
                    onClick={() => setBoard(index())}
                  >
                    {name}
                  </button>
                )}
              </For>
            </nav>
          }
          end={
            <PaneLayout
              class="h-full"
              defaultSize={40}
              compactAt="sm"
              start={
                <ul aria-label="Records" class="h-full overflow-y-auto">
                  <For each={RECORDS}>
                    {(subject) => (
                      <li>
                        <button
                          type="button"
                          class="w-full truncate border-b border-outline-gray-1 p-3 text-start hover:bg-surface-gray-2 focus-visible:focus-ring"
                        >
                          {subject}
                        </button>
                      </li>
                    )}
                  </For>
                </ul>
              }
              end={
                <div class="flex h-full flex-col gap-3 overflow-y-auto p-4">
                  <h2 class="text-section">{RECORDS[board()]}</h2>
                  <p class="text-caption text-ink-gray-7">
                    {BOARDS[board()]} · updated today
                  </p>
                  <p class="text-base text-ink-gray-8">
                    Two separators, three panes: this is one PaneLayout inside
                    the other's end — the workspace is the composition, not a
                    new template.
                  </p>
                </div>
              }
            />
          }
        />
      </div>
    </DemoFrame>
  )
}

/** A board rail, a record list and a detail — three panes, two separators. */
export const ThreePaneWorkspace: Story = {
  render: () => <ThreePane />,
}
