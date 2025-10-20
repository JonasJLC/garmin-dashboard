import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'outline'
      ? 'border border-gray-300 dark:border-gray-700'
      : variant === 'ghost'
      ? 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'

  const sizeClass =
    size === 'sm'
      ? 'h-8 px-3 text-sm'
      : size === 'lg'
      ? 'h-12 px-6 text-base'
      : 'h-10 px-4 text-sm'

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md ${variantClass} ${sizeClass} ${className ?? ''}`}
      {...props}
    />
  )
}


