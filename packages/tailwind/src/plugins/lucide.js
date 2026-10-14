import { createRequire } from 'node:module'
import path from 'node:path'
import plugin from 'tailwindcss/plugin'
import { iconPackPlugin } from './icon-pack.js'

// Resolve lucide-static's icons directory once. Guarded: a consumer that does
// not install lucide-static should still get a working stylesheet, just with
// no `lucide-*` utilities.
let iconsDir = null
try {
  const nodeRequire = createRequire(import.meta.url)
  iconsDir = path.join(
    path.dirname(nodeRequire.resolve('lucide-static/package.json')),
    'icons',
  )
} catch {
  iconsDir = null
}

// Lucide ships every icon at stroke-width="2"; 1.5 matches the rest of the
// design system. No defaultColor — icons inherit the parent's text color.
export default iconsDir
  ? iconPackPlugin({
      prefix: 'lucide',
      iconsDir,
      normalizeStrokeWidth: 1.5,
    })
  : plugin(() => {})
