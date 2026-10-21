/** Shipped application examples and their reference lineage, with no runtime UI. */
export const EXAMPLES = [
  {
    name: 'Accounting',
    href: '/pages/accounting',
    preview: 'Chart',
    description:
      'Cashflow, expenses, payroll and a profit report connected to one local ledger.',
    source: 'Frappe AccountingDesktop',
    icon: 'lucide-chart-no-axes-column',
  },
  {
    name: 'Files',
    href: '/pages/files',
    preview: 'Card',
    description:
      'Folders, favourites, local uploads, previews, downloads and restorable trash.',
    source: 'Frappe FilesDesktop',
    icon: 'lucide-folder',
  },
  {
    name: 'Tickets',
    href: '/pages/tickets',
    preview: 'List',
    description:
      'A local helpdesk with service targets, ownership, replies, resolution and bulk actions.',
    source: 'Frappe TicketsDesktop',
    icon: 'lucide-ticket',
  },
  {
    name: 'Deals',
    href: '/pages/deals',
    preview: 'Card',
    description:
      'An opportunity board with accessible stage changes, filters, creation and a typed list.',
    source: 'Frappe DealsDesktop',
    icon: 'lucide-handshake',
  },
  {
    name: 'Mail',
    href: '/pages/mail',
    preview: 'List',
    description:
      'Folders, labels, search, unread filters, conversations and a local email composer.',
    source: 'Frappe MailDesktop · solid-ui mail',
    icon: 'lucide-mail',
  },
  {
    name: 'Compose',
    href: '/pages/compose',
    preview: 'Editor',
    description: 'Write, preview, save and publish a local rich-text update.',
    source: 'Frappe ComposeDesktop',
    icon: 'lucide-file-pen-line',
  },
  {
    name: 'Analytics dashboard',
    href: '/pages/analytics',
    preview: 'Chart',
    description:
      'Revenue, channels, regions, transactions and a clear view of growth.',
    source: 'Tremor analytical interfaces · solid-ui dashboard',
    icon: 'lucide-chart-no-axes-combined',
  },
  {
    name: 'Tasks',
    href: '/pages/tasks',
    preview: 'Tasks',
    description:
      'A thousand local tasks with typed tables, validated creation and a virtual feed.',
    source: 'Frappe TasksDesktop · solid-ui tasks',
    icon: 'lucide-list-checks',
  },
  {
    name: 'Cards',
    href: '/pages/cards',
    preview: 'Card',
    description:
      'Account, payment, team, sharing, notifications, support, project and cookie compositions.',
    source: 'solid-ui cards',
    icon: 'lucide-layout-grid',
  },
  {
    name: 'Authentication',
    href: '/pages/authentication',
    preview: 'AuthCard',
    description:
      'Validated sign-in, account creation and email-link demo flows.',
    source: 'solid-ui authentication',
    icon: 'lucide-lock-keyhole',
  },
  {
    name: 'Discussions',
    href: '/pages/discussions',
    preview: 'Sidebar',
    description:
      'Community switcher, grouped spaces, a filterable feed and workspace settings.',
    source: 'Frappe DiscussionsDesktop',
    icon: 'lucide-messages-square',
  },
  {
    name: 'Settings',
    href: '/pages/settings',
    preview: 'Dialog',
    description:
      'Grouped settings navigation with profile, notification and member panels.',
    source: 'Frappe SettingsDialog',
    icon: 'lucide-settings-2',
  },
] as const
