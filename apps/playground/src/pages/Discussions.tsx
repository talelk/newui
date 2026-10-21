import { createSignal, Show } from 'solid-js'
import { DiscussionSettings } from '../examples/DiscussionSettings'
import { DISCUSSIONS } from '../examples/discussion-fixtures'
import { createDiscussions } from '../examples/discussions'
import { DiscussionsDesktop } from './DiscussionsDesktop'

/**
 * Responsive discussion workspace. The same `AppShell` sidebar serves desktop
 * and mobile; the old parallel rail/sidebar and bottom-nav page are gone.
 */
export function Discussions() {
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [settingsSection, setSettingsSection] = createSignal('profile')
  const openSettings = (section = 'profile') => {
    setSettingsSection(section)
    setSettingsOpen(true)
  }
  const [space, setSpace] = createSignal('Design System')
  const store = createDiscussions(DISCUSSIONS, space)

  return (
    <>
      <DiscussionsDesktop
        store={store}
        space={space}
        setSpace={setSpace}
        onOpenSettings={openSettings}
      />
      <Show when={settingsOpen()}>
        <DiscussionSettings
          section={settingsSection()}
          open={settingsOpen()}
          onOpenChange={setSettingsOpen}
        />
      </Show>
    </>
  )
}
