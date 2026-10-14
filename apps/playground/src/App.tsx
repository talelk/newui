import { createColorScheme, Toaster, UIProvider } from '@newui/ui'
import { For } from 'solid-js'
import { AppExample } from './pages/AppExample'
import { Atoms } from './pages/Atoms'
import { Feedback } from './pages/Feedback'
import { Foundations } from './pages/Foundations'
import { Gallery } from './pages/Gallery'
import { Recipes } from './pages/Recipes'

const SCHEMES = ['light', 'dark', 'system'] as const

const SECTIONS = [
  { id: 'example', label: 'Example' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'atoms', label: 'Components' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'feedback', label: 'Feedback' },
] as const

export function App() {
  const { colorScheme, setColorScheme } = createColorScheme()

  return (
    <UIProvider dir="ltr">
      <div class="min-h-screen bg-surface-base text-ink-gray-9">
        <header class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-outline-gray-1 bg-surface-base/80 px-6 py-3 backdrop-blur">
          <span class="shrink-0 text-base-medium">newui · playground</span>
          <nav aria-label="Sections" class="hidden items-center gap-1 md:flex">
            <For each={SECTIONS}>
              {(section) => (
                <a
                  href={`#${section.id}`}
                  class="rounded-3 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9"
                >
                  {section.label}
                </a>
              )}
            </For>
            <a
              href="/mobile"
              class="rounded-3 px-2 py-1 text-sm text-ink-gray-6 transition-colors hover:bg-surface-gray-2 hover:text-ink-gray-9"
            >
              Mobile
            </a>
          </nav>
          <div class="flex shrink-0 gap-1 rounded-4 bg-surface-gray-2 p-0.5">
            <For each={SCHEMES}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => setColorScheme(option)}
                  class="rounded-3 px-2.5 py-1 text-sm text-ink-gray-6 data-[active]:bg-surface-base data-[active]:text-ink-gray-9 data-[active]:shadow-sm"
                  data-active={colorScheme() === option ? '' : undefined}
                >
                  {option}
                </button>
              )}
            </For>
          </div>
        </header>
        <main class="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-8">
          <section id="example" class="scroll-mt-20">
            <AppExample />
          </section>
          <section id="foundations" class="scroll-mt-20">
            <Foundations />
          </section>
          <section id="atoms" class="scroll-mt-20">
            <Atoms />
          </section>
          <section id="gallery" class="scroll-mt-20">
            <Gallery />
          </section>
          <section id="recipes" class="scroll-mt-20">
            <Recipes />
          </section>
          <section id="feedback" class="scroll-mt-20">
            <Feedback />
          </section>
        </main>
        <Toaster />
      </div>
    </UIProvider>
  )
}
