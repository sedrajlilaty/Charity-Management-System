// ─────────────────────────────────────────────
//  src/pages/Unauthorized.jsx
//  صفحة 403 — عند محاولة الدخول لصفحة ممنوعة
// ─────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowRight } from 'lucide-react'
import PermissionButton from '../../ui/PermissionButton'
export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div style={s.root}>
      <div style={s.card}>

        {/* أيقونة */}
        <div style={s.iconWrap}>
          <ShieldOff size={32} color="#ef4444" />
        </div>

        {/* النص */}
        <h1 style={s.code}>403</h1>
        <h2 style={s.title}>غير مصرح بالوصول</h2>
        <p style={s.desc}>
          ليس لديك صلاحية لعرض هذه الصفحة.
          <br />
          تواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
        </p>

        {/* زر الرجوع */}
        <PermissionButton
          onClick={() => navigate('/', { replace: true })}
          style={s.btn}
        >
          <ArrowRight size={15} />
          العودة للوحة التحكم
        </PermissionButton >

      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)',
    fontFamily: 'Cairo, sans-serif',
    direction: 'rtl',
    padding: '2rem',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    maxWidth: '400px', width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  iconWrap: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '8px',
  },
  code: {
    fontSize: '3rem', fontWeight: 900,
    color: 'var(--text-primary)', lineHeight: 1,
    margin: 0,
  },
  title: {
    fontSize: '1.2rem', fontWeight: 800,
    color: 'var(--text-primary)', margin: 0,
  },
  desc: {
    fontSize: '0.875rem', color: 'var(--text-muted)',
    lineHeight: 1.7, margin: 0,
  },
  btn: {
    marginTop: '8px',
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 24px', borderRadius: '12px',
    background: '#094037', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 700,
    fontFamily: 'Cairo, sans-serif',
    transition: 'opacity 0.2s',
  },
}