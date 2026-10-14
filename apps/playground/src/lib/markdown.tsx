import { cn } from '@newui/ui'
import { For, type JSX, Match, Switch } from 'solid-js'

/**
 * A markdown subset, rendered to JSX.
 *
 * The specs in `spec/*.md` use headings, paragraphs, fenced code, tables, two
 * kinds of list and the odd rule — nothing else. So this is a block parser for
 * exactly those, and inline parsing for code, bold and links.
 *
 * It returns JSX rather than an HTML string on purpose: `solid/no-innerhtml`
 * is one of the lint rules this repo treats as load-bearing, and a docs page is
 * the last place to start punching holes in the renderer.
 */

type Block =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; code: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'rule' }

function isTableRule(line: string): boolean {
  return /^\|[\s:|-]+\|?\s*$/.test(line)
}

function splitRow(line: string): string[] {
  return (
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      // Split on unescaped pipes only, so `solid \| subtle` stays one cell.
      .split(/(?<!\\)\|/)
      .map((cell) => cell.replace(/\\\|/g, '|').trim())
  )
}

export function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''

    if (line.startsWith('```')) {
      const buffer: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? '').startsWith('```')) {
        buffer.push(lines[index] ?? '')
        index += 1
      }
      index += 1
      blocks.push({ kind: 'code', code: buffer.join('\n') })
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      // The page's own `h1` is the component name, so the spec's `# Title` is
      // dropped and the rest shift down one level.
      const depth = (heading[1] ?? '').length
      if (depth > 1) {
        blocks.push({
          kind: 'heading',
          level: Math.min(depth, 4) as 2 | 3 | 4,
          text: heading[2] ?? '',
        })
      }
      index += 1
      continue
    }

    if (line.startsWith('|') && isTableRule(lines[index + 1] ?? '')) {
      const head = splitRow(line)
      index += 2
      const rows: string[][] = []
      while (index < lines.length && (lines[index] ?? '').startsWith('|')) {
        rows.push(splitRow(lines[index] ?? ''))
        index += 1
      }
      blocks.push({ kind: 'table', head, rows })
      continue
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line)
      const items: string[] = []
      const pattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/
      while (index < lines.length && pattern.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(pattern, ''))
        index += 1
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }

    if (line.startsWith('> ')) {
      blocks.push({ kind: 'quote', text: line.slice(2) })
      index += 1
      continue
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) {
      blocks.push({ kind: 'rule' })
      index += 1
      continue
    }

    if (line.trim() === '') {
      index += 1
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length &&
      (lines[index] ?? '').trim() !== '' &&
      !(lines[index] ?? '').startsWith('#') &&
      !(lines[index] ?? '').startsWith('```') &&
      !(lines[index] ?? '').startsWith('|') &&
      !/^[-*]\s+/.test(lines[index] ?? '') &&
      !/^\d+\.\s+/.test(lines[index] ?? '')
    ) {
      paragraph.push(lines[index] ?? '')
      index += 1
    }
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
  }

  return blocks
}

/**
 * Inline markdown: code spans, bold, and links.
 *
 * One pass with a combined pattern rather than three replaces, so a `**bold**`
 * inside a code span cannot be re-processed.
 */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g

export function renderInline(text: string): JSX.Element {
  const parts = text.split(INLINE).filter((part) => part !== '')
  return (
    <For each={parts}>
      {(part) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code class="rounded-3 bg-surface-gray-2 px-1 py-0.5 text-sm text-ink-gray-8">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong class="font-medium">{part.slice(2, -2)}</strong>
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          return (
            <a
              href={link[2]}
              class="text-ink-blue-6 underline decoration-dotted"
            >
              {link[1]}
            </a>
          )
        }
        return part
      }}
    </For>
  )
}

export function Markdown(props: {
  markdown: string
  class?: string
}): JSX.Element {
  const blocks = () => parseMarkdown(props.markdown)

  return (
    <div class={cn('flex flex-col gap-4', props.class)}>
      <For each={blocks()}>
        {(block) => (
          <Switch>
            <Match when={block.kind === 'heading' && block}>
              {(heading) => (
                <Switch>
                  <Match when={heading().level === 2}>
                    <h2 class="mt-2 text-xl-medium text-ink-gray-9">
                      {renderInline(heading().text)}
                    </h2>
                  </Match>
                  <Match when={heading().level === 3}>
                    <h3 class="mt-1 text-lg-medium text-ink-gray-9">
                      {renderInline(heading().text)}
                    </h3>
                  </Match>
                  <Match when={heading().level === 4}>
                    <h4 class="text-base-medium text-ink-gray-8">
                      {renderInline(heading().text)}
                    </h4>
                  </Match>
                </Switch>
              )}
            </Match>

            <Match when={block.kind === 'paragraph' && block}>
              {(paragraph) => (
                <p class="text-base leading-relaxed text-ink-gray-7">
                  {renderInline(paragraph().text)}
                </p>
              )}
            </Match>

            <Match when={block.kind === 'code' && block}>
              {(code) => (
                <pre class="overflow-x-auto rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-4 text-sm leading-relaxed text-ink-gray-8">
                  <code>{code().code}</code>
                </pre>
              )}
            </Match>

            <Match when={block.kind === 'table' && block}>
              {(table) => (
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[32rem] border-collapse text-base">
                    <thead>
                      <tr>
                        <For each={table().head}>
                          {(cell) => (
                            <th class="border-b border-outline-gray-2 px-3 py-2 text-start text-sm-medium text-ink-gray-8">
                              {renderInline(cell)}
                            </th>
                          )}
                        </For>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={table().rows}>
                        {(row) => (
                          <tr>
                            <For each={row}>
                              {(cell) => (
                                <td class="border-b border-outline-gray-1 px-3 py-2 align-top text-ink-gray-7">
                                  {renderInline(cell)}
                                </td>
                              )}
                            </For>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              )}
            </Match>

            <Match when={block.kind === 'list' && block}>
              {(list) => (
                <Switch>
                  <Match when={list().ordered}>
                    <ol class="flex list-decimal flex-col gap-1 ps-5 text-base text-ink-gray-7">
                      <For each={list().items}>
                        {(item) => <li>{renderInline(item)}</li>}
                      </For>
                    </ol>
                  </Match>
                  <Match when={!list().ordered}>
                    <ul class="flex list-disc flex-col gap-1 ps-5 text-base text-ink-gray-7">
                      <For each={list().items}>
                        {(item) => <li>{renderInline(item)}</li>}
                      </For>
                    </ul>
                  </Match>
                </Switch>
              )}
            </Match>

            <Match when={block.kind === 'quote' && block}>
              {(quote) => (
                <blockquote class="border-s-2 border-outline-gray-2 ps-4 text-base text-ink-gray-6">
                  {renderInline(quote().text)}
                </blockquote>
              )}
            </Match>

            <Match when={block.kind === 'rule'}>
              <hr class="my-2 border-0 border-t border-outline-gray-1" />
            </Match>
          </Switch>
        )}
      </For>
    </div>
  )
}
