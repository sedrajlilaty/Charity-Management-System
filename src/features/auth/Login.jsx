import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  EyeOff,
  LogIn,
  HeartHandshake,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

/* صور السلايدر */
import imgMedical from '../../image/Screenshot 2026-05-15 140344.png'
import imgVolunteer from '../../image/Screenshot 2026-05-15 140324.png'
import imgChild from '../../image/children.jpg'
import imgEnvironment from '../../image/Screenshot 2026-05-15 140313.png'

const SLIDES = [
  imgChild,
  imgMedical,
  imgVolunteer,
  imgEnvironment,
]

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('admin@charity.org')
  const [password, setPassword] = useState('123456')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [slide, setSlide] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    SLIDES.forEach((imgSrc) => {
      const img = new Image()
      img.src = imgSrc
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setFade(true)

      setTimeout(() => {
        setSlide((s) => (s + 1) % SLIDES.length)
        setFade(false)
      }, 350)
    }, 4000)

    return () => clearInterval(id)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    await new Promise((r) => setTimeout(r, 700))

    const ok = login(email, password)

    if (ok) {
      navigate('/')
    } else {
      setError(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      )
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>

      {/* CARD */}
      <div style={styles.wrapper}>

        {/* LEFT SIDE */}
        <div style={styles.formSection}>

          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <HeartHandshake
                size={18}
                color="#fff"
              />
            </div>

            <div>
              <p style={styles.logoTitle}>
                الجمعية الخيرية
              </p>

              <p style={styles.logoSub}>
                Charity Dashboard
              </p>
            </div>
          </div>

          {/* Welcome */}
          <div style={styles.heroText}>
            <h1 style={styles.title}>
              أهلاً بعودتك
            </h1>

            <p style={styles.subtitle}>
              قم بتسجيل الدخول للوصول إلى
              لوحة التحكم الخاصة بالجمعية
            </p>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            <button style={styles.activeTab}>
              تسجيل الدخول
            </button>

            <button style={styles.tab}>
              إنشاء حساب
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div>
              <label style={styles.label}>
                البريد الإلكتروني
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@charity.org"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                كلمة المرور
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <input
                  type={
                    showPass
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  style={{
                    ...styles.input,
                    paddingLeft: '42px',
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPass(!showPass)
                  }
                  style={styles.eyeBtn}
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                <LogIn size={16} />
              )}

              {loading
                ? 'جارٍ تسجيل الدخول...'
                : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <span>أو المتابعة عبر</span>
          </div>

          {/* Social */}
          <div style={styles.socialRow}>
            {['G', 'A', 'F'].map((x) => (
              <button
                key={x}
                style={styles.socialBtn}
              >
                {x}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <span>
              © جميع الحقوق محفوظة
            </span>

            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button style={styles.footerBtn}>
                الشروط
              </button>

              <button style={styles.footerBtn}>
                الخصوصية
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.previewSection}>

          {/* Background */}
          <div
            style={{
              ...styles.bgImage,
              backgroundImage: `url(${SLIDES[slide]})`,
              opacity: fade ? 0 : 1,
            }}
          />

          {/* Overlay */}
          <div style={styles.overlay} />

          {/* Content */}
          <div style={styles.previewContent}>

            {/* Floating Cards */}
            <div style={styles.cardsArea}>

              <div style={styles.floatCardLg}>
                <p style={styles.cardTitle}>
                  عدد المستفيدين
                </p>

                <h3 style={styles.cardNumber}>
                  +2,450
                </h3>

                <div style={styles.progress}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: '82%',
                    }}
                  />
                </div>
              </div>

              <div style={styles.floatCardSm}>
                <p style={styles.cardTitle}>
                  التبرعات الشهرية
                </p>

                <h3 style={styles.cardNumber}>
                  120K
                </h3>
              </div>

              <div style={styles.floatCardMd}>
                <p style={styles.cardTitle}>
                  الحملات النشطة
                </p>

                <h3 style={styles.cardNumber}>
                  98
                </h3>

                <div style={styles.progress}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: '65%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div style={styles.aboutBox}>
              <div style={styles.centerLogo}>
                <HeartHandshake
                  size={28}
                  color="#fff"
                />
              </div>

              <h2 style={styles.aboutTitle}>
                منصة متكاملة لإدارة العمل
                الخيري
              </h2>

              <p style={styles.aboutText}>
                نسعى لتطوير العمل الإنساني
                عبر نظام ذكي يساعد على
                إدارة التبرعات والمستفيدين
                والحملات الخيرية بكفاءة
                وسهولة وشفافية عالية.
              </p>

              {/* Dots */}
              <div style={styles.dots}>
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setSlide(i)
                    }
                    style={{
                      ...styles.dot,
                      width:
                        slide === i
                          ? '26px'
                          : '8px',
                      opacity:
                        slide === i
                          ? 1
                          : 0.45,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: '100vh',
    background: '#dbe2e8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px',
    fontFamily: 'Cairo, sans-serif',
    direction: 'rtl',
  },

  wrapper: {
    width: '100%',
    maxWidth: '1320px',
    height: '92vh',
    background: '#fff',
    borderRadius: '26px',
    overflow: 'hidden',
    display: 'flex',
    boxShadow:
      '0 20px 50px rgba(15,23,42,0.08)',
  },

  /* LEFT */

  formSection: {
    width: '46%',
    background: '#fff',
    padding: '34px 42px',
    display: 'flex',
    flexDirection: 'column',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '38px',
  },

  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg,#0b5d4f,#094037)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoTitle: {
    margin: 0,
    fontWeight: 800,
    fontSize: '1rem',
    color: '#0f172a',
  },

  logoSub: {
    margin: '2px 0 0',
    fontSize: '0.72rem',
    color: '#94a3b8',
  },

  heroText: {
    marginBottom: '28px',
    textAlign: 'center',
  },

  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f172a',
  },

  subtitle: {
    marginTop: '10px',
    color: '#64748b',
    fontSize: '0.92rem',
    lineHeight: 1.7,
  },

  tabs: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '14px',
    padding: '4px',
    marginBottom: '26px',
  },

  activeTab: {
    flex: 1,
    height: '42px',
    border: 'none',
    borderRadius: '10px',
    background: '#fff',
    fontWeight: 700,
    color: '#094037',
    cursor: 'pointer',
    boxShadow:
      '0 2px 8px rgba(15,23,42,0.06)',
    fontFamily: 'Cairo, sans-serif',
  },

  tab: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Cairo, sans-serif',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#334155',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    height: '48px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    paddingInline: '16px',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
  },

  eyeBtn: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },

  submitBtn: {
    marginTop: '10px',
    height: '50px',
    borderRadius: '14px',
    border: 'none',
    background:
      'linear-gradient(135deg,#0b6b5b,#094037)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'Cairo, sans-serif',
  },

  spinner: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border:
      '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation:
      'spin 0.7s linear infinite',
  },

  errorBox: {
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    color: '#be123c',
    fontSize: '0.82rem',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '26px 0 18px',
    color: '#94a3b8',
    fontSize: '0.8rem',
  },

  socialRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },

  socialBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#475569',
  },

  footer: {
    marginTop: 'auto',
    paddingTop: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#94a3b8',
    fontSize: '0.75rem',
  },

  footerBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontFamily: 'Cairo, sans-serif',
  },

  /* RIGHT */

  previewSection: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    background: '#073b35',
  },

  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 0.35s ease',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to bottom, rgba(6,78,59,0.78), rgba(3,35,31,0.94))',
    backdropFilter: 'blur(1px)',
  },

  previewContent: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '36px',
  },

  cardsArea: {
    position: 'relative',
    height: '340px',
  },

  floatCardLg: {
    width: '260px',
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '22px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    position: 'absolute',
    top: '20px',
    right: '80px',
    boxShadow:
      '0 15px 35px rgba(0,0,0,0.18)',
  },

  floatCardMd: {
    width: '230px',
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '20px',
    padding: '18px',
    position: 'absolute',
    top: '170px',
    left: '60px',
    boxShadow:
      '0 15px 35px rgba(0,0,0,0.18)',
  },

  floatCardSm: {
    width: '190px',
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '20px',
    padding: '16px',
    position: 'absolute',
    top: '90px',
    left: '140px',
    boxShadow:
      '0 15px 35px rgba(0,0,0,0.18)',
  },

  cardTitle: {
    margin: 0,
    fontSize: '0.76rem',
    color: '#64748b',
    fontWeight: 700,
  },

  cardNumber: {
    margin: '10px 0',
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#094037',
  },

  progress: {
    width: '100%',
    height: '7px',
    borderRadius: '999px',
    background: '#dbe4e7',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#0b6b5b,#0f9f86)',
  },

  aboutBox: {
    textAlign: 'center',
    maxWidth: '520px',
    margin: '0 auto 20px',
  },

  centerLogo: {
    width: '68px',
    height: '68px',
    borderRadius: '22px',
    background:
      'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(12px)',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aboutTitle: {
    margin: 0,
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.4,
  },

  aboutText: {
    marginTop: '18px',
    fontSize: '1rem',
    lineHeight: 1.9,
    color: 'rgba(255,255,255,0.78)',
  },

  dots: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '26px',
  },

  dot: {
    height: '8px',
    borderRadius: '999px',
    border: 'none',
    background: '#fff',
    cursor: 'pointer',
    transition: '0.3s',
  },
}