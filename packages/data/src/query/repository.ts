/**
 * A repository is the seam between a page and wherever its records live.
 *
 * It is deliberately small: `list`, `create`, `update`, `remove`. Domain verbs
 * (`complete`, `archive`, `comment`) are `update(id, patch)` with a different
 * name at the call site — a contract that grows a method per business action is
 * a database, not a seam.
 *
 * `list` is the only read. A page that needs one record filters the list it
 * already has; a remote adapter that wants a single request can still expose
 * `list` and let the query cache hold the collection, which is what every local
 * example does.
 */
export interface Repository<T extends { id: string }, New = NewRecord<T>> {
  /** Every record, in the order the collection wants them shown. */
  list(options?: { signal?: AbortSignal }): Promise<T[]>
  /** Create one; resolves with the stored record (its real id included). */
  create(input: New, options?: { signal?: AbortSignal }): Promise<T>
  /** Patch one; resolves with the stored record. */
  update(
    id: string,
    patch: Partial<T>,
    options?: { signal?: AbortSignal },
  ): Promise<T>
  /** Delete many at once; resolves when they are gone. */
  remove(ids: string[], options?: { signal?: AbortSignal }): Promise<void>
}

/** What a caller must supply to create a record: everything but the id it gets. */
export type NewRecord<T> = Omit<T, 'id'> & { id?: string }
