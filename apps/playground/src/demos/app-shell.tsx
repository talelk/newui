import { AppShell, PageBody, PageHeader } from '@newui/ui'
export default function Demo() {
  return (
    <div class="h-72 overflow-hidden rounded-5 border border-outline-gray-1">
      <AppShell
        sidebar={
          <aside class="hidden w-36 border-e border-outline-gray-1 bg-surface-elevation-1 p-4 text-caption sm:block">
            Acme workspace
          </aside>
        }
      >
        <PageHeader>
          <h3 class="text-section">Overview</h3>
        </PageHeader>
        <PageBody>
          <p class="text-interface text-ink-gray-6">
            A structured frame with local content scrolling.
          </p>
        </PageBody>
      </AppShell>
    </div>
  )
}
