// features/beneficiaries/BeneficiaryCaseView.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, CheckCircle, XCircle, Archive, MapPin,
  Phone, AlertCircle, ChevronRight,
  FileText, Heart, User, BookOpen, GraduationCap,
  Mail, DollarSign,
} from 'lucide-react'
import ImageUpload from '../../ui/ImageUpload'
import { Badge } from '../../ui/Badge'
import { formatCurrency } from '../../utlis/helper'

const CAT_CFG = {
  patient:            { icon: Heart,         labelKey: 'beneficiaries.categories.patient',            color: '#094037', bg: 'var(--color-primary-50)'  },
  orphan:             { icon: User,          labelKey: 'beneficiaries.categories.orphan',             color: '#094037', bg: 'var(--color-primary-100)' },
  school_student:     { icon: BookOpen,      labelKey: 'beneficiaries.categories.school_student',     color: '#92400e', bg: '#fef3c7'                  },
  university_student: { icon: GraduationCap, labelKey: 'beneficiaries.categories.university_student', color: '#92400e', bg: '#fef3c7'                  },
}

const PRI = {
  high:   { bg: '#fee2e2',                 color: '#dc2626', labelKey: 'beneficiaries.priority.high'   },
  medium: { bg: '#fef3c7',                 color: '#92400e', labelKey: 'beneficiaries.priority.medium' },
  low:    { bg: 'var(--color-primary-50)', color: '#094037', labelKey: 'beneficiaries.priority.low'    },
}

function InfoCard({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
      <p style={{ margin: '0 0 3px', fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icon && <Icon size={11} />} {label}
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

function FilePreview({ label, value }) {
  if (!value) return null
  const isImage = value.startsWith('data:image')
  return (
    <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
      <p style={{ margin: '0 0 6px', fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
      {isImage
        ? <img src={value} alt={label} style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 6 }} />
        : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} color="#094037" />
            <span style={{ fontSize: '0.78rem', color: '#094037', fontWeight: 500 }}>{label}</span>
          </div>
        )
      }
    </div>
  )
}

function ViewStep({ c }) {
  const { t } = useTranslation()
  const pri = PRI[c.priority] || PRI.medium
  const cat = CAT_CFG[c.category]
  const CatIcon = cat?.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Profile card */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-muted)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
        {c.personal_picture || c.caseImage
          ? <img src={c.personal_picture || c.caseImage} alt="" style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
          : (
            <div style={{ width: 68, height: 68, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#094037,#0a5244)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#eab308' }}>
              {c.full_name?.slice(0, 2)}
            </div>
          )
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.full_name}</h3>
          {c.title && <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#094037', fontWeight: 600 }}>📢 {c.title}</p>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge status={c.status} />
            <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: pri.bg, color: pri.color }}>
              {t('beneficiaries.priority.label')} {t(pri.labelKey)}
            </span>
            {cat && (
              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: cat.bg, color: cat.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {CatIcon && <CatIcon size={10} />} {t(cat.labelKey)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact + Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <InfoCard icon={Phone}  label={t('beneficiaries.caseView.fields.phone')}       value={c.phone} />
        {c.email && <InfoCard icon={Mail} label={t('beneficiaries.caseView.fields.email')} value={c.email} />}
        <InfoCard icon={MapPin} label={t('beneficiaries.caseView.fields.governorate')} value={c.governorate} />
        <InfoCard icon={MapPin} label={t('beneficiaries.caseView.fields.region')}      value={c.region} />
      </div>
      {c.address && <InfoCard icon={MapPin} label={t('beneficiaries.caseView.fields.address')} value={c.address} />}

      {c.description && (
        <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('beneficiaries.caseView.fields.description')}
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>{c.description}</p>
        </div>
      )}

      {c.required_amount > 0 && (
        <InfoCard icon={DollarSign} label={t('beneficiaries.caseView.fields.amount')} value={formatCurrency(c.required_amount)} />
      )}

      {/* Patient */}
      {c.category === 'patient' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <FilePreview label={t('beneficiaries.caseView.files.picture')}      value={c.personal_picture} />
          <FilePreview label={t('beneficiaries.caseView.files.medicalReport')} value={c.medical_report} />
          <FilePreview label={t('beneficiaries.caseView.files.nationalId')}   value={c.national_id} />
        </div>
      )}

      {/* Orphan */}
      {c.category === 'orphan' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <FilePreview label={t('beneficiaries.caseView.files.picture')}       value={c.personal_picture} />
          <FilePreview label={t('beneficiaries.caseView.files.familyBooklet')} value={c.family_booklet} />
          <FilePreview label={t('beneficiaries.caseView.files.deathCert')}     value={c.father_death_certificate} />
        </div>
      )}

      {/* School student */}
      {c.category === 'school_student' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoCard icon={BookOpen} label={t('beneficiaries.caseView.fields.grade')}  value={c.academic_grade} />
            <InfoCard icon={BookOpen} label={t('beneficiaries.caseView.fields.school')} value={c.school_name} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FilePreview label={t('beneficiaries.caseView.files.picture')}    value={c.personal_picture} />
            <FilePreview label={t('beneficiaries.caseView.files.familyBook')} value={c.family_book_photo} />
          </div>
        </>
      )}

      {/* University student */}
      {c.category === 'university_student' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoCard icon={GraduationCap} label={t('beneficiaries.caseView.fields.year')}        value={c.academic_year} />
            <InfoCard icon={GraduationCap} label={t('beneficiaries.caseView.fields.supportType')} value={c.support_type === 'laptop_support' ? `💻 ${t('beneficiaries.support.laptop')}` : `🎓 ${t('beneficiaries.support.fees')}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FilePreview label={t('beneficiaries.caseView.files.picture')}      value={c.personal_picture} />
            <FilePreview label={t('beneficiaries.caseView.files.universityId')} value={c.university_id_photo} />
          </div>
        </>
      )}

      {c.caseTitle && (
        <div style={{ padding: '1rem', background: 'rgba(9,64,55,0.06)', borderRadius: 12, border: '1px solid rgba(9,64,55,0.15)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.67rem', fontWeight: 700, color: '#094037', textTransform: 'uppercase' }}>
            {t('beneficiaries.caseView.fields.publishedTitle')}
          </p>
          <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.caseTitle}</h4>
          <p style={{ margin: 0, fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.caseDescription}</p>
        </div>
      )}
    </div>
  )
}

function PublishStep({ caseData, form, setForm, errors }) {
  const { t } = useTranslation()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const cat = CAT_CFG[caseData.category]
  const CatIcon = cat?.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0.875rem 1rem', background: 'rgba(9,64,55,0.06)', borderRadius: 12, border: '1px solid rgba(9,64,55,0.12)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#094037', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#eab308' }}>
          {caseData.full_name?.slice(0, 2)}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{caseData.full_name}</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {CatIcon && <CatIcon size={11} />}
            {t(cat?.labelKey)} — {caseData.governorate}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0.75rem 1rem', background: '#fefce8', borderRadius: 10, border: '1px solid #fde68a' }}>
        <AlertCircle size={15} style={{ color: '#a16207', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
          {t('beneficiaries.caseView.publish.warning')}
        </p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {t('beneficiaries.caseView.publish.caseTitle')} <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder={t(`beneficiaries.caseView.publish.placeholders.${caseData.category}`)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', border: `1px solid ${errors.title ? '#fca5a5' : 'var(--border-default)'}`, borderRadius: 10, outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-muted)' }}
        />
        {errors.title && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>{t('beneficiaries.caseView.publish.caseTitleRequired')}</p>}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {t('beneficiaries.caseView.publish.caseDesc')} <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={t('beneficiaries.caseView.publish.caseDescPlaceholder')}
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', lineHeight: 1.6, border: `1px solid ${errors.description ? '#fca5a5' : 'var(--border-default)'}`, borderRadius: 10, outline: 'none', resize: 'vertical', color: 'var(--text-primary)', background: 'var(--bg-muted)' }}
        />
        {errors.description && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>{t('beneficiaries.caseView.publish.caseDescRequired')}</p>}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {t('beneficiaries.caseView.publish.caseImage')} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>({t('beneficiaries.caseView.publish.imageOptional')})</span>
        </label>
        <ImageUpload value={form.image} onChange={v => set('image', v)} label={t('beneficiaries.caseView.publish.imageLabel')} maxHeight={140} />
      </div>
    </div>
  )
}

export default function BeneficiaryCaseView({ isOpen, onClose, caseData, initialStep = 'view', onApprove, onReject, onArchive }) {
  const { t } = useTranslation()
  const [step,   setStep]   = useState(initialStep)
  const [form,   setForm]   = useState({ title: '', description: '', image: null })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) { setStep(initialStep); setForm({ title: '', description: '', image: null }); setErrors({}) }
  }, [isOpen, initialStep, caseData?.id])

  if (!isOpen || !caseData) return null

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = true
    if (!form.description.trim()) e.description = true
    setErrors(e); return !Object.keys(e).length
  }

  const handleApprove = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onApprove?.({ ...caseData, caseTitle: form.title, caseDescription: form.description, caseImage: form.image || caseData.personal_picture, status: 'active' })
      onClose()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const isPending = caseData.status === 'pending'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-default)', background: step === 'publish' ? 'rgba(9,64,55,0.04)' : 'var(--bg-surface)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'publish' && (
              <button onClick={() => setStep('view')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                <ChevronRight size={18} />
              </button>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {step === 'view' ? t('beneficiaries.caseView.title') : t('beneficiaries.caseView.publishTitle')}
              </h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {step === 'view'
                  ? t('beneficiaries.caseView.caseNumber', { id: caseData.id }) + ' · ' + caseData.full_name
                  : t('beneficiaries.caseView.publishSubtitle')
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {step === 'view'
            ? <ViewStep c={caseData} />
            : <PublishStep caseData={caseData} form={form} setForm={setForm} errors={errors} />
          }
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', flexShrink: 0, borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8, justifyContent: 'flex-end', background: 'var(--bg-surface)' }}>
          {step === 'view' ? (
            <>
              <button onClick={onClose} style={btnGhost}>{t('beneficiaries.caseView.close')}</button>
              {isPending && (
                <>
                  <button onClick={() => { onReject?.(caseData); onClose() }} style={btnDanger}>
                    <XCircle size={15} /> {t('beneficiaries.caseView.reject')}
                  </button>
                  <button onClick={() => { onArchive?.(caseData); onClose() }} style={btnMuted}>
                    <Archive size={15} /> {t('beneficiaries.caseView.archive')}
                  </button>
                  <button onClick={() => setStep('publish')} style={btnPrimary}>
                    <CheckCircle size={15} /> {t('beneficiaries.caseView.approveAndPublish')}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setStep('view')} style={btnGhost}>{t('beneficiaries.caseView.back')}</button>
              <button onClick={handleApprove} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                {t('beneficiaries.caseView.confirmPublish')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const base      = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' }
const btnPrimary = { ...base, background: '#094037', color: '#fff' }
const btnDanger  = { ...base, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }
const btnMuted   = { ...base, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
const btnGhost   = { ...base, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }