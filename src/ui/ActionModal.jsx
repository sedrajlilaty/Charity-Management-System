// ui/ActionModal.jsx
import { Check, X, Archive, Edit2, Trash2, Eye } from 'lucide-react'

export function ActionModal({ row, isOpen, onClose, onAction }) {
  if (!isOpen || !row) return null

  // full_name أو name للتوافق مع البيانات القديمة
  const displayName = row.full_name || row.name || '—'

  const actions = [
    {
      key: 'view',
      label: 'عرض التفاصيل',
      icon: <Eye size={15} />,
      color: '#094037',
      bg: 'rgba(9,64,55,0.08)',
      show: true,
    },
    {
      key: 'approve',
      label: 'قبول ونشر',
      icon: <Check size={15} />,
      color: '#fff',
      bg: '#094037',
      show: row.status === 'pending',
    },
    {
      key: 'reject',
      label: 'رفض',
      icon: <X size={15} />,
      color: '#dc2626',
      bg: '#fee2e2',
      border: '1px solid #fecaca',
      show: row.status === 'pending',
    },
    {
      key: 'edit',
      label: 'تعديل البيانات',
      icon: <Edit2 size={15} />,
      color: '#78350f',
      bg: '#fef3c7',
      show: true,
    },
    {
      key: 'archive',
      label: 'أرشفة',
      icon: <Archive size={15} />,
      color: 'var(--text-secondary)',
      bg: 'var(--bg-muted)',
      border: '1px solid var(--border-default)',
      show: row.status === 'active',
    },
    {
      key: 'delete',
      label: 'حذف',
      icon: <Trash2 size={15} />,
      color: '#dc2626',
      bg: '#fee2e2',
      border: '1px solid #fecaca',
      show: true,
    },
  ].filter(a => a.show)

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--bg-surface)', borderRadius: 16,
        padding: '20px', minWidth: 260, zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        fontFamily: 'Cairo, sans-serif', direction: 'rtl',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            إجراءات
          </h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {displayName}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actions.map(action => (
            <button
              key={action.key}
              onClick={() => { onAction(action.key, row); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                border: action.border || 'none',
                cursor: 'pointer',
                background: action.bg,
                color: action.color,
                fontSize: '0.85rem', fontWeight: 600,
                fontFamily: 'Cairo, sans-serif',
                transition: 'opacity 0.15s',
                textAlign: 'right',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{
            marginTop: 12, width: '100%', padding: '9px',
            borderRadius: 10, border: '1px solid var(--border-default)',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '0.83rem',
            fontFamily: 'Cairo, sans-serif', fontWeight: 500,
          }}
        >
          إلغاء
        </button>
      </div>
    </>
  )
}