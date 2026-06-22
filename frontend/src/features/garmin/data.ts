import { z } from 'zod'
import {
  ActivitiesSchema,
  BiometricSummaryListSchema,
  BodyBatteryListSchema,
  DailySummarySchema,
  HeartRateSummarySchema,
  ManifestSchema,
  SleepSummaryListSchema,
  TrainingLoadListSchema,
  type Activity,
  type BiometricSummary,
  type BodyBattery,
  type DailySummary,
  type HeartRateSummary,
  type Manifest,
  type SleepSummary,
  type TrainingLoad,
} from './schemas'

async function loadJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  const json = await res.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    // Keep error readable but concise
    throw new Error(`Invalid data at ${path}: ${parsed.error.issues.map(i => i.message).join('; ')}`)
  }
  return parsed.data
}

const base = import.meta.env.BASE_URL ?? '/'

export function getManifest(): Promise<Manifest> {
  return loadJson(`${base}data/garmin/index.json`, ManifestSchema)
}

export function getDailySummary(date: string): Promise<DailySummary> {
  return loadJson(`${base}data/garmin/daily-${date}.json`, DailySummarySchema)
}

export function getHeartRateSummary(date: string): Promise<HeartRateSummary> {
  return loadJson(`${base}data/garmin/hr-${date}.json`, HeartRateSummarySchema)
}

export function getActivities(): Promise<Activity[]> {
  return loadJson(`${base}data/garmin/activities.json`, ActivitiesSchema)
}

export function getBodyBattery(): Promise<BodyBattery[]> {
  return loadJson(`${base}data/garmin/body-battery.json`, BodyBatteryListSchema)
}

export function getSleepSummaries(): Promise<SleepSummary[]> {
  return loadJson(`${base}data/garmin/sleep-summary.json`, SleepSummaryListSchema)
}

export function getBiometrics(): Promise<BiometricSummary[]> {
  return loadJson(`${base}data/garmin/biometrics.json`, BiometricSummaryListSchema)
}

export function getTrainingLoad(): Promise<TrainingLoad[]> {
  return loadJson(`${base}data/garmin/training-load.json`, TrainingLoadListSchema)
}

export const fetchBodyBattery = getBodyBattery
export const fetchSleepSummaries = getSleepSummaries
export const fetchBiometrics = getBiometrics
export const fetchTrainingLoad = getTrainingLoad

// Load summaries for many dates, keeping only the ones that resolve so a single
// missing/invalid day does not blank the whole dashboard. Order follows `dates`.
export async function getDailySummaries(dates: string[]): Promise<DailySummary[]> {
  const results = await Promise.allSettled(dates.map(getDailySummary))
  return results
    .filter((r): r is PromiseFulfilledResult<DailySummary> => r.status === 'fulfilled')
    .map((r) => r.value)
}

// Load heart-rate summaries for many dates, dropping any that fail so a single
// missing/invalid day does not blank the dashboard. Order follows `dates`.
export async function getHeartRateSummaries(dates: string[]): Promise<HeartRateSummary[]> {
  const results = await Promise.allSettled(dates.map(getHeartRateSummary))
  return results
    .filter((r): r is PromiseFulfilledResult<HeartRateSummary> => r.status === 'fulfilled')
    .map((r) => r.value)
}

export function sumSteps(summaries: Pick<DailySummary, 'steps'>[]): number {
  return summaries.reduce((total, s) => total + s.steps, 0)
}

