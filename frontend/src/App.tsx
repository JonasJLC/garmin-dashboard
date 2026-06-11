import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { getActivities, getDailySummaries, getManifest, sumSteps } from './features/garmin/data'
import type { Activity, DailySummary } from './features/garmin/schemas'
import { StepsChart } from './components/charts/steps-chart'
import { HeartRateChart } from './components/charts/heart-rate-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Separator } from './components/ui/separator'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { ThemeToggle } from './components/ui/theme-toggle'

const WEEKLY_STEPS_TARGET = 60000

function App() {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [dates, setDates] = useState<string[]>([])
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getManifest()
      // Charts expect oldest-to-newest; the manifest lists newest first.
      .then((manifest) => [...manifest.dates].sort())
      .then((sorted) => {
        setDates(sorted)
        return getDailySummaries(sorted)
      })
      .then(setSummaries)
      .catch((e) => setError(String(e)))
    getActivities()
      .then(setActivities)
      .catch((e) => setError(String(e)))
  }, [])

  const stepsPoints = useMemo(
    () => summaries.map((s) => ({ date: s.date.slice(5), steps: s.steps })),
    [summaries],
  )
  const weeklyTotal = useMemo(() => sumSteps(summaries), [summaries])
  const progressValue = WEEKLY_STEPS_TARGET > 0 ? (100 * weeklyTotal) / WEEKLY_STEPS_TARGET : 0

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Garmin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your recent activity, steps and heart rate.</p>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Steps</CardTitle>
              <CardDescription>Recent days</CardDescription>
            </CardHeader>
            <CardContent>
              <StepsChart data={stepsPoints} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
              <CardDescription>{WEEKLY_STEPS_TARGET.toLocaleString()} steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Progress</span>
                <Badge>{Math.round(progressValue)}%</Badge>
              </div>
              <Progress value={Math.min(progressValue, 100)} />
              <Separator className="my-4" />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {weeklyTotal.toLocaleString()} of {WEEKLY_STEPS_TARGET.toLocaleString()} steps across {summaries.length} day{summaries.length === 1 ? '' : 's'}.
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Heart Rate</CardTitle>
              <CardDescription>Resting vs average</CardDescription>
            </CardHeader>
            <CardContent>
              <HeartRateChart dates={dates} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>From activities.json</CardDescription>
            </CardHeader>
            <CardContent>
              {!activities && (
                <div className="text-sm text-gray-500">No data loaded.</div>
              )}
              {activities && (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {activities.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{a.name}</div>
                        <div className="truncate text-gray-500 dark:text-gray-400">{new Date(a.startTimeLocal).toLocaleString()}</div>
                      </div>
                      <div className="ml-3 shrink-0 text-right text-gray-500 dark:text-gray-400">
                        {a.distanceKm ? `${a.distanceKm.toFixed(1)} km` : ''}
                        {a.avgHr ? ` · ${a.avgHr} bpm` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
