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
  distanceKm: z.number().nonnegative().nullable().optional(),
  avgHr: z.number().int().positive().nullable().optional(),
  type: z.string().optional(),
})

export type Activity = z.infer<typeof ActivitySchema>

export const ActivitiesSchema = z.array(ActivitySchema)

export const BodyBatterySchema = z.object({
  date: z.string(),
  level: z.number().int().min(0).max(100),
  maxLevel: z.number().int().min(0).max(100).optional(),
  drainRate: z.number().optional(),
  stressAvg: z.number().int().min(0).max(100).optional(),
})

export type BodyBattery = z.infer<typeof BodyBatterySchema>

export const BodyBatteryListSchema = z.array(BodyBatterySchema)

export const SleepSummarySchema = z.object({
  date: z.string(),
  score: z.number().int().min(0).max(100).optional(),
  totalMinutes: z.number().nonnegative().optional(),
  deepMinutes: z.number().nonnegative().optional(),
  lightMinutes: z.number().nonnegative().optional(),
  remMinutes: z.number().nonnegative().optional(),
})

export type SleepSummary = z.infer<typeof SleepSummarySchema>

export const SleepSummaryListSchema = z.array(SleepSummarySchema)

export const BiometricSummarySchema = z.object({
  date: z.string(),
  spo2Pct: z.number().min(0).max(100).optional(),
  respirationBrpm: z.number().positive().optional(),
  vo2MaxMlKgMin: z.number().positive().optional(),
  recoveryTimeHrs: z.number().nonnegative().optional(),
})

export type BiometricSummary = z.infer<typeof BiometricSummarySchema>

export const BiometricSummaryListSchema = z.array(BiometricSummarySchema)

export const TrainingLoadSchema = z.object({
  date: z.string(),
  acuteLoad: z.number().nonnegative().optional(),
  chronicLoad: z.number().nonnegative().optional(),
  anaerobicLoad: z.number().nonnegative().optional(),
  highAerobicLoad: z.number().nonnegative().optional(),
  lowAerobicLoad: z.number().nonnegative().optional(),
  trainingStatus: z.string().optional(),
})

export type TrainingLoad = z.infer<typeof TrainingLoadSchema>

export const TrainingLoadListSchema = z.array(TrainingLoadSchema)

