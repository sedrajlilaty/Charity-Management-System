// ─────────────────────────────────────────────
// 2) components/RoleRedirect.jsx
// ضعه في مسار "/" بدلاً من <Dashboard /> مباشرة
// يوجّه تلقائياً حسب الدور
// ─────────────────────────────────────────────
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HOME_BY_ROLE = {
  admin:       '/dashboard',
  supervisor:  '/dashboard',
  fieldWorker: '/campaigns',
}

export default function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const target = HOME_BY_ROLE[user.role] ?? '/campaigns'
  return <Navigate to={target} replace />
}