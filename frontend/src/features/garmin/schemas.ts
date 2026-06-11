import { z } from 'zod'

export const ManifestSchema = z.object({
  dates: z.array(z.string()),
  updatedAt: z.string().optional(),
})

export type Manifest = z.infer<typeof ManifestSchema>

export const DailySummarySchema = z.object({
  date: z.string(),
  steps: z.number().nonnegative(),
  calories: z.number().nonnegative().optional(),
  distanceKm: z.number().nonnegative().optional(),
})

export type DailySummary = z.infer<typeof DailySummarySchema>

export const HeartRateSummarySchema = z.object({
  date: z.string(),
  restingHeartRate: z.number().int().positive().optional(),
  avgHeartRate: z.number().int().positive().optional(),
})

export type HeartRateSummary = z.infer<typeof HeartRateSummarySchema>

export const ActivitySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  startTimeLocal: z.string(),
  durationSec: z.number().nonnegative(),
  distanceKm: z.number().nonnegative().optional(),
  avgHr: z.number().int().positive().optional(),
  type: z.string().optional(),
})

export type Activity = z.infer<typeof ActivitySchema>

export const ActivitiesSchema = z.array(ActivitySchema)


