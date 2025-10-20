import * as React from 'react'

export function Progress({ value = 0, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ${className ?? ''}`} {...props}>
      <div className="h-full bg-blue-600 transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}


