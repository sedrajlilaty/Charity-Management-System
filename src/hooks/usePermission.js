// hooks/usePermission.js
// يستخدم hasPermission و canAccessRoute من AuthContext مباشرة
// لا تعارض مع أي ملف آخر
import { useAuth } from '../context/AuthContext'

/**
 * @example
 * const { can, canRoute, isAdmin } = usePermission()
 *
 * // في الـ JSX:
 * {can('donations.add') && <button>إضافة</button>}
 * {canRoute('settings') && <Link to="/settings">الإعدادات</Link>}
 */
export function usePermission() {
    const { user, hasPermission, canAccessRoute } = useAuth()

    return {
        /** هل يملك المستخدم هذه الصلاحية؟ */
        can: (permission) => hasPermission(permission),

        /** هل يملك المستخدم الوصول لهذه الصفحة؟ */
        canRoute: (routeKey) => canAccessRoute(routeKey),

        role: user?.role ?? '',
        isAdmin: user?.role === 'admin',
        isSupervisor: user?.role === 'supervisor',
        isFieldWorker: user?.role === 'fieldWorker',
    }
}