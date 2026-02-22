import { describe, it, expect } from 'vitest'

describe('Project setup', () => {
  it('should run tests with vitest', () => {
    expect(true).toBe(true)
  })

  it('should have jsdom environment', () => {
    expect(document).toBeDefined()
    expect(document.createElement).toBeDefined()
  })
})
