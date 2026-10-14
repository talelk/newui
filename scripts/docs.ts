/**
 * Static docs generator.
 *
 * No framework, no dependency: it renders the per-component contracts in
 * `spec/*.md` and the generated `packages/ui/api.json` prop tables into a
 * self-contained site under `docs/`. Run with `pnpm docs`.
 *
 * The Markdown subset is deliberately small — headings, fenced code, tables,
 * lists, inline code/bold/links — which is exactly what the specs use.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const specDir = path.join(root, 'spec')
const apiFile = path.join(root, 'packages/ui/api.json')
const outDir = path.join(root, 'docs')

interface ApiMember {
  name: string
  type: string
  optional: boolean
  description?: string
}
type ApiTable = Record<string, Record<string, ApiMember[]>>

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(value: string): string {
  return esc(value.replace(/\\\|/g, '|'))
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  // Split on unescaped pipes only, so `solid \| subtle` stays one cell.
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.trim())
}

function markdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''

    if (line.startsWith('```')) {
      const buf: string[] = []
      i += 1
      while (i < lines.length && !(lines[i] ?? '').startsWith('```')) {
        buf.push(lines[i] ?? '')
        i += 1
      }
      i += 1
      html.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`)
      continue
    }

    if (line.startsWith('|') && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? '')) {
      const header = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        rows.push(splitRow(lines[i] ?? ''))
        i += 1
      }
      const head = header.map((c) => `<th>${inline(c)}</th>`).join('')
      const body = rows
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`,
        )
        .join('')
      html.push(
        `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
      )
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1]?.length ?? 1
      html.push(`<h${level}>${inline(heading[2] ?? '')}</h${level}>`)
      i += 1
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? '')) {
        items.push(inline((lines[i] ?? '').replace(/^\s*[-*]\s+/, '')))
        i += 1
      }
      html.push(`<ul>${items.map((it) => `<li>${it}</li>`).join('')}</ul>`)
      continue
    }

    if (line.trim() === '') {
      i += 1
      continue
    }

    html.push(`<p>${inline(line)}</p>`)
    i += 1
  }

  return html.join('\n')
}

const STYLE = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; font: 15px/1.6 ui-sans-serif, system-ui, sans-serif;
  background: #fafafa; color: #1a1a1a; }
a { color: #1d4ed8; }
.layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
aside { border-right: 1px solid #e5e5e5; padding: 24px 20px; position: sticky;
  top: 0; align-self: start; height: 100vh; overflow: auto; }
aside h1 { font-size: 15px; margin: 0 0 16px; }
aside nav { display: flex; flex-direction: column; gap: 2px; }
aside input { width: 100%; margin-bottom: 12px; padding: 6px 8px;
  border: 1px solid #ddd; border-radius: 6px; font: inherit; font-size: .85em;
  background: #fff; }
@media (prefers-color-scheme: dark) {
  aside input { background: #1a1a1a; border-color: #333; color: inherit; }
}
aside a { padding: 3px 8px; border-radius: 6px; text-decoration: none;
  color: #444; }
aside a:hover { background: #eee; }
main { padding: 40px 48px; max-width: 860px; }
h1, h2, h3 { line-height: 1.25; }
h2 { margin-top: 2em; border-bottom: 1px solid #eee; padding-bottom: .2em; }
code { background: #f0f0f0; padding: .1em .35em; border-radius: 4px;
  font-size: .9em; }
pre { background: #1a1a1a; color: #f5f5f5; padding: 14px 16px;
  border-radius: 10px; overflow: auto; }
pre code { background: none; padding: 0; color: inherit; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: .92em; }
th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee;
  vertical-align: top; }
th { color: #666; font-weight: 600; }
.badge { display: inline-block; font-size: .75em; color: #666; }
.demo { margin: 1em 0 1.5em; }
.demo iframe { width: 100%; height: 240px; border: 1px solid #e5e5e5;
  border-radius: 12px; background: #fff; }
@media (prefers-color-scheme: dark) {
  .demo iframe { border-color: #2a2a2a; }
}
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px; margin: 1em 0 2em; }
.swatch { margin: 0; font-size: .75em; }
.swatch .chip { height: 44px; border-radius: 8px; border: 1px solid #0001; }
.swatch figcaption { margin-top: 4px; color: #666; }
.swatch code { background: none; padding: 0; }
.specimen { margin: .25em 0; }
.radius { display: inline-block; width: 72px; height: 40px; background: #8884;
  border: 1px solid #0002; margin-right: 8px; vertical-align: middle; }
.shadow { display: inline-block; width: 72px; height: 40px; background: #fff;
  border-radius: 8px; margin-right: 8px; vertical-align: middle; }
@media (prefers-color-scheme: dark) {
  body { background: #111; color: #e8e8e8; }
  aside { border-color: #2a2a2a; }
  aside a { color: #bbb; } aside a:hover { background: #222; }
  h2 { border-color: #2a2a2a; }
  code { background: #222; }
  th, td { border-color: #2a2a2a; }
  th { color: #999; }
}
`

interface Page {
  slug: string
  title: string
}

/**
 * Live demos. The playground serves `/play?c=<Name>` (see
 * `apps/playground/src/demos.tsx`); a component page embeds it. Set
 * `NEWUI_DEMO_BASE` when the playground is served from another origin.
 */
const DEMO_BASE = process.env.NEWUI_DEMO_BASE ?? 'http://localhost:4173'
const DEMO_COMPONENTS = new Set([
  'Alert',
  'Avatar',
  'Badge',
  'Breadcrumbs',
  'Button',
  'Checkbox',
  'Combobox',
  'DatePicker',
  'Dialog',
  'Divider',
  'Duration',
  'FileUploader',
  'FormControl',
  'ItemListRow',
  'KeyboardShortcut',
  'List',
  'Menu',
  'MultiSelect',
  'NumberInput',
  'Password',
  'Popover',
  'Progress',
  'RadioGroup',
  'Rating',
  'ScrollArea',
  'Select',
  'Skeleton',
  'Slider',
  'Spinner',
  'Switch',
  'TabButtons',
  'Tabs',
  'Textarea',
  'TextInput',
  'TimePicker',
  'Tooltip',
  'Tree',
])

function demoNameForSlug(slug: string): string | undefined {
  const name = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return DEMO_COMPONENTS.has(name) ? name : undefined
}

function demoFrame(slug: string): string {
  const name = demoNameForSlug(slug)
  if (!name) return ''
  return `<div class="demo"><iframe src="${DEMO_BASE}/play?c=${name}" title="${esc(name)} live demo" loading="lazy"></iframe></div>`
}

// The runtime token variables, embedded so swatches and demos on the generated
// pages resolve without loading the app stylesheet.
const TOKENS_CSS = readFileSync(
  path.join(root, 'packages/tailwind/src/generated/tokens.css'),
  'utf8',
)

function titleOf(md: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(md)
  return match?.[1]?.trim() ?? fallback
}

function shell(title: string, pages: Page[], body: string): string {
  const nav = pages
    .map(
      (page) =>
        `<a href="${page.slug === 'index' ? 'index.html' : `${page.slug}.html`}">${esc(page.title)}</a>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · newui</title>
<style>${STYLE}</style>
<style>${TOKENS_CSS}</style>
</head>
<body>
<div class="layout">
<aside>
<h1>newui docs</h1>
<input id="filter" type="search" placeholder="Filter pages…" aria-label="Filter pages" />
<nav>${nav}</nav>
</aside>
<main>${body}</main>
</div>
<script>
  const filter = document.getElementById('filter')
  const links = Array.from(document.querySelectorAll('aside nav a'))
  filter.addEventListener('input', () => {
    const q = filter.value.trim().toLowerCase()
    for (const link of links) {
      link.hidden = q.length > 0 && !link.textContent.toLowerCase().includes(q)
    }
  })
</script>
</body>
</html>
`
}

const specFiles = readdirSync(specDir)
  .filter((file) => file.endsWith('.md') && file !== 'README.md')
  .sort()

const pages: Page[] = [
  { slug: 'index', title: 'Overview' },
  { slug: 'foundations', title: 'Foundations' },
  { slug: 'api', title: 'API tables' },
  ...specFiles.map((file) => {
    const slug = file.replace(/\.md$/, '')
    const md = readFileSync(path.join(specDir, file), 'utf8')
    return { slug, title: titleOf(md, slug) }
  }),
]

mkdirSync(outDir, { recursive: true })

const overview = `# newui

A SolidJS component library — a port of frappe-ui on SolidJS + Zag + Tailwind CSS v4.

This site is generated from \`spec/*.md\` (the per-component contracts) and
\`packages/ui/api.json\` (the prop tables). Regenerate with \`pnpm docs\`.

## Components

${specFiles
  .map((file) => {
    const slug = file.replace(/\.md$/, '')
    const md = readFileSync(path.join(specDir, file), 'utf8')
    return `- [${titleOf(md, slug)}](${slug}.html)`
  })
  .join('\n')}
`
writeFileSync(
  path.join(outDir, 'index.html'),
  shell('Overview', pages, markdown(overview)),
)

for (const file of specFiles) {
  const slug = file.replace(/\.md$/, '')
  const md = readFileSync(path.join(specDir, file), 'utf8')
  writeFileSync(
    path.join(outDir, `${slug}.html`),
    shell(titleOf(md, slug), pages, demoFrame(slug) + markdown(md)),
  )
}

// API tables from the generated api.json.
const api = JSON.parse(readFileSync(apiFile, 'utf8')) as ApiTable
const apiSections = Object.entries(api)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, types]) => {
    const heading = `## ${file.replace(/^packages\/ui\/src\//, '')}`
    const tables = Object.entries(types)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, members]) => {
        const rows = members
          .map((member) => {
            const type = member.type.replace(/\|/g, '\\|')
            return `| \`${member.name}\`${member.optional ? '' : ' *'} | \`${type}\` | ${member.description ?? ''} |`
          })
          .join('\n')
        return `### ${name}\n\n| prop | type | notes |\n| --- | --- | --- |\n${rows}`
      })
      .join('\n\n')
    return `${heading}\n\n${tables}`
  })
  .join('\n\n')

const apiDoc = `# API tables

Generated from \`packages/ui/api.json\`. A prop marked * is required.

${apiSections}
`
writeFileSync(
  path.join(outDir, 'api.html'),
  shell('API tables', pages, markdown(apiDoc)),
)

// Foundations: swatches and scales read from the generated CSS.
const themeCss = readFileSync(
  path.join(root, 'packages/tailwind/src/generated/theme.css'),
  'utf8',
)

function firstVars(css: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    const name = match[1] ?? ''
    if (!map.has(name)) map.set(name, (match[2] ?? '').trim())
  }
  return map
}

const tokenVars = firstVars(TOKENS_CSS)
const themeVars = firstVars(themeCss)

const swatch = (name: string) =>
  `<figure class="swatch"><div class="chip" style="background:var(--${name})"></div><figcaption><code>${esc(name)}</code></figcaption></figure>`

const colorGroups = ['surface', 'ink', 'outline'].map((group) => ({
  group,
  names: [...tokenVars.keys()]
    .filter((name) => name.startsWith(`${group}-`))
    .sort(),
}))

const radiusNames = [...themeVars.keys()]
  .filter((name) => name.startsWith('radius-'))
  .sort(
    (a, b) =>
      (Number.parseFloat(themeVars.get(a) ?? '0') || 0) -
      (Number.parseFloat(themeVars.get(b) ?? '0') || 0),
  )
const shadowNames = [...themeVars.keys()]
  .filter((name) => name.startsWith('shadow-'))
  .sort()
const textNames = [...themeVars.keys()]
  .filter((name) => name.startsWith('text-'))
  .sort()

const foundationsHtml = `
<h1>Foundations</h1>
<p>Generated from <code>@newui/tokens</code> into
<code>packages/tailwind/src/generated/</code>. Swatches resolve the runtime
custom properties, so they flip with <code>data-theme="dark"</code>.</p>
${colorGroups
  .map(
    ({ group, names }) =>
      `<h2>${group}</h2><div class="swatches">${names.map(swatch).join('')}</div>`,
  )
  .join('\n')}
<h2>Radius</h2>
${radiusNames
  .map(
    (name) =>
      `<p class="specimen"><span class="radius" style="border-radius:var(--${name})"></span><code>${esc(name)} = ${esc(themeVars.get(name) ?? '')}</code></p>`,
  )
  .join('')}
<h2>Shadows</h2>
${shadowNames
  .map(
    (name) =>
      `<p class="specimen"><span class="shadow" style="box-shadow:var(--${name})"></span><code>${esc(name)}</code></p>`,
  )
  .join('')}
<h2>Typography</h2>
${textNames
  .map(
    (name) =>
      `<p class="specimen" style="font-size:var(--${name})"><code>${esc(name)}</code> — ${esc(themeVars.get(name) ?? '')}</p>`,
  )
  .join('')}
`
writeFileSync(
  path.join(outDir, 'foundations.html'),
  shell('Foundations', pages, foundationsHtml),
)

console.warn(
  `[docs] wrote ${pages.length} pages to ${path.relative(root, outDir)}/`,
)
