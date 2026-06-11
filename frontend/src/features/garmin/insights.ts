import type { DailySummary, HeartRateSummary } from './schemas'
import { sumSteps } from './data'

const SPARK_WINDOW = 14
const BASELINE_WINDOW = 7

/** Arithmetic mean, or 0 for an empty list. */
export function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((total, n) => total + n, 0) / nums.length
}

/** Percentage change of `current` relative to `baseline` (0 when baseline is 0). */
export function pctDelta(current: number, baseline: number): number {
  if (baseline === 0) return 0
  return ((current - baseline) / baseline) * 100
}

/** Format a running/cycling pace as `m:ss/km`, or null when distance is missing. */
export function formatPace(durationSec: number, km?: number): string | null {
  if (!km || km <= 0 || durationSec <= 0) return null
  const secPerKm = durationSec / km
  let minutes = Math.floor(secPerKm / 60)
  let seconds = Math.round(secPerKm % 60)
  if (seconds === 60) {
    minutes += 1
    seconds = 0
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}/km`
}

export type KpiStat = {
  key: string
  label: string
  value: number
  display: string
  unit: string
  series: number[]
  deltaPct: number | null
  goodWhen: 'up' | 'down'
}

type Trend = { latest: number; baseline: number | null; deltaPct: number | null }

/** Latest value plus its trailing-average baseline and percentage delta. */
function trend(values: number[]): Trend {
  if (values.length === 0) return { latest: 0, baseline: null, deltaPct: null }
  const latest = values[values.length - 1]
  const prior = values.slice(0, -1).slice(-BASELINE_WINDOW)
  const baseline = prior.length ? average(prior) : null
  return {
    latest,
    baseline,
    deltaPct: baseline === null ? null : pctDelta(latest, baseline),
  }
}

function restingValues(hr: HeartRateSummary[]): number[] {
  return hr.map((h) => h.restingHeartRate).filter((v): v is number => v != null)
}

/** Build the headline KPI tiles (steps, resting HR, calories, distance). */
export function buildKpis(summaries: DailySummary[], hr: HeartRateSummary[]): KpiStat[] {
  const steps = summaries.map((s) => s.steps)
  const calories = summaries.map((s) => s.calories ?? 0)
  const distance = summaries.map((s) => s.distanceKm ?? 0)
  const resting = restingValues(hr)

  const stepsT = trend(steps)
  const restingT = trend(resting)
  const caloriesT = trend(calories)
  const distanceT = trend(distance)

  return [
    {
      key: 'steps',
      label: 'Steps',
      value: stepsT.latest,
      display: Math.round(stepsT.latest).toLocaleString(),
      unit: 'today',
      series: steps.slice(-SPARK_WINDOW),
      deltaPct: stepsT.deltaPct,
      goodWhen: 'up',
    },
    {
      key: 'resting',
      label: 'Resting HR',
      value: restingT.latest,
      display: resting.length ? String(Math.round(restingT.latest)) : '—',
      unit: 'bpm',
      series: resting.slice(-SPARK_WINDOW),
      deltaPct: restingT.deltaPct,
      goodWhen: 'down',
    },
    {
      key: 'calories',
      label: 'Calories',
      value: caloriesT.latest,
      display: Math.round(caloriesT.latest).toLocaleString(),
      unit: 'kcal',
      series: calories.slice(-SPARK_WINDOW),
      deltaPct: caloriesT.deltaPct,
      goodWhen: 'up',
    },
    {
      key: 'distance',
      label: 'Distance',
      value: distanceT.latest,
      display: distanceT.latest.toFixed(1),
      unit: 'km',
      series: distance.slice(-SPARK_WINDOW),
      deltaPct: distanceT.deltaPct,
      goodWhen: 'up',
    },
  ]
}

export type Headline = { headline: string; detail: string }

/** Generate a short narrative from the data, degrading gracefully when sparse. */
export function buildHeadline(summaries: DailySummary[], hr: HeartRateSummary[]): Headline {
  if (summaries.length === 0) {
    return {
      headline: 'No data yet',
      detail: 'Fetch your Garmin data to start seeing insights.',
    }
  }

  const steps = summaries.map((s) => s.steps)
  const stepsT = trend(steps)

  let headline: string
  if (stepsT.deltaPct === null) {
    headline = `You logged ${Math.round(stepsT.latest).toLocaleString()} steps on your latest day.`
  } else if (stepsT.deltaPct >= 5) {
    headline = `You're ${Math.round(stepsT.deltaPct)}% above your weekly step average — strong momentum.`
  } else if (stepsT.deltaPct <= -5) {
    headline = `You're ${Math.abs(Math.round(stepsT.deltaPct))}% below your weekly step average — time to move.`
  } else {
    headline = "You're right on pace with your weekly step average."
  }

  const resting = restingValues(hr)
  const restingT = trend(resting)
  let detail: string
  if (resting.length && restingT.baseline !== null) {
    const diff = Math.round(restingT.latest - restingT.baseline)
    if (diff <= -1) {
      detail = `Resting heart rate is down ${Math.abs(diff)} bpm vs your recent average — recovery is trending well.`
    } else if (diff >= 1) {
      detail = `Resting heart rate is up ${diff} bpm vs your recent average — consider an easier day.`
    } else {
      detail = `Resting heart rate is holding steady around ${Math.round(restingT.latest)} bpm.`
    }
  } else {
    const best = Math.max(...steps)
    detail = `Your best day this period reached ${best.toLocaleString()} steps.`
  }

  return { headline, detail }
}

export type WeeklyGoal = { total: number; target: number; pct: number; days: number }

/** Sum the most recent 7 days of steps against a weekly target. */
export function weeklyGoal(summaries: DailySummary[], target: number): WeeklyGoal {
  const last7 = summaries.slice(-7)
  const total = sumSteps(last7)
  const pct = target > 0 ? (100 * total) / target : 0
  return { total, target, pct, days: last7.length }
}
