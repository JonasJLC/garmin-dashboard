import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getHeartRateSummary } from '../../features/garmin/data'

type Point = { date: string; resting?: number; avg?: number }

export function HeartRateChart({ dates }: { dates: string[] }) {
  const [data, setData] = useState<Point[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all(
      dates.map(async (d) => {
        try {
          const summary = await getHeartRateSummary(d)
          return { date: d.slice(5), resting: summary.restingHeartRate, avg: summary.avgHeartRate }
        } catch {
          // Leave the point's values undefined so recharts renders a gap rather than a fake zero.
          return { date: d.slice(5) }
        }
      }),
    )
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [dates])

  if (error) return <div className="text-red-600 text-sm">{error}</div>

  const hasValues = data.some((p) => p.resting != null || p.avg != null)
  if (!hasValues) {
    return <div className="flex h-60 items-center justify-center text-sm text-gray-500">No heart rate data available.</div>
  }

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="resting" stroke="#16a34a" dot={false} name="Resting" />
          <Line type="monotone" dataKey="avg" stroke="#ef4444" dot={false} name="Avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
