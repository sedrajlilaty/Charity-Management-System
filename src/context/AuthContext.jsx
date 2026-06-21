// context/AuthContext.jsx (محدّث)
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  { id: 1, name: 'Sedra Admin',       email: 'admin@charity.org',  role: 'admin',       avatar: 'se' },
  { id: 2, name: 'Sara Supervisor',   email: 'sara@charity.org',   role: 'supervisor',  avatar: 'sa' },
  { id: 3, name: 'Khaled',            email: 'khalid@charity.org', role: 'fieldWorker', avatar: 'kh' },
  { id: 4, name: 'Ahmed Supervisor',  email: 'ahmed@charity.org',  role: 'supervisor',  avatar: 'ah' },
]

// ── جدول الصلاحيات الموحّد ─────────────────────────────────
// '*' = صلاحية كاملة على كل شيء (المدير فقط)
export const PERMISSIONS = {

  admin: ['*'],   // المدير يملك كل شيء (يشمل إصدار الشهادات وكل شيء آخر)

  supervisor: [
    // التبرعات — يدير ويوافق لكن لا يضيف/يحذف
    'donations.view',
    'donations.edit',
    'donations.approve',
    'donations.reject',

    // المستفيدون — يدير ويوافق لكن لا يحذف
    'beneficiaries.view',
    'beneficiaries.add',
    'beneficiaries.edit',
    'beneficiaries.approve',
    'beneficiaries.reject',

    // الحملات — متابعة فقط، لا ينشئ ولا يغلق
    'campaigns.view',

    // المتطوعون — يوافق ويرفض فقط
    'volunteers.view',
    'volunteers.approve',
    'volunteers.reject',

    // عام
    'dashboard.view',
    'services.view',
    'notifications.view',
    'ai.use',
  ],

  fieldWorker: [
    // متابعة الحملات فقط
    'campaigns.view',
    'notifications.view',
    'ai.use',

    // ✅ المتطوعون — عرض فقط (لازم يشوف القائمة عشان يحدد الساعات)
    'volunteers.view',

    // ✅ تحديد/تعديل ساعات التطوع لكل متطوع بحملة معينة
    'volunteers.setHours',

    // ✅ عرض متطوعي الحملة وساعاتهم من صفحة الحملات
    'campaigns.viewVolunteers',
  ],
}

// ── ملاحظة: صلاحيات الشهادات ─────────────────────────────────
// إصدار/تحميل الشهادات للأدمن فقط.
// بما أن admin يملك '*' فهو الوحيد المخوّل ضمنياً لـ 'certificates.issue'
// و'certificates.view'. لا حاجة لإضافتها لأي دور آخر.

// ── الصفحات المسموح بها لكل دور ──────────────────────────
export const ROUTE_PERMISSIONS = {
  dashboard:      ['admin', 'supervisor'],
  donations:      ['admin', 'supervisor'],
  beneficiaries:  ['admin', 'supervisor'],
  campaigns:      ['admin', 'supervisor', 'fieldWorker'],
  services:       ['admin'],
  users:          ['admin'],
  volunteers:     ['admin', 'supervisor', 'fieldWorker'], // ✅ الموظف الميداني يدخل لإدخال الساعات
  notifications:  ['admin', 'supervisor', 'fieldWorker'],
  settings:       ['admin'],
  certificates:   ['admin'], // ✅ صفحة الشهادات: أدمن فقط
  'ai-assistant': ['admin', 'supervisor', 'fieldWorker'],
}

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USERS[0])

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email)
    if (found) {
      setUser(found)
      return found        // ← يُرجع المستخدم كاملاً (مش true/false)
    }
    return null
  }

  const logout = () => setUser(null)

  /**
   * التحقق من صلاحية محددة
   * يدعم '*' للمدير (صلاحية كاملة)
   */
  const hasPermission = (permission) => {
    if (!user) return false
    const perms = PERMISSIONS[user.role] ?? []
    // المدير يملك كل شيء
    if (perms.includes('*')) return true
    return perms.includes(permission)
  }

  /**
   * التحقق من إمكانية الدخول لصفحة معينة
   */
  const canAccessRoute = (routeKey) => {
    if (!user) return false
    const allowed = ROUTE_PERMISSIONS[routeKey]
    if (!allowed) return true   // صفحة بدون قيود
    return allowed.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canAccessRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}