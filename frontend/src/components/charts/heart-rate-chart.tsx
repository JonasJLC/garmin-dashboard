import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export type HeartRatePoint = { date: string; resting?: number; avg?: number }

const config: ChartConfig = {
  resting: { label: 'Resting', color: '#adc6ff' },
  avg: { label: 'Average', color: '#ffb4ab' },
}

export function HeartRateChart({ data }: { data: HeartRatePoint[] }) {
  const hasValues = data.some((p) => p.resting != null || p.avg != null)
  if (!hasValues) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No heart rate data available.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={256} className="text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/40 [&_.recharts-surface]:outline-none">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          fontSize={11}
        />
        <YAxis width={32} tickLine={false} axisLine={false} fontSize={11} domain={['dataMin - 4', 'dataMax + 4']} />
        <Tooltip
          cursor={{ stroke: '#2d2d2d' }}
          content={<ChartTooltipContent config={config} valueFormatter={(v) => `${v} bpm`} />}
        />
        <Line
          type="monotone"
          dataKey="resting"
          name="Resting"
          stroke={config.resting.color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="avg"
          name="Average"
          stroke={config.avg.color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
