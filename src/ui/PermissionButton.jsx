// ui/PermissionButton.jsx
// يعتمد على useAuth مباشرة — لا تعارض مع أي ملف
import { useAuth } from '../context/AuthContext'

/**
 * زر ذكي — يختفي تلقائياً إذا لم يكن للمستخدم الصلاحية
 *
 * @param {string}  permission - اسم الصلاحية من PERMISSIONS
 * @param {string}  variant    - 'primary' | 'danger' | 'success' | 'ghost'
 * @param {boolean} disabled   - تعطيل الزر مع إبقائه ظاهراً
 *
 * @example
 * <PermissionButton permission="donations.add" variant="primary">
 *   <Plus size={15} /> إضافة تبرع
 * </PermissionButton>
 */
export default function PermissionButton({
  permission,
  children,
  onClick,
  style,
  disabled = false,
  variant = 'primary',
}) {
  const { hasPermission } = useAuth()

  // لا يظهر الزر أصلاً إذا لم تكن الصلاحية موجودة
  if (!hasPermission(permission)) return null

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.82rem',
    fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }

  const variants = {
    primary: { background: '#094037', color: '#fff' },
    danger:  { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
    success: { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' },
    warning: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    ghost:   { background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' },
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}


// ── مكوّن مساعد: يخفي أي محتوى حسب الصلاحية ────────────────
/**
 * @example
 * <Can permission="users.delete">
 *   <button>حذف</button>
 * </Can>
 */
export function Can({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? children : fallback
}