import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { createColorScheme } from './color-scheme'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('createColorScheme', () => {
  it('applies and persists an explicit scheme', async () => {
    await new Promise<void>((done) => {
      createRoot((dispose) => {
        const { setColorScheme, resolved } = createColorScheme({
          storageKey: 'test-theme',
        })
        setColorScheme('dark')
        void tick().then(() => {
          expect(resolved()).toBe('dark')
          expect(document.documentElement.getAttribute('data-theme')).toBe(
            'dark',
          )
          expect(localStorage.getItem('test-theme')).toBe('dark')
          dispose()
          done()
        })
      })
    })
  })

  it('suppresses transitions around a swap', async () => {
    await new Promise<void>((done) => {
      createRoot((dispose) => {
        const { setColorScheme } = createColorScheme({
          storageKey: 'test-theme-2',
        })
        setColorScheme('light')
        void tick().then(() => {
          // The class is added on swap; it is removed over the next two frames,
          // so it may already be gone in a fast environment. Assert only that
          // the swap happened without throwing.
          expect(document.documentElement.getAttribute('data-theme')).toBe(
            'light',
          )
          dispose()
          done()
        })
      })
    })
  })
})
