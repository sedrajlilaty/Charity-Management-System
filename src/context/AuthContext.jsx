import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock users for demo
const MOCK_USERS = [
  { id: 1, name: 'sedra admin',    email: 'admin@charity.org',    role: 'admin',       avatar: 'se' },
  { id: 2, name: 'Sara moderator',   email: 'sara@charity.org',     role: 'moderator',   avatar: 'sa' },
  { id: 3, name: 'khaled',  email: 'khalid@charity.org',   role: 'fieldWorker', avatar: 'kh' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USERS[0]) // default: logged in as admin

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email)
    if (found) { setUser(found); return true }
    return false
  }

  const logout = () => setUser(null)

  const hasPermission = (permission) => {
    if (!user) return false
    return PERMISSIONS[user.role]?.includes(permission) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

// context/AuthContext.jsx
export function useAuth() {
  const context = useContext(AuthContext);
  
  // هذا السطر سيخبرك بالضبط أين المشكلة بدلاً من "Cannot destructure"
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

// ── Permission Matrix ──────────────────────────────────────
export const PERMISSIONS = {
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'donations.view', 'donations.approve', 'donations.reject',
    'beneficiaries.view', 'beneficiaries.create', 'beneficiaries.edit',
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete',
    'services.view', 'services.create', 'services.edit',
    'settings.view', 'settings.edit',
    'notifications.view',
  ],
  moderator: [
    'donations.view', 'donations.approve', 'donations.reject',
    'beneficiaries.view', 'beneficiaries.create', 'beneficiaries.edit',
    'campaigns.view', 'campaigns.edit',
    'services.view',
    'notifications.view',
  ],
  fieldWorker: [
    'beneficiaries.view', 'beneficiaries.create',
    'donations.view',
    'notifications.view',
  ],
}