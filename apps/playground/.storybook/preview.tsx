import {
  createJSXDecorator,
  type Decorator,
  type Preview,
} from 'storybook-solidjs-vite'
import '../src/index.css'

/**
 * One frame for every story: a `<main>` owns the viewport so the harness and
 * the docs embed see a stable mount point, and the colour scheme and text
 * direction follow the `theme`/`dir` globals (toolbar or
 * `&globals=theme:dark,dir:rtl` in the URL).
 */
const withFrame: Decorator = createJSXDecorator((story, context) => {
  const theme = context.globals['theme'] === 'dark' ? 'dark' : 'light'
  const dir = context.globals['dir'] === 'rtl' ? 'rtl' : 'ltr'
  document.documentElement.dataset['theme'] = theme
  document.documentElement.style.colorScheme = theme
  document.documentElement.dir = dir
  return (
    <main
      aria-label="Story"
      class="min-h-screen bg-surface-base p-8 text-ink-gray-9"
    >
      {/* The frame anchor: a portal-only story (an open dialog) still mounts
          a stable child, so the sweeps have a deterministic mount point. */}
      <div data-story-frame>{story()}</div>
    </main>
  )
})

const preview: Preview = {
  decorators: [withFrame],
  parameters: {
    layout: 'fullscreen',
    // The addon's automatic axe run races the harness's own (`AxeBuilder`),
    // which is the one with a pass/fail contract (`e2e/a11y.spec.ts`, every
    // story). The addon stays for manual review in the panel.
    a11y: { test: 'off' },
  },
  globalTypes: {
    theme: {
      description: 'Colour scheme',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Text direction',
      toolbar: {
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    dir: 'ltr',
  },
}

export default preview
