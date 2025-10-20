import * as React from 'react'

type Variant = 'default' | 'secondary' | 'outline'

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const styles =
    variant === 'secondary'
      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
      : variant === 'outline'
      ? 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
      : 'bg-blue-600 text-white'

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles} ${className ?? ''}`} {...props} />
  )
}


