import { Activity as ActivityIcon, Bike, Dumbbell, Footprints, PersonStanding } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Activity } from '@/features/garmin/schemas'
import { formatPace } from '@/features/garmin/insights'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  running: Footprints,
  cycling: Bike,
  walking: PersonStanding,
  training: Dumbbell,
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = (activity.type && ICONS[activity.type]) || ActivityIcon
  const pace = formatPace(activity.durationSec, activity.distanceKm ?? undefined)
  const minutes = Math.round(activity.durationSec / 60)

  const stats = [
    activity.distanceKm != null ? `${activity.distanceKm.toFixed(1)} km` : null,
    `${minutes} min`,
    pace,
    activity.avgHr != null ? `${activity.avgHr} bpm` : null,
  ].filter(Boolean) as string[]

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{activity.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatWhen(activity.startTimeLocal)}
          </span>
        </div>
        <div className="mt-0.5 truncate text-sm text-muted-foreground">
          {stats.join(' · ')}
        </div>
      </div>
    </li>
  )
}
