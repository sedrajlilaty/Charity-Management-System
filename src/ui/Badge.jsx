import { cn, STATUS_BADGE, STATUS_LABEL } from '../utlis/helper'

export function Badge({ status, className, children }) {
  const cls = status ? STATUS_BADGE[status] ?? 'badge-neutral' : ''
  const label = children ?? (status ? STATUS_LABEL[status] : '')
  return <span className={cn('badge', cls, className)}>{label}</span>
}