// src/features/beneficiaries/BeneficiaryCaseView.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, CheckCircle, XCircle, Archive, MapPin,
  Phone, AlertCircle, ChevronRight,
  FileText, Heart, User, BookOpen, GraduationCap,
  Mail, DollarSign, ExternalLink, ImagePlus, Camera,
} from 'lucide-react'
import { Badge }          from '../../ui/Badge'
import { formatCurrency } from '../../utlis/helper'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000/storage'

const fileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}/${path.replace(/^\/+/, '')}`
}

const CAT_CFG = {
  patient:            { icon: Heart,         labelKey: 'beneficiaries.categories.patient',            color: 'var(--color-primary-500)', bg: 'var(--color-primary-50)'  },
  orphan:             { icon: User,          labelKey: 'beneficiaries.categories.orphan',             color: 'var(--color-primary-500)', bg: 'var(--color-primary-100)' },
  school_student:     { icon: BookOpen,      labelKey: 'beneficiaries.categories.school_student',     color: '#92400e', bg: '#fef3c7'                  },
  university_student: { icon: GraduationCap, labelKey: 'beneficiaries.categories.university_student', color: '#92400e', bg: '#fef3c7'                  },
}

// ── مساعدات ─────────────────────────────────────────────────
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

// بيشتغل مع URLs من الباك اند وbase64 من الفرونت
function FilePreview({ label, src }) {
  if (!src) return null
  const url      = src.startsWith('data:') ? src : fileUrl(src)
  if (!url) return null
  const isImage  = /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || src.startsWith('data:image') || url.includes('personal_pictures') || url.includes('profile_images')

  return (
    <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
      <p style={{ margin: '0 0 6px', fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
      {isImage && (
        <img
          src={url} alt={label}
          style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      )}
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 600, textDecoration: 'none' }}>
        <FileText size={13} />
        {label} — عرض
        <ExternalLink size={11} />
      </a>
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────
function ProgressBar({ donated, required, progress }) {
  if (!required || required <= 0) return null
  const pct   = Math.min(progress ?? 0, 100)
  const color = pct >= 100 ? '#16a34a' : pct >= 60 ? 'var(--color-primary-500)' : '#d97706'
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>تقدم التبرعات</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>تم جمع: <b style={{ color: 'var(--color-primary-500)' }}>{formatCurrency(donated ?? 0)}</b></span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>المطلوب: <b>{formatCurrency(required)}</b></span>
      </div>
    </div>
  )
}

// ── View Step ─────────────────────────────────────────────────
function ViewStep({ c }) {
  const { t } = useTranslation()
  const cat     = CAT_CFG[c.category]
  const CatIcon = cat?.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Profile card */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-muted)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
        {c.personal_picture
          ? <img src={c.personal_picture.startsWith('data:') ? c.personal_picture : fileUrl(c.personal_picture)} alt=""
              style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
              onError={e => e.currentTarget.style.display = 'none'}
            />
          : (
            <div style={{ width: 68, height: 68, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,var(--color-primary-500),#0a5244)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#eab308' }}>
              {c.full_name?.slice(0, 2)}
            </div>
          )
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.full_name}</h3>
          {c.title && <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--color-primary-500)', fontWeight: 600 }}>📢 {c.title}</p>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge status={c.status} />
            {cat && (
              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: cat.bg, color: cat.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {CatIcon && <CatIcon size={10} />} {t(cat.labelKey)}
              </span>
            )}
            {c.status_request && (
              <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: c.status_request === 'open' ? '#dcfce7' : '#f1f5f9', color: c.status_request === 'open' ? '#16a34a' : '#64748b' }}>
                {c.status_request === 'open' ? '🟢 مفتوح' : '🔴 مغلق'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* معلومات التواصل والموقع */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {c.phone       && <InfoCard icon={Phone}  label="رقم الهاتف"  value={c.phone} />}
        {c.email       && <InfoCard icon={Mail}   label="البريد"      value={c.email} />}
        {c.governorate && <InfoCard icon={MapPin} label="المحافظة"    value={c.governorate} />}
        {c.region      && <InfoCard icon={MapPin} label="المنطقة"     value={c.region} />}
      </div>

      {/* الوصف */}
      {c.description && (
        <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>وصف الحالة</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>{c.description}</p>
        </div>
      )}

      {/* تقدم التبرعات للمقبولة */}
      {c.status === 'accepted' && (
        <ProgressBar donated={c.donated_amount} required={c.required_amount} progress={c.progress_percentage} />
      )}

      {/* المبلغ المطلوب للمعلقة */}
      {c.status === 'pending' && c.required_amount > 0 && (
        <InfoCard icon={DollarSign} label="المبلغ المطلوب" value={formatCurrency(c.required_amount)} />
      )}

      {/* ── Patient ── */}
      {c.category === 'patient' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <FilePreview label="الصورة الشخصية"  src={c.personal_picture} />
          <FilePreview label="التقرير الطبي"    src={c.medical_report} />
          <FilePreview label="وثيقة الهوية"     src={c.national_id_document} />
        </div>
      )}

      {/* ── Orphan ── */}
      {c.category === 'orphan' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <FilePreview label="الصورة الشخصية"   src={c.personal_picture} />
          <FilePreview label="دفتر العائلة"      src={c.family_booklet} />
          <FilePreview label="وثيقة وفاة الوالد" src={c.father_death_certificate} />
        </div>
      )}

      {/* ── School ── */}
      {c.category === 'school_student' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoCard icon={BookOpen} label="المرحلة الدراسية" value={c.academic_grade} />
            <InfoCard icon={BookOpen} label="اسم المدرسة"      value={c.school_name} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FilePreview label="الصورة الشخصية"    src={c.personal_picture} />
            <FilePreview label="صورة دفتر العائلة" src={c.family_book_photo} />
          </div>
        </>
      )}

      {/* ── University ── */}
      {c.category === 'university_student' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoCard icon={GraduationCap} label="السنة الدراسية" value={c.academic_year} />
            <InfoCard icon={GraduationCap} label="نوع الدعم"
              value={c.support_type === 'laptopsupport' ? '💻 دعم لابتوب' : '🎓 دعم رسوم دراسية'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FilePreview label="الصورة الشخصية" src={c.personal_picture} />
            <FilePreview label="بطاقة الجامعة"  src={c.university_id_photo} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Publish Step ──────────────────────────────────────────────
function PublishStep({ caseData, form, setForm, errors }) {
  const { t } = useTranslation()
  const set     = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const cat     = CAT_CFG[caseData.category]
  const CatIcon = cat?.icon

  const [previewUrl, setPreviewUrl] = useState(null)

  // إنشاء/تنظيف preview URL للصورة الجديدة المختارة
  useEffect(() => {
    if (form.personal_picture instanceof File) {
      const url = URL.createObjectURL(form.personal_picture)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [form.personal_picture])

  const displayedImage = previewUrl ?? fileUrl(caseData.personal_picture)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) set('personal_picture', file)
    e.target.value = '' // يسمح باختيار نفس الملف مرتين
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

      {/* بيانات الحالة */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0.875rem 1rem', background: 'rgba(9,64,55,0.06)', borderRadius: 12, border: '1px solid rgba(9,64,55,0.12)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--color-primary-500)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#eab308' }}>
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

      {/* تحذير */}
      <div style={{ display: 'flex', gap: 8, padding: '0.75rem 1rem', background: '#fefce8', borderRadius: 10, border: '1px solid #fde68a' }}>
        <AlertCircle size={15} style={{ color: '#a16207', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
          بعد القبول سيتم نشر الحالة وإتاحتها للتبرع. تأكد من صحة المعلومات.
        </p>
      </div>

      {/* صورة الحالة */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {t('beneficiaries.publish.imageLabel', { defaultValue: 'صورة الحالة' })}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 84, height: 84, borderRadius: 14, flexShrink: 0, overflow: 'hidden',
            background: 'var(--bg-muted)', border: '1px dashed var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {displayedImage
              ? <img src={displayedImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
              : <Camera size={22} style={{ color: 'var(--text-muted)' }} />
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              padding: '8px 14px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
              background: 'var(--bg-muted)', color: 'var(--color-primary-500)',
              border: '1px solid var(--border-default)', width: 'fit-content',
            }}>
              <ImagePlus size={14} />
              {displayedImage
                ? t('beneficiaries.publish.changeImage', { defaultValue: 'تغيير الصورة' })
                : t('beneficiaries.publish.uploadImage', { defaultValue: 'رفع صورة' })
              }
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {t('beneficiaries.publish.imageHint', { defaultValue: 'ستظهر هذه الصورة مع الحالة المنشورة (JPG, PNG)' })}
            </p>
          </div>
        </div>
      </div>

      {/* العنوان */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          عنوان الحالة <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="مثال: مريض سرطان يحتاج تمويل علاج عاجل"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', border: `1px solid ${errors.title ? '#fca5a5' : 'var(--border-default)'}`, borderRadius: 10, outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-muted)' }}
        />
        {errors.title && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>العنوان مطلوب</p>}
      </div>

      {/* الوصف */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          وصف الحالة <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="وصف تفصيلي للحالة والاحتياج..."
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', lineHeight: 1.6, border: `1px solid ${errors.description ? '#fca5a5' : 'var(--border-default)'}`, borderRadius: 10, outline: 'none', resize: 'vertical', color: 'var(--text-primary)', background: 'var(--bg-muted)' }}
        />
        {errors.description && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>الوصف مطلوب</p>}
      </div>

      {/* المبلغ */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          المبلغ المطلوب ($) <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="number" min="1"
          value={form.required_amount ?? caseData.required_amount ?? ''}
          onChange={e => set('required_amount', e.target.value)}
          placeholder="0"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: '0.875rem', fontFamily: 'Cairo, sans-serif', border: `1px solid ${errors.required_amount ? '#fca5a5' : 'var(--border-default)'}`, borderRadius: 10, outline: 'none', color: 'var(--text-primary)', background: 'var(--bg-muted)' }}
        />
        {errors.required_amount && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>المبلغ مطلوب</p>}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function BeneficiaryCaseView({ isOpen, onClose, caseData, initialStep = 'view', onApprove, onReject, onArchive }) {
  const { t } = useTranslation()
  const [step,   setStep]   = useState(initialStep)
  const [form,   setForm]   = useState({ title: '', description: '', required_amount: '', personal_picture: null })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep)
      setForm({
        title:            caseData?.title           ?? '',
        description:      caseData?.description     ?? '',
        required_amount:  caseData?.required_amount ?? '',
        personal_picture: null,
      })
      setErrors({})
    }
  }, [isOpen, initialStep, caseData?.id])

  if (!isOpen || !caseData) return null

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = true
    if (!form.description.trim()) e.description = true
    if (!form.required_amount)    e.required_amount = true
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleApprove = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onApprove?.({
        id:               caseData.id,
        caseTitle:        form.title,
        caseDescription:  form.description,
        required_amount:  form.required_amount,
        personal_picture: form.personal_picture, // File جديد أو null (يبقى القديم بدون تعديل)
      })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const isPending = caseData.status === 'pending'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'publish' && (
              <button onClick={() => setStep('view')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                <ChevronRight size={18} />
              </button>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {step === 'view' ? 'تفاصيل الحالة' : 'قبول ونشر الحالة'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {step === 'view'
                  ? `حالة #${caseData.id} · ${caseData.full_name}`
                  : 'أدخل معلومات النشر'
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
              <button onClick={onClose} style={btnGhost}>إغلاق</button>
              {isPending && (
                <>
                  <button onClick={() => { onReject?.(caseData); onClose() }} style={btnDanger}>
                    <XCircle size={15} /> رفض
                  </button>
                  <button onClick={() => { onArchive?.(caseData); onClose() }} style={btnMuted}>
                    <Archive size={15} /> أرشفة
                  </button>
                  <button onClick={() => setStep('publish')} style={btnPrimary}>
                    <CheckCircle size={15} /> قبول ونشر
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setStep('view')} style={btnGhost}>رجوع</button>
              <button onClick={handleApprove} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                تأكيد النشر
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const base       = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' }
const btnPrimary = { ...base, background: 'var(--color-primary-500)', color: '#fff' }
const btnDanger  = { ...base, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }
const btnMuted   = { ...base, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
const btnGhost   = { ...base, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }