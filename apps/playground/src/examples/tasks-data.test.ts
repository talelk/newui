import { describe, expect, it } from 'vitest'
import { createTaskRepository, seedTasks } from './tasks-data'

describe('local task repository', () => {
  it('keeps edits and comments, and hands out copies rather than the store', async () => {
    const repository = createTaskRepository()
    const before = await repository.list()
    await repository.update('TASK-1001', {
      title: 'Review launch',
      owner: 'Sam Rivera',
      project: 'Mobile app',
      comments: ['Ready for review.'],
    })
    const first = (await repository.list())[0]
    expect(first).toMatchObject({
      title: 'Review launch',
      owner: 'Sam Rivera',
      project: 'Mobile app',
      comments: ['Ready for review.'],
    })
    expect(before[0]?.comments).toEqual([])
    expect(before[0]?.title).toBe('Review the revenue dashboard')
  })

  it('seeds stable unique records and keeps new records after reloading', async () => {
    const rows = seedTasks()
    expect(rows).toHaveLength(1000)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    const repository = createTaskRepository()
    const created = await repository.create({
      title: 'Review launch',
      priority: 'High',
    })
    expect(created).toMatchObject({
      id: 'TASK-2001',
      title: 'Review launch',
      status: 'Todo',
    })
    expect((await repository.list())[0]).toEqual(created)
    expect(rows[0]?.id).toBe('TASK-1001')
  })

  it('completes only the selected records and keeps snapshots immutable', async () => {
    const repository = createTaskRepository()
    const before = await repository.list()
    await Promise.all(
      ['TASK-1001', 'TASK-1002'].map((id) =>
        repository.update(id, { status: 'Done' }),
      ),
    )
    const after = await repository.list()
    expect(
      after
        .filter((row) => ['TASK-1001', 'TASK-1002'].includes(row.id))
        .every((row) => row.status === 'Done'),
    ).toBe(true)
    expect(before[0]?.status).toBe('Backlog')
    expect(after[2]).toEqual(before[2])
  })

  it('removes records and rejects an update to one that is gone', async () => {
    const repository = createTaskRepository()
    await repository.remove(['TASK-1001'])
    expect(
      (await repository.list()).some((row) => row.id === 'TASK-1001'),
    ).toBe(false)
    await expect(
      repository.update('TASK-1001', { title: 'Gone' }),
    ).rejects.toThrow('No task called TASK-1001')
  })
})
