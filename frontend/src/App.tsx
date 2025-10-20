import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { getActivities } from './features/garmin/data'
import { StepsChart } from './components/charts/steps-chart'
import { HeartRateChart } from './components/charts/heart-rate-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Separator } from './components/ui/separator'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { ThemeToggle } from './components/ui/theme-toggle'

type Activity = {
  id: number
  name: string
  startTimeLocal: string
  durationSec: number
  distanceKm?: number
  avgHr?: number
  type?: string
}

function App() {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActivities()
      .then(setActivities)
      .catch((e) => setError(String(e)))
  }, [])

  const dates = useMemo(() => ['2025-10-16','2025-10-17','2025-10-18','2025-10-19','2025-10-20'], [])

  const weeklyStepsTarget = 60000
  const progressValue = 100 * (/* naive sum from chart mock values */ (8421+10934+7032+12680+9342) / weeklyStepsTarget)

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
              <CardDescription>Last 5 days</CardDescription>
            </CardHeader>
            <CardContent>
              <StepsChart dates={dates} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
              <CardDescription>60,000 steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Progress</span>
                <Badge>{Math.round(progressValue)}%</Badge>
              </div>
              <Progress value={progressValue} />
              <Separator className="my-4" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Data shown from mock files under <code>public/data/garmin</code>.</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Heart Rate</CardTitle>
              <CardDescription>Resting vs average (last 5 days)</CardDescription>
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
