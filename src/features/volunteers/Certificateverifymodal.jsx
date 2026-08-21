import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, X, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { volunteersService } from '../../hooks/volunteersService'

export default function CertificateVerifyModal({ open, onClose }) {
  const { t } = useTranslation()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  // result: null | { valid: true, data: {...} } | { valid: false, message: string }
  const [result, setResult] = useState(null)

  if (!open) return null

  const handleClose = () => {
    setToken('')
    setResult(null)
    setLoading(false)
    onClose()
  }

  const handleVerify = async () => {
    const trimmed = token.trim()
    if (!trimmed) return

    setLoading(true)
    setResult(null)
    try {
      // verifyCertificate بترجع جسم الرد كامل: { valid: true, data: {...} }
      const res = await volunteersService.verifyCertificate(trimmed)
      setResult(res)
    } catch (err) {
      setResult({
        valid: false,
        message:
          err?.response?.data?.message ||
          t('volunteers.certificate.invalid', { defaultValue: 'الشهادة غير صالحة أو التوكين غير صحيح' }),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleVerify()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 22, 0.45)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, background: 'var(--surface, #ffffff)',
          borderRadius: 20, padding: 24, fontFamily: 'Cairo,sans-serif',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-primary-500, #2E7D4F)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #1A1A1A)' }}>
              {t('volunteers.certificate.title', { defaultValue: 'التحقق من شهادة التطوع' })}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{ border: 'none', background: 'var(--bg-muted, #F1F3F2)', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #5A5A5A)', marginBottom: 14 }}>
          {t('volunteers.certificate.subtitle', { defaultValue: 'أدخل رمز التحقق (Token) الموجود على الشهادة للتأكد من أنها صادرة عن المنصة.' })}
        </p>

        <input
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('volunteers.certificate.placeholder', { defaultValue: 'مثال: CERT-8F21A9C3' })}
          disabled={loading}
          style={{
            width: '100%', height: 46, borderRadius: 12, border: '1px solid var(--border-default, #D9DEDC)',
            background: 'var(--bg-muted, #F1F3F2)', padding: '0 14px', fontFamily: 'Cairo,sans-serif',
            fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: 14, color: 'var(--text-primary, #1A1A1A)',
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading || !token.trim()}
          style={{
            width: '100%', height: 46, borderRadius: 12, border: 'none',
            background: loading || !token.trim() ? 'var(--border-subtle, #D9DEDC)' : 'var(--color-primary-500, #2E7D4F)',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: loading || !token.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Cairo,sans-serif',
          }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
          {t('volunteers.certificate.verifyBtn', { defaultValue: 'تحقق الآن' })}
        </button>

        {result && (
          <div
            style={{
              marginTop: 16, borderRadius: 14, padding: 14,
              background: result.valid ? '#EAF7EF' : '#FDECEC',
              border: `1px solid ${result.valid ? '#B7E4C7' : '#F5C2C2'}`,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {result.valid ? (
                <CheckCircle2 size={18} style={{ color: '#2E7D4F' }} />
              ) : (
                <XCircle size={18} style={{ color: '#C0392B' }} />
              )}
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: result.valid ? '#2E7D4F' : '#C0392B' }}>
                {result.valid
                  ? t('volunteers.certificate.validTitle', { defaultValue: 'الشهادة نظامية وصادرة عن المنصة' })
                  : t('volunteers.certificate.invalidTitle', { defaultValue: 'الشهادة غير صالحة' })}
              </span>
            </div>

            {result.valid && result.data && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.data.volunteer_name && (
                  <span>{t('volunteers.certificate.name', { defaultValue: 'اسم المتطوع' })}: <b>{result.data.volunteer_name}</b></span>
                )}
                {result.data.campaign_name && (
                  <span>{t('volunteers.certificate.campaign', { defaultValue: 'الحملة' })}: <b>{result.data.campaign_name}</b></span>
                )}
                {result.data.total_hours != null && (
                  <span>{t('volunteers.certificate.hours', { defaultValue: 'الساعات' })}: <b>{result.data.total_hours}</b></span>
                )}
                {result.data.issued_at && (
                  <span>{t('volunteers.certificate.issuedAt', { defaultValue: 'تاريخ الإصدار' })}: <b>{result.data.issued_at}</b></span>
                )}
              </div>
            )}

            {!result.valid && result.message && (
              <span style={{ fontSize: '0.82rem', color: '#C0392B' }}>{result.message}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}