# Toast

Import `toast` and mount one `Toaster` inside UIProvider. `toast.success`,
`toast.error`, `toast.info`, `toast.warning` and `toast.promise` announce local
outcomes. Returned handles expose close. Use createToaster with ToastRegion for
an independent host. Custom render callbacks receive dismiss.

Toasts are live announcements. Essential errors must also appear next to the
affected control. Dismiss buttons remain keyboard accessible. Durations and
promise outcomes belong to the toaster; no controlled open prop exists. Keep
messages concise at narrow widths and 200% text. The isolated demo shows each
semantic outcome and a working promise lifecycle.
