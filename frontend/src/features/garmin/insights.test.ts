import { describe, expect, it } from 'vitest'
import { average, buildHeadline, buildKpis, formatPace, pctDelta, weeklyGoal } from './insights'
import type { DailySummary, HeartRateSummary } from './schemas'

describe('average', () => {
  it('returns the mean', () => {
    expect(average([2, 4, 6])).toBe(4)
  })
  it('returns 0 for an empty list', () => {
    expect(average([])).toBe(0)
  })
})

describe('pctDelta', () => {
  it('computes the percentage change', () => {
    expect(pctDelta(110, 100)).toBeCloseTo(10)
    expect(pctDelta(90, 100)).toBeCloseTo(-10)
  })
  it('returns 0 when the baseline is 0', () => {
    expect(pctDelta(50, 0)).toBe(0)
  })
})

describe('formatPace', () => {
  it('formats seconds-per-km as m:ss/km', () => {
    expect(formatPace(3000, 10)).toBe('5:00/km')
    expect(formatPace(3120, 7.4)).toBe('7:02/km') // 421.6 s/km
  })
  it('returns null without a positive distance', () => {
    expect(formatPace(3000, 0)).toBeNull()
    expect(formatPace(3000)).toBeNull()
  })
  it('carries a 60-second rounding into the next minute', () => {
    // 359.7 s/km rounds to 6:00, not 5:60
    expect(formatPace(3597, 10)).toBe('6:00/km')
  })
})

const daily = (date: string, steps: number, extra: Partial<DailySummary> = {}): DailySummary => ({
  date,
  steps,
  ...extra,
})

describe('buildKpis', () => {
  it('computes the latest value and delta vs the trailing average', () => {
    const summaries = [daily('2025-10-18', 8000), daily('2025-10-19', 8000), daily('2025-10-20', 10000)]
    const kpis = buildKpis(summaries, [])
    const steps = kpis.find((k) => k.key === 'steps')!
    expect(steps.value).toBe(10000)
    expect(steps.deltaPct).toBeCloseTo(25) // 10000 vs avg(8000, 8000)
    expect(steps.series).toEqual([8000, 8000, 10000])
  })

  it('marks resting HR as good-when-down and shows a dash without data', () => {
    const resting = kpisResting([])
    expect(resting.display).toBe('—')
    expect(resting.goodWhen).toBe('down')
    expect(resting.deltaPct).toBeNull()
  })
})

function kpisResting(hr: HeartRateSummary[]) {
  return buildKpis([daily('2025-10-20', 9000)], hr).find((k) => k.key === 'resting')!
}

describe('buildHeadline', () => {
  it('falls back gracefully with no data', () => {
    expect(buildHeadline([], []).headline).toBe('No data yet')
  })

  it('celebrates being above the weekly average', () => {
    const summaries = [daily('2025-10-18', 6000), daily('2025-10-19', 6000), daily('2025-10-20', 12000)]
    expect(buildHeadline(summaries, []).headline).toMatch(/above your weekly step average/)
  })

  it('reads resting HR as a recovery signal when trending down', () => {
    const summaries = [daily('2025-10-19', 9000), daily('2025-10-20', 9000)]
    const hr: HeartRateSummary[] = [
      { date: '2025-10-19', restingHeartRate: 58 },
      { date: '2025-10-20', restingHeartRate: 52 },
    ]
    expect(buildHeadline(summaries, hr).detail).toMatch(/recovery is trending well/)
  })
})

describe('weeklyGoal', () => {
  it('sums the last 7 days against the target', () => {
    const summaries = Array.from({ length: 10 }, (_, i) => daily(`2025-10-${10 + i}`, 1000))
    const goal = weeklyGoal(summaries, 14000)
    expect(goal.total).toBe(7000) // only the last 7 days
    expect(goal.days).toBe(7)
    expect(goal.pct).toBeCloseTo(50)
  })
})
