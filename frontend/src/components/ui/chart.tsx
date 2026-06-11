import * as React from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

/** Per-series chart metadata: a label, an optional icon, and a theme color. */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    color?: string
  }
>

type ChartContextValue = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider
export function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

/** Emit `--color-<key>` CSS variables scoped to a single chart instance. */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorEntries = Object.entries(config).filter(([, item]) => item.color)
  if (colorEntries.length === 0) return null

  const vars = colorEntries.map(([key, item]) => `  --color-${key}: ${item.color};`).join('\n')
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart="${id}"] {\n${vars}\n}`,
      }}
    />
  )
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/40 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

type TooltipPayloadItem = {
  name?: string
  value?: number | string
  dataKey?: string | number
  color?: string
}

/** Custom tooltip body that pulls labels/colors from the chart config. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  className,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  labelFormatter?: (label: string | number) => React.ReactNode
  valueFormatter?: (value: number | string, key: string) => React.ReactNode
  className?: string
}) {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        'min-w-[9rem] rounded-lg border border-border/70 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur',
        className,
      )}
    >
      {label != null && (
        <div className="mb-1.5 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const meta = config[key]
          const color = meta?.color ?? item.color ?? 'hsl(var(--foreground))'
          const value = item.value ?? ''
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ backgroundColor: color }}
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
