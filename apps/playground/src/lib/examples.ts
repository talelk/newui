/** Shipped application examples and their reference lineage, with no runtime UI. */
export const EXAMPLES = [
  {
    name: 'Component recipes',
    href: '/examples/patterns',
    preview: 'Card',
    description:
      'All 68 solid-ui registry examples, translated into newui composition.',
    source: 'solid-ui component registry',
    icon: 'lucide-panels-top-left',
  },
  {
    name: 'Accounting',
    href: '/examples/accounting',
    preview: 'Chart',
    description:
      'Cashflow, expenses, payroll and a profit report connected to one local ledger.',
    source: 'Frappe AccountingDesktop',
    icon: 'lucide-chart-no-axes-column',
  },
  {
    name: 'Files',
    href: '/examples/files',
    preview: 'Card',
    description:
      'Folders, favourites, local uploads, previews, downloads and restorable trash.',
    source: 'Frappe FilesDesktop',
    icon: 'lucide-folder',
  },
  {
    name: 'Tickets',
    href: '/examples/tickets',
    preview: 'List',
    description:
      'A local helpdesk with service targets, ownership, replies, resolution and bulk actions.',
    source: 'Frappe TicketsDesktop',
    icon: 'lucide-ticket',
  },
  {
    name: 'Deals',
    href: '/examples/deals',
    preview: 'Card',
    description:
      'An opportunity board with accessible stage changes, filters, creation and a typed list.',
    source: 'Frappe DealsDesktop',
    icon: 'lucide-handshake',
  },
  {
    name: 'Mail',
    href: '/examples/mail',
    preview: 'List',
    description:
      'Folders, labels, search, unread filters, conversations and a local email composer.',
    source: 'Frappe MailDesktop · solid-ui mail',
    icon: 'lucide-mail',
  },
  {
    name: 'Compose',
    href: '/examples/compose',
    preview: 'Editor',
    description: 'Write, preview, save and publish a local rich-text update.',
    source: 'Frappe ComposeDesktop',
    icon: 'lucide-file-pen-line',
  },
  {
    name: 'Analytics dashboard',
    href: '/examples/analytics',
    preview: 'Chart',
    description:
      'Revenue, channels, regions, transactions and a clear view of growth.',
    source: 'Tremor analytical interfaces · solid-ui dashboard',
    icon: 'lucide-chart-no-axes-combined',
  },
  {
    name: 'Tasks',
    href: '/examples/tasks',
    preview: 'Tasks',
    description:
      'A thousand local tasks with typed tables, validated creation and a virtual feed.',
    source: 'Frappe TasksDesktop · solid-ui tasks',
    icon: 'lucide-list-checks',
  },
  {
    name: 'Cards',
    href: '/examples/cards',
    preview: 'Card',
    description:
      'Account, payment, team, sharing, notifications, support, project and cookie compositions.',
    source: 'solid-ui cards',
    icon: 'lucide-layout-grid',
  },
  {
    name: 'Authentication',
    href: '/examples/authentication',
    preview: 'AuthCard',
    description:
      'Validated sign-in, account creation and email-link demo flows.',
    source: 'solid-ui authentication',
    icon: 'lucide-lock-keyhole',
  },
  {
    name: 'Discussions',
    href: '/examples/discussions',
    preview: 'Sidebar',
    description:
      'Community rail, spaces, a filterable feed and workspace settings.',
    source: 'Frappe DiscussionsDesktop',
    icon: 'lucide-messages-square',
  },
  {
    name: 'Settings',
    href: '/examples/settings',
    preview: 'Dialog',
    description:
      'Grouped settings navigation with profile, notification and member panels.',
    source: 'Frappe SettingsDialog',
    icon: 'lucide-settings-2',
  },
] as const
