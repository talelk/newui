import { describe, expect, it } from 'vitest'
import { createProjectRepository, PROJECT_STATUSES, SEED } from './records'

/**
 * The repository is the one piece of the starter with logic rather than markup:
 * ids, timestamps, patch semantics, deletion and cancellation. The screens are
 * covered by the browser suite; this covers the seam they sit on.
 */
describe('createProjectRepository', () => {
  it('lists a copy of the seed, in order', async () => {
    const repository = createProjectRepository({ latency: 0 })
    const rows = await repository.list()
    expect(rows).toHaveLength(SEED.length)
    expect(rows[0]?.id).toBe('PRJ-001')
    // A caller editing its copy must not edit the store.
    const first = rows[0]
    if (!first) throw new Error('expected a seeded row')
    first.name = 'changed'
    expect((await repository.list())[0]?.name).toBe('Ledger migration')
  })

  it('creates with an id and a timestamp the caller does not supply', async () => {
    const repository = createProjectRepository({ latency: 0 })
    const created = await repository.create({
      name: 'New project',
      owner: 'Rhea Kapoor',
      status: 'Active',
      budget: 1_000,
    })
    expect(created.id).toMatch(/^PRJ-\d{3}$/)
    expect(created.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect((await repository.list())[0]?.id).toBe(created.id)
  })

  it('patches one record and stamps it', async () => {
    const repository = createProjectRepository({ latency: 0 })
    const updated = await repository.update('PRJ-002', { status: 'Done' })
    expect(updated.status).toBe('Done')
    const rows = await repository.list()
    expect(rows.find((row) => row.id === 'PRJ-002')?.status).toBe('Done')
    // Exactly the one row moved.
    expect(rows.filter((row) => row.status === 'Done')).toHaveLength(
      SEED.filter((row) => row.status === 'Done').length + 1,
    )
  })

  it('refuses to patch an id it does not have', async () => {
    const repository = createProjectRepository({ latency: 0 })
    await expect(
      repository.update('PRJ-999', { status: 'Done' }),
    ).rejects.toThrow('No project with the id PRJ-999.')
  })

  it('removes many at once', async () => {
    const repository = createProjectRepository({ latency: 0 })
    await repository.remove(['PRJ-001', 'PRJ-002'])
    const rows = await repository.list()
    expect(rows).toHaveLength(SEED.length - 2)
    expect(rows.some((row) => row.id === 'PRJ-001')).toBe(false)
  })

  it('honours an aborted list request', async () => {
    const repository = createProjectRepository({ latency: 50 })
    const controller = new AbortController()
    const pending = repository.list({ signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toThrow('cancelled')
  })

  it('seeds every status, so the filters have something to find', () => {
    for (const status of PROJECT_STATUSES) {
      expect(SEED.some((project) => project.status === status)).toBe(true)
    }
  })
})
