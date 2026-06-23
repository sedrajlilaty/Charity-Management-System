import { createContext, useContext, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

// ── تحويل الـ role من الباك اند للداشبورد ──────────
const mapRole = (backendRole) => {
  switch (backendRole) {
    case 'admin':        return 'admin'
    case 'sub_admin':    return 'supervisor'
    case 'field_worker': return 'fieldWorker'
    default:             return null // user عادي ما بيدخل الداشبورد
  }
}

// ── جدول الصلاحيات ──────────────────────────────────
export const PERMISSIONS = {
  admin: ['*'],

  supervisor: [
    'donations.view', 'donations.edit', 'donations.approve', 'donations.reject',
    'beneficiaries.view', 'beneficiaries.add', 'beneficiaries.edit',
    'beneficiaries.approve', 'beneficiaries.reject',
    'campaigns.view',
    'volunteers.view', 'volunteers.approve', 'volunteers.reject',
    'dashboard.view', 'services.view', 'notifications.view', 'ai.use',
  ],

  fieldWorker: [
    'campaigns.view', 'campaigns.viewVolunteers',
    'volunteers.view', 'volunteers.setHours',
    'notifications.view', 'ai.use',
  ],
}

export const ROUTE_PERMISSIONS = {
  dashboard:      ['admin', 'supervisor'],
  donations:      ['admin', 'supervisor'],
  beneficiaries:  ['admin', 'supervisor'],
  campaigns:      ['admin', 'supervisor', 'fieldWorker'],
  services:       ['admin'],
  users:          ['admin'],
  volunteers:     ['admin', 'supervisor', 'fieldWorker'],
  notifications:  ['admin', 'supervisor', 'fieldWorker'],
  settings:       ['admin'],
  certificates:   ['admin'],
  wallet:         ['admin' ],
  'app-user':     ['admin'],
  'ai-assistant': ['admin', 'supervisor', 'fieldWorker'],
}

// ── Provider ─────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // استرجاع المستخدم من localStorage عند التحميل
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (email, password) => {
    // 1. طلب اللوغين
    const { data } = await axiosInstance.post('/signin', { email, password })
    console.log('1. signin response:', data)

    localStorage.setItem('token', data.token)

    const { data: profileData } = await axiosInstance.get('/userprofile')
    console.log('2. profile response:', profileData)

    const backendUser = profileData.user
    console.log('3. backendUser:', backendUser)

    const dashboardRole = mapRole(backendUser.role)
    console.log('4. dashboardRole:', dashboardRole)

    if (!dashboardRole) {
      console.log('5. BLOCKED - role not allowed:', backendUser.role)
      // ...
    }

    // 5. بناء الـ user object
    const userData = {
      id:     backendUser.id,
      name:   backendUser.name,
      email:  backendUser.email,
      role:   dashboardRole,
      avatar: backendUser.name?.slice(0, 2).toLowerCase() ?? 'us',
    }

    // 6. حفظ المستخدم
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return userData
  }

  const logout = async () => {
    try {
      await axiosInstance.post('/signout')
    } catch (_) {
      // حتى لو فشل الـ request نكمل الـ logout
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const hasPermission = (permission) => {
    if (!user) return false
    const perms = PERMISSIONS[user.role] ?? []
    if (perms.includes('*')) return true
    return perms.includes(permission)
  }

  const canAccessRoute = (routeKey) => {
    if (!user) return false
    const allowed = ROUTE_PERMISSIONS[routeKey]
    if (!allowed) return true
    return allowed.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canAccessRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}