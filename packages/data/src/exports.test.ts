/**
 * The logic layer's public surface, asserted by name and by entry point.
 *
 * The data package has four entries (`.`, `/query`, `/form`, `/resource`),
 * which is exactly
 * the shape an accidental `export *` or a stray
 * re-export slips into. An entry's cost is part of its contract — 0.77 kB for
 * the helpers, 15.5 for the query — so a new name on an entry is a decision, not
 * a detail.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import * as form from './form'
import * as root from './index'
import * as query from './query'
import * as resource from './resource'

const ENTRIES = {
  '.': root,
  './query': query,
  './form': form,
  './resource': resource,
} as const

const SURFACE: Record<keyof typeof ENTRIES, string[]> = {
  // Formatting, selection, undo, downloads — and nothing that renders.
  '.': [
    'bytes',
    'count',
    'createUndo',
    'csvText',
    'downloadBlob',
    'downloadCsv',
    'downloadText',
    'first',
    'isEmail',
    'optionsOf',
    'usd',
    'usdK',
  ],
  './query': [
    'DataProvider',
    'createCollection',
    'createDataClient',
    'createListQuery',
  ],
  './form': ['Form', 'createAppForm', 'fieldError'],
  './resource': [
    'RequestError',
    'createDocumentResource',
    'createIdbStore',
    'createListResource',
    'createLocalStore',
    'createRealtime',
    'createResource',
    'getConfig',
    'isAbortError',
    'normalizeError',
    'request',
    'resetConfig',
    'setConfig',
    'useCall',
    'useDoc',
    'useDoctype',
    'useList',
    'useNewDoc',
  ],
}

const manifest = JSON.parse(
  readFileSync(path.join(process.cwd(), 'packages/data/package.json'), 'utf8'),
) as { exports: Record<string, unknown> }

describe('@newui/data', () => {
  it('publishes exactly the entries this test pins', () => {
    expect(Object.keys(manifest.exports).sort()).toEqual(
      Object.keys(ENTRIES).sort(),
    )
  })

  for (const [entry, module] of Object.entries(ENTRIES)) {
    it(`${entry} exports exactly its surface`, () => {
      expect(Object.keys(module).sort()).toEqual(
        SURFACE[entry as keyof typeof ENTRIES],
      )
    })
  }

  it('keeps the root entry headless', () => {
    // The root is the only entry with no component, no query client and no
    // validator; every value it exports is a function over plain data.
    for (const value of Object.values(root)) {
      expect(typeof value).toBe('function')
    }
  })

  it('keeps the Frappe resource client off the root', () => {
    // The DocType fetching layer is app-specific cost (fetch + IndexedDB +
    // realtime multiplexer); it must stay behind its earned subpath.
    for (const name of ['useDoc', 'useDoctype', 'frappeRequest', 'request']) {
      expect(name in root).toBe(false)
    }
  })
})
