import tsParser from '@typescript-eslint/parser'
import solid from 'eslint-plugin-solid'

/**
 * Solid-specific lint rules, deliberately narrow.
 *
 * Biome owns formatting, general correctness and the `solid` domain it ships.
 * This runs **only** `eslint-plugin-solid`, which knows Solid's reactivity model
 * and JSX idioms that Biome does not cover: destructuring props (which kills
 * reactivity), `.map()` where `<For>` belongs, `innerHTML`, the `style` prop.
 * Two linters is a cost; the alternative is not checking these at all.
 */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/test-results/**',
      '**/playwright-report/**',
      'packages/tailwind/src/generated/**',
      'e2e/**',
      'frappe-ui-main/**',
      'zag-main/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { solid },
    rules: {
      'solid/components-return-once': 'error',
      'solid/imports': 'error',
      'solid/jsx-no-duplicate-props': 'error',
      'solid/jsx-no-script-url': 'error',
      'solid/no-destructure': 'error',
      'solid/no-innerhtml': 'error',
      'solid/no-unknown-namespaces': 'error',
      'solid/prefer-for': 'error',
      'solid/prefer-show': 'error',
      'solid/reactivity': 'error',
      'solid/style-prop': 'error',
    },
  },
]
