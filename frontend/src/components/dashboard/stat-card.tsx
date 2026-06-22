import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { KpiStat } from '@/features/garmin/insights'

const ACCENTS: Record<string, string> = {
  steps: '#3fe87e',
  resting: '#ffb4ab',
  calories: '#ffb693',
  distance: '#5d97ff',
}

function Sparkline({ series, color, gradientId }: { series: number[]; color: string; gradientId: string }) {
  if (series.length < 2) return <div className="h-12" />
  const data = series.map((v, i) => ({ i, v }))
  return (
    <div className="h-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function DeltaBadge({ deltaPct, goodWhen }: Pick<KpiStat, 'deltaPct' | 'goodWhen'>) {
  if (deltaPct === null || Math.abs(deltaPct) < 0.5) {
    return (
      <Badge variant="muted">
        <Minus className="h-3 w-3" />
        flat
      </Badge>
    )
  }
  const up = deltaPct > 0
  const good = goodWhen === 'up' ? up : !up
  return (
    <Badge variant={good ? 'success' : 'destructive'}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(Math.round(deltaPct))}%
    </Badge>
  )
}

export function StatCard({ kpi, index = 0 }: { kpi: KpiStat; index?: number }) {
  const color = ACCENTS[kpi.key] ?? '#ffb693'
  return (
    <Card
      className="animate-fade-in-up overflow-hidden p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {kpi.label}
        </span>
        <DeltaBadge deltaPct={kpi.deltaPct} goodWhen={kpi.goodWhen} />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums tracking-tight">{kpi.display}</span>
        <span className="text-sm text-muted-foreground">{kpi.unit}</span>
      </div>
      <div className="mt-3">
        <Sparkline series={kpi.series} color={color} gradientId={`spark-${kpi.key}`} />
      </div>
    </Card>
  )
}
