import type { ReactNode } from 'react'

export type ChartConfig = Record<string, { label?: ReactNode; color?: string }>

type TooltipPayloadItem = {
  name?: string
  value?: number | string
  dataKey?: string | number
  color?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  valueFormatter,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  config: ChartConfig
  valueFormatter?: (value: number | string, key: string) => ReactNode
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[9rem] rounded-lg border border-border/70 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label != null && <div className="mb-1.5 font-medium text-foreground">{label}</div>}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const meta = config[key]
          const value = item.value ?? ''
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ backgroundColor: meta?.color ?? item.color }}
                />
                {meta?.label ?? item.name ?? key}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {valueFormatter ? valueFormatter(value, key) : value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
