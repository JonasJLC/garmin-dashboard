import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export type StepsPoint = { date: string; steps: number }

export function StepsChart({ data }: { data: StepsPoint[] }) {
  if (data.length === 0) {
    return <div className="flex h-60 items-center justify-center text-sm text-gray-500">No step data available.</div>
  }
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
