// features/auth/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, Mail, LockKeyhole } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

// ✏️ عدّلي المسار حسب مكان ملف اللوغو الفعلي عندك بالمشروع
import logo from '../../assets/logo-green.png'

// الصفحة الرئيسية لكل دور
const HOME_BY_ROLE = {
  admin: '/dashboard',
  supervisor: '/dashboard',
  fieldWorker: '/campaigns',
}

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)
      toast.success(t('auth.welcomeToast', { name: user.name }))
      const home = HOME_BY_ROLE[user.role] ?? '/campaigns'
      navigate(home, { replace: true })
    } catch (err) {
      toast.error(err.message ?? t('auth.loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Scoped styles لعناصر تحتاج pseudo-classes (focus/hover) ما بتنعمل بالـ inline style */}
      <style>{`
        @keyframes ataa-spin { to { transform: rotate(360deg); } }
        .ataa-input-wrap:focus-within {
          border-color: #F2C055 !important;
          background: #fffdf7 !important;
        }
        .ataa-social-btn:hover {
          border-color: #F2C055 !important;
          background: #fffdf7 !important;
        }
        .ataa-tab-btn:hover:not(.ataa-tab-active) {
          color: #334155;
        }
        .ataa-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div style={{ ...s.watermark, ...s.wm1 }} />
      <div style={{ ...s.watermark, ...s.wm2 }} />

      <div style={s.card}>
        {/* ================= Brand: Logo + Name + Tagline ================= */}
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <img src={logo} alt={t('brand.name')} style={s.brandIconImg} />
          </div>
          <h1 style={s.brandTitle}>{t('brand.name')}</h1>
          <p style={s.brandSub}>{t('brand.subtitle')}</p>
        </div>

        {/* ================= Tabs ================= */}
        <div style={s.tabs}>
          <button type="button" style={{ ...s.tabBtn, ...s.tabBtnActive }} className="ataa-tab-btn ataa-tab-active">
            {t('auth.tabs.login')}
          </button>
          <button
            type="button"
            style={s.tabBtn}
            className="ataa-tab-btn"
            onClick={() => navigate('/register')}
          >
            {t('auth.tabs.register')}
          </button>
        </div>

        {/* ================= Form ================= */}
        <form onSubmit={handleSubmit} style={s.formStack}>
          {/* Email */}
          <div>
            <label style={s.label}>{t('auth.fields.email')}</label>
            <div style={s.inputWrap} className="ataa-input-wrap">
              <Mail size={19} color="#94a3b8" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.fields.emailPlaceholder')}
                style={s.input}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={s.label}>{t('auth.fields.password')}</label>
            <div style={s.inputWrap} className="ataa-input-wrap">
              <LockKeyhole size={19} color="#94a3b8" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.fields.passwordPlaceholder')}
                style={s.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={s.eyeBtn}
                aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPass ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={s.forgotRow}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              style={s.forgotLink}
              className="ataa-link"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={s.submitBtn}>
            {loading ? (
              <span style={s.spinner} />
            ) : (
              <>
                <LogIn size={19} />
                {t('auth.submit')}
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={s.divider}>{t('auth.orContinueWith')}</div>

        {/* Socials */}
        <div style={s.socials}>
          {['G', 'f', '', '✕'].map((scl) => (
            <button key={scl} type="button" style={s.socialBtn} className="ataa-social-btn">
              {scl}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={s.footerRow}>
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={s.footerLink}
            className="ataa-link"
          >
            {t('auth.registerNow')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    position: 'relative',
    overflow: 'hidden',
    background: 'radial-gradient(circle at 78% 12%, #1f6d61, #0b3530 62%)',
    fontFamily: 'Cairo, sans-serif',
  },

  watermark: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${logo})`,
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  },
  wm1: {
    backgroundSize: '620px',
    backgroundPosition: '88% 8%',
    opacity: 0.09,
    filter: 'brightness(4)',
  },
  wm2: {
    backgroundSize: '380px',
    backgroundPosition: '4% 105%',
    opacity: 0.07,
    filter: 'brightness(4)',
  },

  card: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '660px',
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '30px',
    padding: '40px 64px 34px',
    boxShadow: '0 35px 90px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  // ---- Brand ----
  brand: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: '#e7f3ef',
    border: '2px solid #F2C055',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(242,192,85,0.25)',
  },
  brandIconImg: {
    width: 46,
    height: 46,
    objectFit: 'contain',
  },
  brandTitle: {
    margin: '4px 0 0',
    fontSize: '1.9rem',
    fontWeight: 900,
    color: '#0b4b43',
    letterSpacing: '0.5px',
  },
  brandSub: {
    margin: 0,
    fontSize: '0.92rem',
    color: '#94a3b8',
    fontWeight: 500,
  },

  // ---- Tabs ----
  tabs: {
    display: 'flex',
    background: '#f1f5f4',
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '10px 10px',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#64748b',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all .2s ease',
  },
  tabBtnActive: {
    background: '#F2C055',
    color: '#3a2c05',
    boxShadow: '0 4px 12px rgba(242,192,85,0.4)',
  },

  // ---- Form ----
  formStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    display: 'block',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#334155',
    marginBottom: 8,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: '12px 20px',
    background: '#f8fafc',
    transition: 'border-color .2s ease, background .2s ease',
  },
  input: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '1rem',
    width: '100%',
    color: '#1f2937',
  },
  eyeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: -6,
  },
  forgotLink: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: '0.86rem',
    fontWeight: 700,
    color: '#caa03f',
    fontFamily: 'Cairo, sans-serif',
  },

  submitBtn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: 15,
    background: '#1A5C52',
    color: '#fff',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 800,
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background .2s ease, transform .1s ease',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'ataa-spin 0.7s linear infinite',
    display: 'inline-block',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#94a3b8',
    fontSize: '0.75rem',
  },

  socials: {
    display: 'flex',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    fontFamily: 'Cairo, sans-serif',
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#334155',
    cursor: 'pointer',
  },

  footerRow: {
    textAlign: 'center',
    fontSize: '0.92rem',
    color: '#64748b',
  },
  footerLink: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#caa03f',
    fontWeight: 800,
    fontFamily: 'Cairo, sans-serif',
  },
}