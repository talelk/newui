import { CodeEditor, type CodeEditorLanguage } from '@newui/code-editor'
import { Button, Select, Switch } from '@newui/ui'
import { createSignal } from 'solid-js'
export default function Demo() {
  const [value, setValue] = createSignal('const revenue = 24680')
  const [language, setLanguage] = createSignal<CodeEditorLanguage>('javascript')
  const [readonly, setReadonly] = createSignal(false)
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end gap-3">
        <Select
          label="Code language"
          value={[language()]}
          options={[
            'javascript',
            'typescript',
            'json',
            'html',
            'css',
            'python',
            'sql',
            'markdown',
          ].map((value) => ({ value, label: value }))}
          onValueChange={(value) => setLanguage(value[0] as CodeEditorLanguage)}
        />
        <Switch
          label="Read-only code"
          checked={readonly()}
          onCheckedChange={setReadonly}
        />
        <Button onClick={() => setValue('const revenue = 24680')}>
          Reset document
        </Button>
      </div>
      <CodeEditor
        value={value()}
        onValueChange={setValue}
        language={language()}
        readonly={readonly()}
      />
      <output aria-live="polite" class="text-caption text-ink-gray-7">
        {value().length} characters
      </output>
    </div>
  )
}
