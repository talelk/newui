/** Identical field geometry shared by text entry and popup-backed controls. */
export const fieldSizes = {
  xs: 'h-6 rounded-control text-xs',
  sm: 'h-7 rounded-control text-base',
  md: 'h-8 rounded-control text-base',
  lg: 'h-10 rounded-control text-lg',
} as const

/** Popup controls share hover/open boundaries; text entry owns focus instead. */
export const popupFieldVariants = {
  subtle:
    'border border-surface-gray-2 bg-surface-gray-2 hover:border-outline-gray-3 hover:bg-surface-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:bg-surface-base data-[state=open]:shadow-sm',
  outline:
    'border border-outline-gray-2 bg-surface-base hover:border-outline-gray-3 data-[state=open]:border-outline-gray-4 data-[state=open]:shadow-sm',
  ghost: 'border-0 bg-transparent',
} as const
