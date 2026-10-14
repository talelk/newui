import '@testing-library/jest-dom/vitest'
import { cleanup } from '@solidjs/testing-library'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom is missing the browser APIs the Zag machines touch during setup.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }

  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = Observer as unknown as typeof ResizeObserver
  }
  if (!window.IntersectionObserver) {
    window.IntersectionObserver =
      Observer as unknown as typeof IntersectionObserver
  }
}
