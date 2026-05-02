
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('admin@charity.org')
  const [password, setPassword] = useState('123456')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600)) // محاكاة طلب API
    const ok = login(email, password)
    if (ok) {
      navigate('/')
    } else {
      setError('Email or password is not correct')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
      
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Heart size={26} className="text-white" fill="white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">الجمعية الخيرية</h1>
          <p className="text-sm text-gray-500 mt-1">نظام الإدارة الداخلي</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">{t('auth.login')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {t('auth.username')} / Email
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? ' Loging in..' : t('auth.login')}
            </button>
          </form>

          {/* Demo accounts hint */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">حسابات تجريبية:</p>
            {[
              { label: 'مدير',     email: 'admin@charity.org'  },
              { label: 'مشرف',     email: 'sara@charity.org'   },
              { label: 'ميداني',   email: 'khalid@charity.org' },
            ].map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setEmail(acc.email)}
                className="block w-full text-right text-xs text-primary-600 hover:text-primary-800 py-0.5 transition-colors"
              >
                {acc.label}: {acc.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
