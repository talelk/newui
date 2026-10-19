/**
 * Saving a file, without the Blob/anchor/revoke dance every page wrote.
 *
 * `downloadCsv` quotes every cell and doubles inner quotes, which is the part
 * that is easy to get subtly wrong.
 */

/** Save a Blob (or a local `File`) under `name`. */
export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** Save text under `name`; plain text unless the caller names a type. */
export function downloadText(
  name: string,
  text: string,
  mime = 'text/plain;charset=utf-8',
): void {
  downloadBlob(name, new Blob([text], { type: mime }))
}

/** Rows → CSV text, every cell quoted, quotes doubled. */
export function csvText(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','),
    )
    .join('\r\n')
}

/** Save rows as a CSV file under `name`. */
export function downloadCsv(name: string, rows: (string | number)[][]): void {
  downloadText(name, csvText(rows), 'text/csv;charset=utf-8')
}
