import { createSignal, Show } from 'solid-js'
import { DiscussionSettings } from '../examples/DiscussionSettings'
import {
  COMMUNITIES,
  DISCUSSIONS,
  SPACES,
} from '../examples/discussion-fixtures'
import { createDiscussions } from '../examples/discussions'
import { DiscussionsDesktop } from './DiscussionsDesktop'

const firstSpaceFor = (community: string) =>
  SPACES.find((space) => space.community === community)?.name ?? ''

/**
 * Responsive discussion workspace. The same `AppShell` sidebar serves desktop
 * and mobile; the old parallel rail/sidebar and bottom-nav page are gone.
 *
 * Community and space are page-level state so the switcher, the feed and the
 * settings all read the same selection.
 */
export function Discussions() {
  const [settingsOpen, setSettingsOpen] = createSignal(false)
  const [settingsSection, setSettingsSection] = createSignal('profile')
  const openSettings = (section = 'profile') => {
    setSettingsSection(section)
    setSettingsOpen(true)
  }

  const initialCommunity = COMMUNITIES[0]?.id ?? 'design'
  const [community, setCommunity] = createSignal(initialCommunity)
  const [space, setSpace] = createSignal(firstSpaceFor(initialCommunity))
  const store = createDiscussions(DISCUSSIONS, community, space)

  /** Switching tenants is a workspace change, not a label change. */
  const chooseCommunity = (value: string) => {
    if (value === community()) return
    setCommunity(value)
    setSpace(firstSpaceFor(value))
    store.setQuery('')
    store.setSelected(undefined)
  }

  return (
    <>
      <DiscussionsDesktop
        store={store}
        community={community}
        setCommunity={chooseCommunity}
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
