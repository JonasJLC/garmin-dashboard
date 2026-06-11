import { useEffect, useMemo, useState } from 'react'
import {
  getActivities,
  getDailySummaries,
  getHeartRateSummaries,
  getManifest,
} from './features/garmin/data'
import type { Activity, DailySummary, HeartRateSummary } from './features/garmin/schemas'
import { buildHeadline, buildKpis, weeklyGoal } from './features/garmin/insights'
import { StepsChart } from './components/charts/steps-chart'
import { HeartRateChart } from './components/charts/heart-rate-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { ThemeToggle } from './components/ui/theme-toggle'
import { StatCard } from './components/dashboard/stat-card'
import { InsightBanner } from './components/dashboard/insight-banner'
import { GoalRing } from './components/dashboard/goal-ring'
import { ActivityItem } from './components/dashboard/activity-item'

const WEEKLY_STEPS_TARGET = 70000
const DAILY_STEPS_GOAL = 10000

function formatUpdatedAt(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function App() {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [hrSummaries, setHrSummaries] = useState<HeartRateSummary[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getManifest()
      // Charts expect oldest-to-newest; the manifest lists newest first.
      .then((manifest) => {
        setUpdatedAt(manifest.updatedAt)
        const sorted = [...manifest.dates].sort()
        return Promise.all([getDailySummaries(sorted), getHeartRateSummaries(sorted)])
      })
      .then(([daily, hr]) => {
        setSummaries(daily)
        setHrSummaries(hr)
      })
      .catch((e) => setError(String(e)))
    getActivities()
      .then(setActivities)
      .catch((e) => setError(String(e)))
  }, [])

  const stepsPoints = useMemo(
    () => summaries.map((s) => ({ date: s.date.slice(5), steps: s.steps })),
    [summaries],
  )
  const hrPoints = useMemo(
    () =>
      hrSummaries.map((h) => ({
        date: h.date.slice(5),
        resting: h.restingHeartRate,
        avg: h.avgHeartRate,
      })),
    [hrSummaries],
  )
  const kpis = useMemo(() => buildKpis(summaries, hrSummaries), [summaries, hrSummaries])
  const headline = useMemo(() => buildHeadline(summaries, hrSummaries), [summaries, hrSummaries])
  const goal = useMemo(() => weeklyGoal(summaries, WEEKLY_STEPS_TARGET), [summaries])

  const recentActivities = useMemo(
    () =>
      [...(activities ?? [])]
        .sort((a, b) => b.startTimeLocal.localeCompare(a.startTimeLocal))
        .slice(0, 6),
    [activities],
  )

  const ready = summaries.length > 0
  const updatedLabel = formatUpdatedAt(updatedAt)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Garmin</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Activity overview{updatedLabel ? ` · updated ${updatedLabel}` : ''}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Story */}
        <InsightBanner headline={headline.headline} detail={headline.detail} />

        {/* KPI row */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <StatCard key={kpi.key} kpi={kpi} index={i} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
              <CardDescription>
                Daily steps over {summaries.length} days vs a {DAILY_STEPS_GOAL.toLocaleString()} goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ready ? (
                <StepsChart data={stepsPoints} goal={DAILY_STEPS_GOAL} />
              ) : (
                <ChartSkeleton />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Heart Rate</CardTitle>
              <CardDescription>Resting vs daily average (bpm)</CardDescription>
            </CardHeader>
            <CardContent>{ready ? <HeartRateChart data={hrPoints} /> : <ChartSkeleton />}</CardContent>
          </Card>
        </section>

        {/* Goal + activities */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
              <CardDescription>{WEEKLY_STEPS_TARGET.toLocaleString()} steps</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-2">
              <GoalRing {...goal} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest workouts and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No activities yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentActivities.map((a) => (
                    <ActivityItem key={a.id} activity={a} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-md bg-muted/50" />
}

export default App
