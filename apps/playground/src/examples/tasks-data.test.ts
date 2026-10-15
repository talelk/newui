import { describe, expect, it } from 'vitest'
import { createTaskRepository, seedTasks } from './tasks-data'

describe('local task repository', () => {
  it('keeps task edits and comments in the repository without mutating query snapshots', () => {
    const repository = createTaskRepository()
    const before = repository.read()
    repository.update('TASK-1001', {
      title: 'Review launch',
      owner: 'Sam Rivera',
      project: 'Mobile app',
    })
    repository.comment('TASK-1001', '  Ready for review.  ')
    repository.comment('TASK-1001', '  ')
    expect(repository.read()[0]).toMatchObject({
      title: 'Review launch',
      owner: 'Sam Rivera',
      project: 'Mobile app',
      comments: ['Ready for review.'],
    })
    expect(before[0]?.comments).toEqual([])
    expect(before[0]?.title).toBe('Review the revenue dashboard')
  })
  it('seeds stable unique records and keeps new records after reloading', () => {
    const rows = seedTasks()
    expect(rows).toHaveLength(1000)
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length)
    const repository = createTaskRepository()
    const next = repository.create({ title: 'Review launch', priority: 'High' })
    expect(next[0]).toMatchObject({
      id: 'TASK-2001',
      title: 'Review launch',
      status: 'Todo',
    })
    expect(repository.read()).toEqual(next)
    expect(rows[0]?.id).toBe('TASK-1001')
  })
  it('completes only the selected records and keeps cached snapshots immutable', () => {
    const repository = createTaskRepository()
    const before = repository.read()
    const after = repository.complete(['TASK-1001', 'TASK-1002'])
    expect(
      after
        .filter((row) => ['TASK-1001', 'TASK-1002'].includes(row.id))
        .every((row) => row.status === 'Done'),
    ).toBe(true)
    expect(before[0]?.status).toBe('Backlog')
    expect(after[2]).toEqual(before[2])
  })
})
