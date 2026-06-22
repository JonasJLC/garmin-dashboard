import * as React from 'react'

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold'
const variants = {
  default: 'bg-primary text-primary-foreground',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={[base, variants[variant], className].filter(Boolean).join(' ')} {...props} />
  )
}
