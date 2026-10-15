export interface WorkspaceFile {
  id: string
  parent: string | null
  name: string
  type: 'folder' | 'file'
  bytes: number
  owner: string
  starred: boolean
  shared: boolean
  trashed: boolean
  day: number
  file?: File
  content?: string
}
export const INITIAL: WorkspaceFile[] = [
  {
    id: 'design',
    parent: null,
    name: 'Design assets',
    type: 'folder',
    bytes: 0,
    owner: 'Rhea Kapoor',
    starred: true,
    shared: false,
    trashed: false,
    day: 0,
  },
  {
    id: 'contracts',
    parent: null,
    name: 'Contracts',
    type: 'folder',
    bytes: 0,
    owner: 'Priya Nair',
    starred: false,
    shared: true,
    trashed: false,
    day: 3,
  },
  {
    id: 'screenshots',
    parent: 'design',
    name: 'Product screenshots',
    type: 'folder',
    bytes: 0,
    owner: 'Sam Rivera',
    starred: false,
    shared: true,
    trashed: false,
    day: 2,
  },
  ...[
    'Standup notes.md',
    'September revenue.csv',
    'Brand guidelines.txt',
    'Customer agreement.txt',
    'Design review.md',
    'Launch checklist.md',
    'Research summary.txt',
    'Q4 roadmap.md',
  ].map(
    (name, index): WorkspaceFile => ({
      id: `FILE-${index + 1}`,
      parent: index === 2 ? 'design' : index === 3 ? 'contracts' : null,
      name,
      type: 'file',
      bytes: 1024 * (index + 1),
      owner:
        ['Rhea Kapoor', 'Priya Nair', 'Sam Rivera'][index % 3] ?? 'Rhea Kapoor',
      starred: index === 1,
      shared: index % 3 === 1,
      trashed: false,
      day: index,
      content: name.endsWith('.csv')
        ? 'month,revenue\nSeptember,128430\nAugust,115600\n'
        : `# ${name.replace(/\.[^.]+$/, '')}\n\nA local workspace document for the Acme team.\n\n- Review the latest changes\n- Share feedback with the team\n- Keep the next step clear\n`,
    }),
  ),
]
export const size = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
