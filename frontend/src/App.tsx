import './App.css'
import { Button } from './components/ui/button'
import { useEffect, useState } from 'react'
import { getActivities } from './features/garmin/data'
import { StepsChart } from './components/charts/steps-chart'

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Garmin Dashboard</h1>
      <div className="flex gap-3 mb-6">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Steps (last 5 days)</h2>
        <StepsChart dates={[
          // Adjust or generate as needed. This is a placeholder sequence example
          '2025-10-16','2025-10-17','2025-10-18','2025-10-19','2025-10-20'
        ]} />
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Recent Activities</h2>
        {!activities && <div className="text-sm text-gray-500">No data yet. Commit JSON under <code>frontend/public/data/garmin/activities.json</code>.</div>}
        {activities && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border rounded-md">
            {activities.map((a) => (
              <li key={a.id} className="p-3 text-sm flex justify-between">
                <span className="font-medium">{a.name}</span>
                <span className="text-gray-500">
                  {a.distanceKm ? `${a.distanceKm.toFixed(2)} km` : ''} {a.avgHr ? ` · ${a.avgHr} bpm` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
