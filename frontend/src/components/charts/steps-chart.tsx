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
import { getDailySummary } from '../../features/garmin/data'

type Point = { date: string; steps: number }

export function StepsChart({ dates }: { dates: string[] }) {
  const [data, setData] = useState<Point[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all(
      dates.map(async (d) => {
        try {
          const summary = await getDailySummary(d)
          return { date: d.slice(5), steps: summary.steps }
        } catch (e) {
          return { date: d.slice(5), steps: 0 }
        }
      }),
    )
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [dates])

  if (error) return <div className="text-red-600 text-sm">{error}</div>
  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="steps" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


