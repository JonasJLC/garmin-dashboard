import { z } from 'zod'
import {
  ActivitiesSchema,
  DailySummarySchema,
  HeartRateSummarySchema,
  type Activity,
  type DailySummary,
  type HeartRateSummary,
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

const base = (import.meta as any).env?.BASE_URL ?? '/'

export function getDailySummary(date: string): Promise<DailySummary> {
  return loadJson(`${base}data/garmin/daily-${date}.json`, DailySummarySchema)
}

export function getHeartRateSummary(date: string): Promise<HeartRateSummary> {
  return loadJson(`${base}data/garmin/hr-${date}.json`, HeartRateSummarySchema)
}

export function getActivities(): Promise<Activity[]> {
  return loadJson(`${base}data/garmin/activities.json`, ActivitiesSchema)
}


