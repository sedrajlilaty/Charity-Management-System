// features/auth/Login.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Eye,
  EyeOff,
  LogIn,
  HeartHandshake,
  Mail,
  LockKeyhole,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

// الصفحة الرئيسية لكل دور
const HOME_BY_ROLE = {
  admin: '/dashboard',
  supervisor: '/dashboard',
  fieldWorker: '/campaigns',
}

// الصور
import imgMedical from '../../image/Screenshot 2026-05-15 140344.png'
import imgVolunteer from '../../image/Screenshot 2026-05-15 140324.png'
import imgChild from '../../image/children.jpg'
import imgEnvironment from '../../image/Screenshot 2026-05-15 140313.png'

const SLIDES = [
  {
    image: imgChild,
    title: 'نغيّر حياة الأطفال',
    sub: 'نسعى لمستقبل أفضل لكل طفل محتاج',

    stats: [
      {
        title: 'الأطفال المكفولين',
        value: '2,480',
        progress: '78%',
      },
      {
        title: 'التبرعات الشهرية',
        value: '$84K',
        progress: '64%',
      },
    ],
  },

  {
    image: imgMedical,
    title: 'رعاية صحية للجميع',
    sub: 'توفير الخدمات الطبية لمن لا يقدر عليها',

    stats: [
      {
        title: 'الحالات الطبية',
        value: '1,320',
        progress: '72%',
      },
      {
        title: 'العمليات المدعومة',
        value: '285',
        progress: '48%',
      },
    ],
  },

  {
    image: imgVolunteer,
    title: 'متطوعون بقلب كبير',
    sub: 'آلاف المتطوعين يعملون يداً بيد كل يوم',

    stats: [
      {
        title: 'المتطوعون النشطون',
        value: '950',
        progress: '82%',
      },
      {
        title: 'ساعات التطوع',
        value: '14K',
        progress: '67%',
      },
    ],
  },

  {
    image: imgEnvironment,
    title: 'نحمي بيئتنا',
    sub: 'مبادرات بيئية لغدٍ أكثر خضرة',

    stats: [
      {
        title: 'الأشجار المزروعة',
        value: '12,500',
        progress: '88%',
      },
      {
        title: 'الحملات البيئية',
        value: '98',
        progress: '53%',
      },
    ],
  },
]

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()

  const navigate = useNavigate()

  const [email, setEmail] = useState('admin@charity.org')
  const [password, setPassword] = useState('123456')

  const [showPass, setShowPass] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [slide, setSlide] = useState(0)

  // slider
  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length)
    }, 4000)

    return () => clearInterval(id)
  }, [])

  const current = SLIDES[slide]

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    await new Promise((r) => setTimeout(r, 700))

    const user = login(email, password)

    if (user) {
      const home = HOME_BY_ROLE[user.role] ?? '/campaigns'
      navigate(home, { replace: true })
    } else {
      setError(t('auth.loginError'))
    }

    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.wrapper}>
        {/* ================= LEFT ================= */}
        <div style={s.formSection}>
          {/* Logo */}
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <HeartHandshake size={24} color="#0b4b43" />
            </div>

            <div>
              <p style={s.brandTitle}>
                {t('brand.name')}
              </p>

              <p style={s.brandSub}>
                {t('brand.subtitle')}
              </p>
            </div>
          </div>

          {/* Welcome */}
          <div style={s.header}>
            <h1 style={s.heading}>
              أهلاً بعودتك
            </h1>

            <p style={s.subHeading}>
              قم بتسجيل الدخول للمتابعة إلى لوحة التحكم
            </p>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            <button style={s.activeTab}>
              تسجيل الدخول
            </button>

            <button style={s.tab}>
              إنشاء حساب
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={s.form}
          >
            {/* Email */}
            <div>
              <label style={s.label}>
                البريد الإلكتروني
              </label>

              <div style={s.inputWrap}>
                <Mail
                  size={16}
                  color="#94a3b8"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="ادخل البريد الإلكتروني"
                  style={s.input}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={s.label}>
                كلمة المرور
              </label>

              <div style={s.inputWrap}>
                <LockKeyhole
                  size={16}
                  color="#94a3b8"
                />

                <input
                  type={
                    showPass ? 'text' : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="ادخل كلمة المرور"
                  style={s.input}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPass((p) => !p)
                  }
                  style={s.eyeBtn}
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={s.submitBtn}
            >
              {loading ? (
                <span style={s.spinner} />
              ) : (
                <>
                  <LogIn size={16} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={s.divider}>
            <span>أو المتابعة عبر</span>
          </div>

          {/* Social */}
          <div style={s.socials}>
            {['G', '', 'f', '✕'].map((scl) => (
              <button
                key={scl}
                style={s.socialBtn}
              >
                {scl}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={s.footer}>
            Copyright © Kezak. All Right Reserved
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div style={s.visualSection}>
          {/* Background */}
          <div
            style={{
              ...s.bg,
              backgroundImage: `url(${current.image})`,
            }}
          />

          {/* Overlay */}
          <div style={s.overlay} />

          {/* Floating Cards */}
          {/* Floating Statistics */}
<div style={s.floatingWrap}>
  {current.stats.map((item, index) => (
    <div
      key={item.title}
      style={{
        ...s.floatCard,
        transform:
          index === 1
            ? 'translate(120px, 40px)'
            : 'translate(0px, 0px)',
      }}
    >
      {/* Header */}
      <div style={s.floatHeader}>
        <div>
          <p style={s.floatLabel}>
            {item.title}
          </p>

          <h3 style={s.floatValue}>
            {item.value}
          </h3>
        </div>

        <div style={s.floatIcon}>
          <HeartHandshake
            size={16}
            color="#0f766e"
          />
        </div>
      </div>

      {/* Progress */}
      <div style={s.progressWrap}>
        <div
          style={{
            ...s.progressBar,
            width: item.progress,
          }}
        />
      </div>

      {/* Footer */}
      <div style={s.floatFooter}>
        <span>نسبة الإنجاز</span>
        <span>{item.progress}</span>
      </div>
    </div>
  ))}
</div>

          {/* Content */}
          <div style={s.visualContent}>
            <div style={s.visualLogo}>
              <HeartHandshake
                size={22}
                color="#fff"
              />
            </div>

            <h2 style={s.visualTitle}>
              منصة ذكية لإدارة
              <br />
              العمل الخيري
            </h2>

            <p style={s.visualSub}>
              نظام موحد يساعد الجمعيات على
              إدارة الحملات والتبرعات
              والمستفيدين بكفاءة عالية.
            </p>

            {/* Dots */}
            <div style={s.dots}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    ...s.dot,
                    width:
                      i === slide
                        ? 36
                        : 10,
                    opacity:
                      i === slide
                        ? 1
                        : 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',

    background: '#dfe7ea',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    padding: '24px',

    fontFamily: 'Cairo, sans-serif',
  },

  wrapper: {
    width: '100%',
    maxWidth: '1320px',

    minHeight: '90vh',

    background: '#ffffff',

    borderRadius: '28px',

    overflow: 'hidden',

    display: 'flex',

    boxShadow: '0 25px 80px rgba(0,0,0,0.08)',
  },

  // ================= LEFT =================

  formSection: {
    width: '42%',

    minWidth: '420px',

    background: '#ffffff',

    padding: '36px 48px',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',

    gap: '12px',

    marginBottom: '42px',
  },

  brandIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    background: '#e7f3ef',

    border: '1px solid #cfe5de',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTitle: {
    margin: 0,

    fontSize: '1rem',
    fontWeight: 800,

    color: '#0b4b43',
  },

  brandSub: {
    margin: '4px 0 0',

    fontSize: '0.72rem',

    color: '#94a3b8',
  },

  header: {
    marginBottom: '26px',
  },

  heading: {
    margin: 0,

    fontSize: '2rem',

    fontWeight: 800,

    color: '#0f172a',
  },

  subHeading: {
    margin: '10px 0 0',

    color: '#64748b',

    fontSize: '0.95rem',

    lineHeight: 1.7,
  },

  tabs: {
    display: 'flex',

    background: '#f1f5f9',

    padding: 4,

    borderRadius: 14,

    marginBottom: '28px',
  },

  activeTab: {
    flex: 1,

    height: 42,

    border: 'none',

    borderRadius: 10,

    background: '#ffffff',

    color: '#0f172a',

    fontWeight: 700,

    fontFamily: 'Cairo, sans-serif',

    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',

    cursor: 'pointer',
  },

  tab: {
    flex: 1,

    height: 42,

    border: 'none',

    borderRadius: 10,

    background: 'transparent',

    color: '#64748b',

    fontWeight: 600,

    fontFamily: 'Cairo, sans-serif',

    cursor: 'pointer',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',

    gap: '18px',
  },

  label: {
    display: 'block',

    marginBottom: 8,

    fontSize: '0.82rem',

    fontWeight: 700,

    color: '#334155',
  },

  inputWrap: {
    height: 54,

    borderRadius: 14,

    border: '1px solid #e2e8f0',

    background: '#ffffff',

    display: 'flex',
    alignItems: 'center',

    gap: 10,

    padding: '0 16px',

    transition: '0.2s',
  },

  input: {
    flex: 1,

    border: 'none',
    outline: 'none',

    background: 'transparent',

    fontSize: '0.92rem',

    color: '#0f172a',

    fontFamily: 'Cairo, sans-serif',
  },

  eyeBtn: {
    border: 'none',
    background: 'none',

    display: 'flex',

    cursor: 'pointer',

    color: '#94a3b8',
  },

  errorBox: {
    background: '#fff1f2',

    border: '1px solid #fecdd3',

    color: '#be123c',

    padding: '12px 14px',

    borderRadius: 12,

    fontSize: '0.82rem',
  },

  submitBtn: {
    height: 54,

    border: 'none',

    borderRadius: 14,

    cursor: 'pointer',

    background:
      'linear-gradient(135deg, #0b4b43 0%, #0f766e 100%)',

    color: '#ffffff',

    fontSize: '0.95rem',

    fontWeight: 700,

    fontFamily: 'Cairo, sans-serif',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 6,

    boxShadow:
      '0 10px 24px rgba(11,75,67,0.22)',
  },

  spinner: {
    width: 18,
    height: 18,

    borderRadius: '50%',

    border:
      '2px solid rgba(255,255,255,0.3)',

    borderTopColor: '#fff',

    animation:
      'spin 0.7s linear infinite',
  },

  divider: {
    margin: '26px 0 18px',

    position: 'relative',

    textAlign: 'center',

    color: '#94a3b8',

    fontSize: '0.8rem',
  },

  socials: {
    display: 'flex',
    justifyContent: 'center',

    gap: 12,
  },

  socialBtn: {
    width: 44,
    height: 44,

    borderRadius: 12,

    border: '1px solid #e2e8f0',

    background: '#ffffff',

    cursor: 'pointer',

    fontSize: '1rem',

    color: '#334155',
  },

  footer: {
    marginTop: 'auto',

    paddingTop: '34px',

    textAlign: 'center',

    fontSize: '0.72rem',

    color: '#94a3b8',
  },

  // ================= RIGHT =================

  visualSection: {
    flex: 1,

    position: 'relative',

    overflow: 'hidden',

    background: '#0b4b43',

    display: 'flex',
    alignItems: 'flex-end',
  },

  bg: {
    position: 'absolute',
    inset: 0,

    backgroundSize: 'cover',
    backgroundPosition: 'center',

    opacity: 0.24,
  },

  overlay: {
    position: 'absolute',
    inset: 0,

    background:
      'linear-gradient(to bottom, rgba(11,75,67,0.82), rgba(3,33,29,0.96))',
  },

  floatingWrap: {
    position: 'absolute',

    top: 80,
    left: 80,

    zIndex: 2,
  },

  floatCard: {
    width: 220,

    background: 'rgba(255,255,255,0.92)',

    borderRadius: 24,

    padding: 18,

    backdropFilter: 'blur(10px)',

    boxShadow:
      '0 18px 40px rgba(0,0,0,0.18)',
  },
floatHeader: {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',

  marginBottom: 18,
},

floatLabel: {
  margin: 0,

  fontSize: '0.78rem',

  color: '#64748b',

  fontWeight: 600,
},

floatValue: {
  margin: '6px 0 0',

  fontSize: '1.7rem',

  fontWeight: 800,

  color: '#0f172a',
},

floatIcon: {
  width: 42,
  height: 42,

  borderRadius: 14,

  background: '#e6fffa',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},

progressWrap: {
  height: 10,

  borderRadius: 999,

  background: '#edf2f7',

  overflow: 'hidden',
},

progressBar: {
  height: '100%',

  borderRadius: 999,

  background:
    'linear-gradient(90deg,#0f766e,#14b8a6)',
},

floatFooter: {
  marginTop: 14,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  fontSize: '0.76rem',

  color: '#64748b',

  fontWeight: 600,
},
  floatTop: {
    display: 'flex',
    alignItems: 'center',

    gap: 10,

    marginBottom: 16,
  },

  circle: {
    width: 14,
    height: 14,

    borderRadius: '50%',

    background: '#0f766e',
  },

  line: {
    height: 10,

    width: 90,

    borderRadius: 99,

    background: '#dbeafe',
  },

  chartFake: {
    height: 90,

    borderRadius: 16,

    background: '#f8fafc',

    display: 'flex',
    alignItems: 'center',

    padding: 18,
  },

  bar: {
    height: 12,

    borderRadius: 99,

    background:
      'linear-gradient(90deg,#0f766e,#14b8a6)',
  },

  visualContent: {
    position: 'relative',

    zIndex: 2,

    padding: '70px',

    maxWidth: 580,
  },

  visualLogo: {
    width: 60,
    height: 60,

    borderRadius: 18,

    background: 'rgba(255,255,255,0.12)',

    border:
      '1px solid rgba(255,255,255,0.16)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 28,

    backdropFilter: 'blur(12px)',
  },

  visualTitle: {
    margin: 0,

    fontSize: '3rem',

    lineHeight: 1.25,

    fontWeight: 800,

    color: '#ffffff',
  },

  visualSub: {
    margin: '22px 0 34px',

    fontSize: '1rem',

    lineHeight: 1.9,

    color: 'rgba(255,255,255,0.72)',
  },

  dots: {
    display: 'flex',
    alignItems: 'center',

    gap: 8,
  },

  dot: {
    height: 10,

    borderRadius: 999,

    border: 'none',

    background: '#ffffff',

    cursor: 'pointer',

    transition: '0.3s',
  },
}