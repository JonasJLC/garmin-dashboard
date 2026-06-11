import { describe, expect, it } from 'vitest'
import { sumSteps } from './data'

describe('sumSteps', () => {
  it('sums the steps across summaries', () => {
    expect(sumSteps([{ steps: 8421 }, { steps: 10934 }, { steps: 7032 }])).toBe(26387)
  })

  it('returns 0 for an empty list', () => {
    expect(sumSteps([])).toBe(0)
  })
})
