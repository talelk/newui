/* @refresh reload */

import { render } from 'solid-js/web'
import './index.css'
import { AppRoutes } from './routes'

const root = document.getElementById('root')
if (!root) throw new Error('playground: #root not found')
const mount: HTMLElement = root

/**
 * Mount the router.
 *
 * There is no per-path branching here any more: `/spec`, `/play`, the mobile
 * recipe and the site are all routes in `routes.tsx`, each lazily imported, so
 * the bundler — not this file — decides what a given URL downloads. The file's
 * one remaining job is to fail loudly if the HTML has no mount point.
 */
render(() => <AppRoutes />, mount)
