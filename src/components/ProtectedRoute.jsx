// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ routeKey, children }) {
  const { user, canAccessRoute } = useAuth()
  const location = useLocation()

  // غير مسجل → Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ليس لديه صلاحية → Unauthorized
  if (routeKey && !canAccessRoute(routeKey)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}