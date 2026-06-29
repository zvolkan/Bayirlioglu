'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/constants'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  href?: string
}

const variantClasses = {
  primary: cn(
    BRAND.colors.accentPrimary,
    'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm'
  ),
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
  outline: cn(
    'border-2',
    BRAND.colors.primaryBorder,
    BRAND.colors.primaryText,
    'bg-transparent font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-50'
  ),
  ghost: 'text-gray-600 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2',
  danger:
    'bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  href,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    (isLoading || disabled) && 'opacity-70 cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
    className
  )

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  )
}
