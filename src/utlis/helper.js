
import { clsx } from 'clsx'
export const cn = (...a) => clsx(a)

export const formatCurrency = (v, c = 'SAR') =>
    new Intl.NumberFormat('ar-SA', { style: 'currency', currency: c, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

export const formatNumber = (n) => new Intl.NumberFormat('ar-SA').format(n)
export const formatPercent = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

export const formatDate = (d) => {
    if (!d) return '—'
    return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d))
}
export const formatDateTime = (d) => {
    if (!d) return '—'
    return new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

export const STATUS_BADGE = {
    active: 'badge-success',
    approved: 'badge-success',
    completed: 'badge-success',
    pending: 'badge-warning',
    draft: 'badge-neutral',
    inactive: 'badge-neutral',
    archived: 'badge-neutral',
    rejected: 'badge-danger',
}
export const STATUS_LABEL = {
    active: 'Active', approved: 'Approved', completed: 'Completed',
    pending: 'Pending', draft: 'Draft',
    inactive: 'Inactive', archived: 'Archived', rejected: 'Rejected',
}
export const ROLE_LABEL = { admin: 'Admin', moderator: 'Moderator', fieldWorker: 'Field Worker' }
export const CATEGORY_LABEL = { orphan: 'Orphan', widow: 'Widow', poor: 'Low-income Family', elderly: 'Elderly' }
export const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }
export const PRIORITY_BADGE = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' }
