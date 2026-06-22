import type { WeeklyGoal } from '@/features/garmin/insights'

const SIZE = 168
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function GoalRing({ total, target, pct, days }: WeeklyGoal) {
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)
  const reached = pct >= 100

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#242424"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#ffb693"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums tracking-tight">{Math.round(pct)}%</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {reached ? 'goal hit' : 'of goal'}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{total.toLocaleString()}</span>{' '}
        / {target.toLocaleString()} steps
        <br />
        across the last {days} day{days === 1 ? '' : 's'}
      </p>
    </div>
  )
}
