import { cn } from '../utlis/helper'

export function ProgressBar({ value, max, color = 'primary' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colorClass = {
    primary:   'bg-primary-500',
    secondary: 'bg-secondary-500',
    success:   'bg-green-500',
    warning:   'bg-amber-500',
    danger:    'bg-red-500',
  }[color] ?? 'bg-primary-500'
 
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}