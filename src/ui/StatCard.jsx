import { cn } from '../utlis/helper'
 
// ── StatCard ───────────────────────────────────────────────
export function StatCard({ label, value, change, unit, icon: Icon, color = 'primary' }) {
  const positive = change > 0
  const colorMap = {
    primary:   'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    blue:      'bg-blue-50 text-blue-600',
    purple:    'bg-purple-50 text-purple-600',
  }
 
  return (
    <div className="stat-card animate-fade-in bg-emerald-900">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-amber-500">{label}</p>
        {Icon && (
          <span className={cn('p-2 rounded-xl', colorMap[color])}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-amber-50 mb-1">
        {value}
        {unit && <span className="text-base font-medium text-gray-400 mr-1">{unit}</span>}
      </p>
      {change !== undefined && (
        <p className={cn('text-xs font-medium', positive ? 'text-green-600' : 'text-red-500')}>
          {positive ? '▲' : '▼'} {Math.abs(change)}% من الشهر الماضي
        </p>
      )}
    </div>
  )
}