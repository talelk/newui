import { createSignal, lazy, onCleanup, onMount, Show } from 'solid-js'
import { DISCUSSIONS } from '../examples/discussion-fixtures'
import { createDiscussions } from '../examples/discussions'

const DiscussionsDesktop = lazy(() =>
  import('./DiscussionsDesktop').then((module) => ({
    default: module.DiscussionsDesktop,
  })),
)
const DiscussionsMobile = lazy(() =>
  import('./DiscussionsMobile').then((module) => ({
    default: module.DiscussionsMobile,
  })),
)

const DiscussionSettings = lazy(() =>
  import('../examples/DiscussionSettings').then((module) => ({
    default: module.DiscussionSettings,
  })),
)

export function Discussions() {
  const [mobile, setMobile] = createSignal(
    typeof window !== 'undefined' && window.innerWidth < 640,
  )
  const [settingsLoaded, setSettingsLoaded] = createSignal(false)
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [settingsSection, setSettingsSection] = createSignal('profile')
  const openSettings = (section = 'profile') => {
    setSettingsSection(section)
    setSettingsLoaded(true)
    setSettingsOpen(true)
  }
  const [space, setSpace] = createSignal('Design System')
  const store = createDiscussions(DISCUSSIONS, space)
  onMount(() => {
    const media = matchMedia('(max-width: 639px)')
    const sync = () => setMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    onCleanup(() => media.removeEventListener('change', sync))
  })
  return (
    <main>
      <Show
        when={mobile()}
        fallback={
          <DiscussionsDesktop
            store={store}
            space={space}
            setSpace={setSpace}
            onOpenSettings={openSettings}
          />
        }
      >
        <DiscussionsMobile
          store={store}
          space={space}
          setSpace={setSpace}
          onOpenSettings={openSettings}
        />
      </Show>
      <Show when={settingsLoaded()}>
        <DiscussionSettings
          section={settingsSection()}
          open={settingsOpen()}
          onOpenChange={setSettingsOpen}
        />
      </Show>
    </main>
  )
}
