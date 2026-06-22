import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export type StepsPoint = { date: string; steps: number }

const config: ChartConfig = {
  steps: { label: 'Steps', color: '#3fe87e' },
}

export function StepsChart({ data, goal }: { data: StepsPoint[]; goal?: number }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No step data available.
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={256} className="text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/40 [&_.recharts-surface]:outline-none">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="fill-steps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.steps.color} stopOpacity={0.45} />
            <stop offset="95%" stopColor={config.steps.color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          fontSize={11}
        />
        <YAxis
          width={36}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        {goal != null && (
          <ReferenceLine
            y={goal}
            stroke="#e2bfb0"
            strokeDasharray="4 4"
            label={{
              value: `goal ${goal.toLocaleString()}`,
              position: 'insideTopRight',
              fill: '#e2bfb0',
              fontSize: 11,
            }}
          />
        )}
        <Tooltip
          cursor={{ stroke: '#2d2d2d' }}
          content={
            <ChartTooltipContent config={config} valueFormatter={(v) => Number(v).toLocaleString()} />
          }
        />
        <Area
          type="monotone"
          dataKey="steps"
          stroke={config.steps.color}
          strokeWidth={2.5}
          fill="url(#fill-steps)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
