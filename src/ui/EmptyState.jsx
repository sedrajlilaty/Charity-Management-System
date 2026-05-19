export function EmptyState({ icon: Icon, title = 'There is no data', description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={40} className="text-gray-300 mb-3" />}
      <p className="text-base font-medium text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}