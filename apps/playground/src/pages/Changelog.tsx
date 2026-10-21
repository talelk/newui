import { For, type JSX, Show } from 'solid-js'
import { PENDING, RELEASED } from '../generated/changelog'
import { LIBRARY_VERSION } from '../generated/version'
import { PageIntro } from '../shell/PageIntro'

const BUMP_TONE: Record<string, string> = {
  major: 'text-ink-red-7',
  minor: 'text-ink-blue-7',
  patch: 'text-ink-gray-6',
}

/**
 * The release history, assembled not written: released sections come from the
 * packages' CHANGELOG.md files and the pending block from `.changeset/`, both
 * via the generated `changelog.ts` — the page cannot drift from either source.
 */
export function Changelog(): JSX.Element {
  return (
    <div class="mx-auto w-full max-w-3xl px-4 py-8">
      <PageIntro
        title="Changelog"
        description={`The kit leads at @newui/atoms v${LIBRARY_VERSION}. Pending changesets are queued for the next release; each package keeps its full history.`}
      />

      <section aria-labelledby="pending-heading" class="mt-8">
        <h2 id="pending-heading" class="text-section text-ink-gray-9">
          Pending
        </h2>
        <Show
          when={PENDING.length > 0}
          fallback={
            <p class="mt-2 text-p-base text-ink-gray-7">
              Nothing queued — every changeset has shipped.
            </p>
          }
        >
          <ul class="mt-3 flex flex-col gap-3">
            <For each={PENDING}>
              {(change) => (
                <li class="rounded-card border border-outline-gray-1 bg-surface-base p-4">
                  <div class="flex flex-wrap items-baseline gap-2">
                    <span class="text-interface font-medium text-ink-gray-9">
                      {change.package}
                    </span>
                    <span
                      class={`text-caption font-medium ${BUMP_TONE[change.bump] ?? ''}`}
                    >
                      {change.bump}
                    </span>
                  </div>
                  <p class="mt-1 whitespace-pre-line text-p-sm text-ink-gray-7">
                    {change.summary}
                  </p>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </section>

      <section aria-labelledby="released-heading" class="mt-10">
        <h2 id="released-heading" class="text-section text-ink-gray-9">
          Released
        </h2>
        <div class="mt-3 flex flex-col gap-8">
          <For each={RELEASED}>
            {(pkg) => (
              <article>
                <h3 class="text-interface font-medium text-ink-gray-8">
                  {pkg.package}
                  <span class="ms-2 text-caption text-ink-gray-6">
                    v{pkg.version}
                  </span>
                </h3>
                <For each={pkg.sections}>
                  {(section) => (
                    <details class="group mt-2 rounded-card border border-outline-gray-1">
                      <summary class="cursor-pointer rounded-card px-4 py-2 text-interface text-ink-gray-8 focus-visible:focus-ring group-hover:bg-surface-gray-1">
                        {section.version}
                      </summary>
                      <div class="whitespace-pre-line border-t border-outline-gray-1 px-4 py-3 text-p-sm leading-relaxed text-ink-gray-7">
                        {section.body}
                      </div>
                    </details>
                  )}
                </For>
              </article>
            )}
          </For>
        </div>
      </section>
    </div>
  )
}
