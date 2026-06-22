import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Play, RefreshCcw } from 'lucide-react'
import {
  getActivities,
  getBiometrics,
  getBodyBattery,
  getDailySummaries,
  getHeartRateSummaries,
  getManifest,
  getSleepSummaries,
  getTrainingLoad,
} from '@/features/garmin/data'
import type {
  Activity,
  BiometricSummary,
  BodyBattery,
  DailySummary,
  HeartRateSummary,
  SleepSummary,
  TrainingLoad,
} from '@/features/garmin/schemas'
import {
  buildHealthKpis,
  buildKpis,
  buildTrainingReadiness,
  buildTrainingStatus,
  weeklyGoal,
} from '@/features/garmin/insights'
import { ActivityItem } from '@/components/dashboard/activity-item'
import { StatCard } from '@/components/dashboard/stat-card'
import { HeartRateChart } from '@/components/charts/heart-rate-chart'
import { StepsChart } from '@/components/charts/steps-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DAILY_STEPS_GOAL = 10000
const WEEKLY_STEPS_TARGET = 70000

type DashboardData = {
  activities: Activity[]
  summaries: DailySummary[]
  hr: HeartRateSummary[]
  bodyBattery: BodyBattery[]
  sleep: SleepSummary[]
  biometrics: BiometricSummary[]
  trainingLoad: TrainingLoad[]
  updatedAt?: string
}

const emptyData: DashboardData = {
  activities: [],
  summaries: [],
  hr: [],
  bodyBattery: [],
  sleep: [],
  biometrics: [],
  trainingLoad: [],
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData>(emptyData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const manifest = await getManifest()
        const dates = [...manifest.dates].sort()
        const [summaries, hr, activities, bodyBattery, sleep, biometrics, trainingLoad] =
          await Promise.allSettled([
            getDailySummaries(dates),
            getHeartRateSummaries(dates),
            getActivities(),
            getBodyBattery(),
            getSleepSummaries(),
            getBiometrics(),
            getTrainingLoad(),
          ])

        if (!cancelled) {
          setData({
            summaries: valueOr(summaries, []),
            hr: valueOr(hr, []),
            activities: valueOr(activities, []),
            bodyBattery: valueOr(bodyBattery, []),
            sleep: valueOr(sleep, []),
            biometrics: valueOr(biometrics, []),
            trainingLoad: valueOr(trainingLoad, []),
            updatedAt: manifest.updatedAt,
          })
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}

function valueOr<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback
}

export function ActivityOverviewPage() {
  const { data, error } = useDashboardData()
  const kpis = useMemo(() => buildKpis(data.summaries, data.hr), [data.summaries, data.hr])
  const readiness = useMemo(
    () => buildTrainingReadiness(data.bodyBattery, data.sleep),
    [data.bodyBattery, data.sleep],
  )
  const health = useMemo(() => buildHealthKpis(data.biometrics), [data.biometrics])
  const recentActivities = useMemo(
    () => [...data.activities].sort((a, b) => b.startTimeLocal.localeCompare(a.startTimeLocal)).slice(0, 6),
    [data.activities],
  )
  const updated = formatUpdatedAt(data.updatedAt)

  return (
    <Page title="Activity Overview" eyebrow={updated ? `Updated ${updated}` : 'Live Garmin snapshot'} error={error}>
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-surface">Ready to train</h1>
          <p className="mt-xs text-sm text-on-surface-variant">
            Readiness, recovery, and recent activity in one pass.
          </p>
        </div>
        <Button>
          <Play className="h-4 w-4" />
          Start Activity
        </Button>
      </div>

      <section className="grid gap-md lg:grid-cols-12">
        <Card className="glass-card lg:col-span-8">
          <CardHeader>
            <CardTitle>Training Readiness</CardTitle>
            <CardDescription>Body battery and sleep blend</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-lg sm:flex-row">
            <CircularGauge score={readiness.score} label={readiness.label} />
            <div className="grid flex-1 gap-md sm:grid-cols-3">
              <Metric label="Fatigue" value={`${readiness.fatigue}%`} />
              <Metric label="Body Battery" value={displayLatest(data.bodyBattery.at(-1)?.level, '%')} />
              <Metric label="Sleep Score" value={displayLatest(data.sleep.at(-1)?.score, '')} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-container lg:col-span-4">
          <CardHeader>
            <CardTitle>Recovery Time</CardTitle>
            <CardDescription>Latest Garmin recovery estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-display-metrics text-primary">{displayLatest(health.recoveryTimeHrs, 'h')}</div>
            <ProgressBar value={health.recoveryTimeHrs ?? 0} max={36} />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-md lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <StatCard key={kpi.key} kpi={kpi} index={index} />
        ))}
      </section>

      <section className="grid gap-md lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
            <CardDescription>Daily steps vs {DAILY_STEPS_GOAL.toLocaleString()} goal</CardDescription>
          </CardHeader>
          <CardContent>
            <StepsChart
              data={data.summaries.map((s) => ({ date: s.date.slice(5), steps: s.steps }))}
              goal={DAILY_STEPS_GOAL}
            />
          </CardContent>
        </Card>

        <ActivitiesCard activities={recentActivities} />
      </section>
    </Page>
  )
}

export function HealthMetricsPage() {
  const { data, error } = useDashboardData()
  const [windowDays, setWindowDays] = useState(7)
  const bodyBattery = data.bodyBattery.slice(-windowDays)
  const sleep = data.sleep.at(-1)
  const health = useMemo(() => buildHealthKpis(data.biometrics), [data.biometrics])
  const heartRate = data.hr.slice(-windowDays).map((h) => ({
    date: h.date.slice(5),
    resting: h.restingHeartRate,
    avg: h.avgHeartRate,
  }))
  const bodyStress = bodyBattery.map((d) => ({
    date: d.date.slice(5),
    battery: d.level,
    stress: d.stressAvg,
  }))

  return (
    <Page title="Health Metrics" eyebrow={`${windowDays} day view`} error={error}>
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="text-headline-lg text-on-surface">Health Metrics</h1>
        <div className="flex rounded-lg border border-outline bg-surface-container p-xs">
          {[7, 30].map((days) => (
            <button
              key={days}
              className={[
                'rounded-md px-md py-xs text-label-caps',
                windowDays === days ? 'bg-primary text-primary-foreground' : 'text-on-surface-variant',
              ].join(' ')}
              onClick={() => setWindowDays(days)}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-md lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Body Battery vs Stress</CardTitle>
            <CardDescription>Daily recovery reserve against average stress</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={bodyStress} firstKey="battery" secondKey="stress" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Sleep Analysis</CardTitle>
            <CardDescription>{displayMinutes(sleep?.totalMinutes)} total</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-md">
            <StackedBar
              segments={[
                { label: 'Deep', value: sleep?.deepMinutes ?? 0, color: '#5d97ff' },
                { label: 'Light', value: sleep?.lightMinutes ?? 0, color: '#adc6ff' },
                { label: 'REM', value: sleep?.remMinutes ?? 0, color: '#3fe87e' },
              ]}
            />
            <div className="grid grid-cols-3 gap-sm">
              <Metric label="Deep" value={displayMinutes(sleep?.deepMinutes)} />
              <Metric label="Light" value={displayMinutes(sleep?.lightMinutes)} />
              <Metric label="REM" value={displayMinutes(sleep?.remMinutes)} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-md lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Respiration</CardTitle>
          </CardHeader>
          <CardContent>
            <Metric label="Breaths/min" value={displayLatest(health.respirationBrpm, '')} />
            <ProgressBar value={health.respirationBrpm ?? 0} max={20} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pulse Ox</CardTitle>
          </CardHeader>
          <CardContent>
            <Metric label="SpO2" value={displayLatest(health.spo2Pct, '%')} />
            <ProgressBar value={health.spo2Pct ?? 0} max={100} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>VO2 Max</CardTitle>
          </CardHeader>
          <CardContent>
            <Metric label="ml/kg/min" value={displayLatest(health.vo2MaxMlKgMin, '')} />
            <ProgressBar value={health.vo2MaxMlKgMin ?? 0} max={70} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Heart Rate</CardTitle>
          <CardDescription>Resting vs daily average</CardDescription>
        </CardHeader>
        <CardContent>
          <HeartRateChart data={heartRate} />
        </CardContent>
      </Card>
    </Page>
  )
}

export function TrainingStatusPage() {
  const { data, error } = useDashboardData()
  const status = useMemo(() => buildTrainingStatus(data.trainingLoad), [data.trainingLoad])
  const health = useMemo(() => buildHealthKpis(data.biometrics), [data.biometrics])
  const goal = useMemo(() => weeklyGoal(data.summaries, WEEKLY_STEPS_TARGET), [data.summaries])
  const loadPoints = data.trainingLoad.slice(-14).map((d) => ({
    date: d.date.slice(5),
    load: d.acuteLoad ?? 0,
  }))

  return (
    <Page title="Training Status" eyebrow={status.label} error={error}>
      <section className="grid gap-md lg:grid-cols-12">
        <Card className="glass-card lg:col-span-8">
          <CardHeader>
            <CardTitle>Training Status</CardTitle>
            <CardDescription>Acute load and recovery balance</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-lg md:grid-cols-[220px_1fr]">
            <DialGauge value={health.vo2MaxMlKgMin ?? 0} label="VO2 Max" sublabel="ml/kg/min" />
            <div className="grid gap-md sm:grid-cols-3">
              <Metric label="Status" value={status.label} />
              <Metric label="7d Load" value={status.acuteLoad7d.toLocaleString()} />
              <Metric label="Weekly Steps" value={`${Math.round(goal.pct)}%`} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Race Predictor</CardTitle>
            <CardDescription>Simple VO2-based estimate</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-sm text-data-mono">
            <Race row="5K" value="18:42" />
            <Race row="10K" value="39:18" />
            <Race row="Half" value="1:28:40" />
            <Race row="Marathon" value="3:09:20" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-md lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acute Load</CardTitle>
            <CardDescription>14-day training load</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={loadPoints} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis width={36} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ fill: '#242424' }} />
                <Bar dataKey="load" fill="#3fe87e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Focus</CardTitle>
            <CardDescription>Last seven days</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-md">
            <Focus label="Anaerobic" value={status.loadFocus.anaerobic} max={220} />
            <Focus label="High Aerobic" value={status.loadFocus.highAerobic} max={420} />
            <Focus label="Low Aerobic" value={status.loadFocus.lowAerobic} max={520} />
          </CardContent>
        </Card>
      </section>
    </Page>
  )
}

function Page({
  title,
  eyebrow,
  error,
  children,
}: {
  title: string
  eyebrow: string
  error: string | null
  children: ReactNode
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-lg px-md py-lg md:px-margin-desktop md:py-xl">
      <div className="flex items-center justify-between gap-md">
        <div>
          <div className="text-label-caps text-primary">{eyebrow}</div>
          <div className="sr-only">{title}</div>
        </div>
        <RefreshCcw className="h-5 w-5 text-on-surface-variant" />
      </div>
      {error ? (
        <div className="rounded-lg border border-error-container bg-error-container/20 p-md text-sm text-error">
          {error}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function CircularGauge({ score, label }: { score: number; label: string }) {
  const pct = Math.max(0, Math.min(100, score))
  const radius = 70
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#242424" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#3fe87e"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="text-display-metrics text-on-surface">{score}</div>
        <div className="text-label-caps text-on-surface-variant">{label}</div>
      </div>
    </div>
  )
}

function DialGauge({ value, label, sublabel }: { value: number; label: string; sublabel: string }) {
  const pct = Math.max(0, Math.min(100, (value / 70) * 100))
  return (
    <div className="grid justify-items-center gap-sm">
      <div className="h-24 w-48 overflow-hidden">
        <div className="relative h-48 w-48 rounded-full border-[14px] border-surface-container-high">
          <div
            className="absolute inset-[-14px] rounded-full border-[14px] border-secondary"
            style={{ clipPath: `polygon(0 50%, ${pct}% 50%, ${pct}% 0, 0 0)` }}
          />
        </div>
      </div>
      <div className="text-center">
        <div className="text-display-metrics text-primary">{Math.round(value)}</div>
        <div className="text-label-caps text-on-surface-variant">{label}</div>
        <div className="text-data-mono text-on-surface-variant">{sublabel}</div>
      </div>
    </div>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="mt-md h-2 rounded-full bg-surface-container-high">
      <div className="h-full rounded-full bg-secondary" style={{ width: `${width}%` }} />
    </div>
  )
}

function StackedBar({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  return (
    <div className="grid gap-sm">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-container-high">
        {segments.map((s) => (
          <div
            key={s.label}
            title={s.label}
            style={{ width: `${total ? (s.value / total) * 100 : 0}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-sm text-label-caps text-on-surface-variant">
        {segments.map((s) => (
          <span key={s.label}>{s.label}</span>
        ))}
      </div>
    </div>
  )
}

function SimpleLineChart({
  data,
  firstKey,
  secondKey,
}: {
  data: Array<Record<string, number | string | undefined>>
  firstKey: string
  secondKey: string
}) {
  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#2d2d2d" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis width={32} tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip cursor={{ stroke: '#2d2d2d' }} />
        <Line type="monotone" dataKey={firstKey} stroke="#3fe87e" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey={secondKey} stroke="#ffb4ab" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function ActivitiesCard({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest workouts and sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="py-lg text-center text-sm text-on-surface-variant">No activities yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline bg-surface-container p-md">
      <div className="text-label-caps text-on-surface-variant">{label}</div>
      <div className="mt-xs text-2xl font-bold text-on-surface">{value}</div>
    </div>
  )
}

function Focus({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-data-mono text-on-surface-variant">{value}</span>
      </div>
      <ProgressBar value={value} max={max} />
    </div>
  )
}

function Race({ row, value }: { row: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-outline pb-sm">
      <span className="text-on-surface-variant">{row}</span>
      <span>{value}</span>
    </div>
  )
}

function displayLatest(value: number | null | undefined, unit: string): string {
  return value == null ? '—' : `${Math.round(value)}${unit}`
}

function displayMinutes(value: number | null | undefined): string {
  if (value == null) return '—'
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value % 60)
  return `${hours}h ${minutes}m`
}

function formatUpdatedAt(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
