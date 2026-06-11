import * as React from 'react'
import { cn } from '@/lib/utils'

export function Progress({
  value = 0,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
