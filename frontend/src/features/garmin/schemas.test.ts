import { describe, expect, it } from 'vitest'
import {
  ActivitiesSchema,
  DailySummarySchema,
  HeartRateSummarySchema,
  ManifestSchema,
} from './schemas'

describe('ManifestSchema', () => {
  it('accepts a list of dates with optional updatedAt', () => {
    const parsed = ManifestSchema.parse({ dates: ['2025-10-20', '2025-10-19'], updatedAt: '2025-10-21T00:00:00Z' })
    expect(parsed.dates).toHaveLength(2)
  })

  it('rejects a missing dates array', () => {
    expect(ManifestSchema.safeParse({ updatedAt: 'x' }).success).toBe(false)
  })
})

describe('DailySummarySchema', () => {
  it('accepts a minimal summary', () => {
    expect(DailySummarySchema.parse({ date: '2025-10-20', steps: 8421 }).steps).toBe(8421)
  })

  it('rejects negative steps', () => {
    expect(DailySummarySchema.safeParse({ date: '2025-10-20', steps: -1 }).success).toBe(false)
  })
})

describe('HeartRateSummarySchema', () => {
  it('allows optional heart-rate fields to be omitted', () => {
    expect(HeartRateSummarySchema.parse({ date: '2025-10-20' }).restingHeartRate).toBeUndefined()
  })
})

describe('ActivitiesSchema', () => {
  it('parses an array of activities', () => {
    const parsed = ActivitiesSchema.parse([
      { id: 1, name: 'Run', startTimeLocal: '2025-10-20T06:45:00', durationSec: 3120 },
    ])
    expect(parsed).toHaveLength(1)
  })
})
