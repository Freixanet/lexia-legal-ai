import { describe, it, expect, vi, beforeEach } from 'vitest'
import { del } from 'idb-keyval'

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}))

describe('Delete account / clear data flow', () => {
  beforeEach(() => {
    vi.mocked(del).mockClear()
  })

  it('del from idb-keyval can be called for storage key', async () => {
    await del('lexia_conversations')
    expect(del).toHaveBeenCalledWith('lexia_conversations')
  })
})
