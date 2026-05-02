import { cn } from '../utlis/helper'

export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size]
  return (
    <div className={cn('border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin', s)} />
  )
}
 
export function SpinnerPage() {
  return (
    <div className="flex items-center justify-center min-h-64" style={{ gap: '10px' }}>
      <Spinner size="lg" />
      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading...</span>
    </div>
  )
}