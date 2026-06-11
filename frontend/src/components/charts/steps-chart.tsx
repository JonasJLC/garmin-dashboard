import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export type StepsPoint = { date: string; steps: number }

const config: ChartConfig = {
  steps: { label: 'Steps', color: 'hsl(var(--chart-1))' },
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
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="fill-steps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-steps)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--color-steps)" stopOpacity={0.04} />
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
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{
              value: `goal ${goal.toLocaleString()}`,
              position: 'insideTopRight',
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11,
            }}
          />
        )}
        <Tooltip
          cursor={{ stroke: 'hsl(var(--border))' }}
          content={
            <ChartTooltipContent valueFormatter={(v) => Number(v).toLocaleString()} />
          }
        />
        <Area
          type="monotone"
          dataKey="steps"
          stroke="var(--color-steps)"
          strokeWidth={2.5}
          fill="url(#fill-steps)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
