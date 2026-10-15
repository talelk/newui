import { Button } from '@newui/ui'
import { A } from '@solidjs/router'
import { createSignal, type JSX, onCleanup, onMount, Show } from 'solid-js'
import { ThemeMenu } from '../shell/ThemeMenu'

/** Private app composition: examples share chrome while each owns its domain. */
export function ExampleFrame(props: {
  title: string
  description: string
  section: string
  actions?: JSX.Element
  sidebar?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  const [open, setOpen] = createSignal<boolean>()
  const [wide, setWide] = createSignal(false)
  onMount(() => {
    const media = matchMedia('(min-width: 1024px)')
    const sync = () => setWide(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })
  const compact = () => !wide()
  const visible = () => !!props.sidebar && (open() ?? (wide() && !compact()))
  return (
    <div
      class="min-h-screen bg-surface-gray-1 text-interface text-ink-gray-9"
      data-slot="example-workspace"
      data-layout={compact() ? 'compact' : 'desktop'}
    >
      <a href="#workspace-content" class="sr-only focus:not-sr-only">
        Skip to workspace
      </a>
      <header class="sticky top-0 z-30 flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-outline-gray-1 bg-surface-elevation-1 px-4">
        <div class="flex min-w-0 items-center gap-2">
          <Show when={props.sidebar}>
            <Button
              icon="lucide-panel-left"
              size="lg"
              variant="ghost"
              aria-label="Toggle workspace menu"
              aria-expanded={visible()}
              onClick={() => setOpen(!visible())}
            />
          </Show>
          <A
            href="/examples"
            class="flex items-center gap-2 rounded-3 font-semibold focus-visible:focus-ring"
          >
            <img src="/favicon.svg" alt="" class="size-6" />
            newui{' '}
            <span class="hidden font-normal text-ink-gray-6 sm:inline">
              / Acme workspace
            </span>
          </A>
        </div>
        <div class="flex max-w-full flex-wrap items-center gap-2">
          <ThemeMenu />
          <span
            role="img"
            aria-label="Rhea Kapoor"
            class="grid size-7 place-items-center rounded-full bg-surface-blue-2 text-caption text-ink-blue-8"
          >
            RK
          </span>
        </div>
      </header>
      <div class="flex">
        <aside
          class="w-52 shrink-0 border-e border-outline-gray-1 bg-surface-elevation-1 p-3"
          classList={{
            hidden: !visible(),
            'fixed inset-y-14 start-0 z-30 shadow-lg':
              visible() && (!wide() || compact()),
            static: wide() && !compact(),
          }}
        >
          <Show
            when={props.sidebar}
            fallback={
              <p class="text-caption text-ink-gray-6">{props.section}</p>
            }
          >
            <nav aria-label={`${props.section} navigation`}>
              {props.sidebar}
            </nav>
          </Show>
          <A
            href="/examples"
            class="mt-6 block rounded-3 px-3 py-2 text-caption text-ink-gray-6 focus-visible:focus-ring"
          >
            All examples{' '}
            <span
              aria-hidden="true"
              class="lucide-arrow-up-right inline-block size-4 align-middle"
            />
          </A>
        </aside>
        <main
          id="workspace-content"
          class="mx-auto flex min-w-0 max-w-[1440px] flex-1 flex-col gap-4 p-3 pb-24 sm:pb-8 md:p-4"
        >
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="mb-1 text-caption text-ink-gray-6">
                WORKSPACE / {props.section.toUpperCase()}
              </p>
              <h1 class="text-heading">{props.title}</h1>
              <p class="mt-2 max-w-2xl text-ink-gray-6">{props.description}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
          </div>
          {props.children}
          <footer class="flex flex-wrap justify-between gap-2 text-caption text-ink-gray-6">
            <span>Local demo data · Built with newui</span>
            <A
              href="/examples"
              class="rounded-3 text-ink-blue-link focus-visible:focus-ring"
            >
              Explore the examples{' '}
              <span
                aria-hidden="true"
                class="lucide-arrow-right inline-block size-4 align-middle"
              />
            </A>
          </footer>
        </main>
      </div>
    </div>
  )
}
