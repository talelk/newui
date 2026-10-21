/**
 * Source globs that emit Tailwind classes in newui. A consuming app spreads
 * these into its own `@source` list (Tailwind v4 scans sources declared in
 * CSS, not a JS config):
 *
 *   @source '@talelk/newui-tailwind/source';
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
)

function glob(pattern: string) {
  return path.join(packageRoot, pattern).split(path.sep).join('/')
}

export const source = [
  glob('ui/src/**/*.{ts,tsx}'),
  glob('icons/src/**/*.{ts,tsx}'),
]
