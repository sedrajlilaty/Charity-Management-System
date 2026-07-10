// src/features/beneficiaries/BeneficairiesModal.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileText, Heart, User, GraduationCap, BookOpen } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import PermissionButton from '../../ui/PermissionButton'
import { useGovernorates, useRegions } from '../../hooks/useLocations'

// ─── Category Config ───────────────────────────────────────
const CATEGORIES = [
  { key: 'patient',            icon: Heart,         color: '#094037', bg: 'var(--color-primary-50)',  label: 'مريض'        },
  { key: 'orphan',             icon: User,          color: '#094037', bg: 'var(--color-primary-100)', label: 'يتيم'         },
  { key: 'school_student',     icon: BookOpen,      color: '#92400e', bg: '#fef3c7',                  label: 'طالب مدرسة'  },
  { key: 'university_student', icon: GraduationCap, color: '#92400e', bg: '#fef3c7',                  label: 'طالب جامعة'  },
]

// ─── Empty forms per category ──────────────────────────────
const EMPTY = {
  patient: {
    category: 'patient', full_name: '', email: '', phone: '', national_id: '',
    description: '', required_amount: '', title: '',
    governorate_id: '', region_id: '',
    personal_picture: null, medical_report: null, national_id_document: null,
  },
  orphan: {
    category: 'orphan', full_name: '', phone: '', national_id: '', title: '',
    description: '', required_amount: '',
    governorate_id: '', region_id: '',
    personal_picture: null, family_booklet: null, father_death_certificate: null,
  },
  school_student: {
    category: 'school_student', full_name: '', email: '', phone: '', national_id: '',
    title: '', description: '', academic_grade: '', school_name: '',
    required_amount: '', governorate_id: '', region_id: '',
    personal_picture: null, family_book_photo: null,
  },
  university_student: {
    category: 'university_student', full_name: '', email: '', phone: '', national_id: '',
    title: '', description: '', academic_year: '',
    support_type: 'laptopsupport',  // ← الباك اند بيتوقع بدون underscore
    required_amount: '', governorate_id: '', region_id: '',
    personal_picture: null, university_id_photo: null,
  },
}

// ─── FileUpload — يحتفظ بـ File object ────────────────────
function FileUpload({ label, value, onChange, accept = 'image/*,.pdf', required, error }) {
  const ref = useRef()
  const fileName = value instanceof File ? value.name : null

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onChange(e.dataTransfer.files[0] || null) }}
        style={{
          border: `1.5px dashed ${error ? '#dc2626' : 'var(--border-default)'}`,
          borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
          background: 'var(--bg-muted)',
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
        }}
      >
        {value ? (
          <>
            <div style={{ width: 38, height: 38, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} color="#094037" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName ?? 'تم رفع الملف'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={16} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>اضغط أو اسحب الملف</p>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {accept.includes('pdf') ? 'JPG, PNG, PDF — max 5MB' : 'JPG, PNG — max 5MB'}
              </p>
            </div>
          </>
        )}
      </div>
      {error && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#dc2626' }}>{error}</p>}
      <input
        ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
    </div>
  )
}

// ─── Section divider ───────────────────────────────────────
function Section({ title, color = '#094037' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

// ─── Location Fields — من الباك اند ───────────────────────
function LocationFields({ form, set, errors }) {
  const { data: governorates = [] } = useGovernorates()
  const { data: regions = [] }      = useRegions(form.governorate_id)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <FormRow compact label="المحافظة" required>
        <select
          className="input"
          value={form.governorate_id ?? ''}
          onChange={(e) => { set('governorate_id', e.target.value); set('region_id', '') }}
        >
          <option value="">اختر المحافظة</option>
          {governorates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <FieldError msg={errors.governorate_id} />
      </FormRow>

      <FormRow compact label="المنطقة" required>
        <select
          className="input"
          value={form.region_id ?? ''}
          onChange={(e) => set('region_id', e.target.value)}
          disabled={!form.governorate_id}
        >
          <option value="">اختر المنطقة</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <FieldError msg={errors.region_id} />
      </FormRow>
    </div>
  )
}

// ─── Patient Form ──────────────────────────────────────────
function PatientForm({ form, set, errors }) {
  return (
    <>
      <Section title="المعلومات الشخصية" color="#094037" />
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <FormRow compact label="رقم الهوية الوطنية" required>
        <input className="input" placeholder="رقم الهوية" value={form.national_id} onChange={e => set('national_id', e.target.value)} dir="ltr" />
        <FieldError msg={errors.national_id} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="رقم الهاتف">
          <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </FormRow>
        <FormRow compact label="البريد الإلكتروني">
          <input className="input" type="email" dir="ltr" placeholder="example@mail.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </FormRow>
      </div>

      <Section title="الموقع" color="#094037" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="الحالة الطبية" color="#094037" />
      <FormRow compact label="عنوان الحالة" required>
        <input className="input" placeholder="مثال: مريض سرطان يحتاج تمويل علاج" value={form.title} onChange={e => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="وصف الحالة" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف الحالة الصحية والاحتياج..." value={form.description} onChange={e => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب ($)" required>
        <input className="input" type="number" min="1" placeholder="0" value={form.required_amount} onChange={e => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#094037" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية"  value={form.personal_picture}    onChange={v => set('personal_picture', v)}    accept="image/*"      required error={errors.personal_picture} />
        <FileUpload label="التقرير الطبي"    value={form.medical_report}       onChange={v => set('medical_report', v)}       accept="image/*,.pdf" required error={errors.medical_report} />
        <FileUpload label="وثيقة الهوية"     value={form.national_id_document} onChange={v => set('national_id_document', v)} accept="image/*,.pdf" required error={errors.national_id_document} />
      </div>
    </>
  )
}

// ─── Orphan Form ───────────────────────────────────────────
function OrphanForm({ form, set, errors }) {
  return (
    <>
      <Section title="المعلومات الشخصية" color="#10b981" />
      <FormRow compact label="عنوان الكفالة" required>
        <input className="input" placeholder="مثال: كفالة يتيم — أسرة الرشيدي" value={form.title} onChange={e => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <FormRow compact label="رقم الهوية الوطنية" required>
        <input className="input" placeholder="رقم الهوية" value={form.national_id} onChange={e => set('national_id', e.target.value)} dir="ltr" />
        <FieldError msg={errors.national_id} />
      </FormRow>
      <FormRow compact label="رقم الهاتف" required>
        <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <FieldError msg={errors.phone} />
      </FormRow>

      <Section title="الموقع" color="#10b981" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الكفالة" color="#10b981" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الأسرة والاحتياجات..." value={form.description} onChange={e => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب ($)" required>
        <input className="input" type="number" min="1" placeholder="0" value={form.required_amount} onChange={e => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#10b981" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية"      value={form.personal_picture}        onChange={v => set('personal_picture', v)}        accept="image/*"      required error={errors.personal_picture} />
        <FileUpload label="دفتر العائلة"         value={form.family_booklet}           onChange={v => set('family_booklet', v)}           accept="image/*,.pdf" required error={errors.family_booklet} />
        <FileUpload label="وثيقة وفاة الوالد"    value={form.father_death_certificate} onChange={v => set('father_death_certificate', v)} accept="image/*,.pdf" required error={errors.father_death_certificate} />
      </div>
    </>
  )
}

// ─── School Student Form ───────────────────────────────────
function SchoolStudentForm({ form, set, errors }) {
  return (
    <>
      <Section title="معلومات الطالب" color="#f59e0b" />
      <FormRow compact label="عنوان الطلب" required>
        <input className="input" placeholder="مثال: دعم طالب مدرسة — الصف التاسع" value={form.title} onChange={e => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <FormRow compact label="رقم الهوية الوطنية" required>
        <input className="input" placeholder="رقم الهوية" value={form.national_id} onChange={e => set('national_id', e.target.value)} dir="ltr" />
        <FieldError msg={errors.national_id} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="المرحلة الدراسية" required>
          <input className="input" placeholder="مثال: الصف التاسع" value={form.academic_grade} onChange={e => set('academic_grade', e.target.value)} />
          <FieldError msg={errors.academic_grade} />
        </FormRow>
        <FormRow compact label="اسم المدرسة" required>
          <input className="input" placeholder="اسم المدرسة" value={form.school_name} onChange={e => set('school_name', e.target.value)} />
          <FieldError msg={errors.school_name} />
        </FormRow>
      </div>

      <Section title="الموقع" color="#f59e0b" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الطلب" color="#f59e0b" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الطالب وما يحتاجه..." value={form.description} onChange={e => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب ($)" required>
        <input className="input" type="number" min="1" placeholder="0" value={form.required_amount} onChange={e => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#f59e0b" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية"    value={form.personal_picture}  onChange={v => set('personal_picture', v)}  accept="image/*"      required error={errors.personal_picture} />
        <FileUpload label="صورة دفتر العائلة" value={form.family_book_photo} onChange={v => set('family_book_photo', v)} accept="image/*,.pdf" required error={errors.family_book_photo} />
      </div>
    </>
  )
}

// ─── University Student Form ───────────────────────────────
function UniversityStudentForm({ form, set, errors }) {
  return (
    <>
      <Section title="معلومات الطالب" color="#f97316" />
      <FormRow compact label="عنوان الطلب" required>
        <input className="input" placeholder="مثال: دعم طالب جامعي — هندسة حاسوب" value={form.title} onChange={e => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <FormRow compact label="رقم الهوية الوطنية" required>
        <input className="input" placeholder="رقم الهوية" value={form.national_id} onChange={e => set('national_id', e.target.value)} dir="ltr" />
        <FieldError msg={errors.national_id} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="السنة الدراسية" required>
          <input className="input" placeholder="مثال: السنة الثالثة" value={form.academic_year} onChange={e => set('academic_year', e.target.value)} />
          <FieldError msg={errors.academic_year} />
        </FormRow>
        <FormRow compact label="نوع الدعم" required>
          <select className="input" value={form.support_type} onChange={e => set('support_type', e.target.value)}>
            <option value="laptopsupport">دعم لابتوب 💻</option>
            <option value="tuitionassistance">دعم رسوم دراسية 🎓</option>
          </select>
        </FormRow>
      </div>

      <Section title="الموقع" color="#f97316" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الطلب" color="#f97316" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الطالب والهدف من الدعم..." value={form.description} onChange={e => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب ($)" required>
        <input className="input" type="number" min="1" placeholder="0" value={form.required_amount} onChange={e => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#f97316" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية" value={form.personal_picture}   onChange={v => set('personal_picture', v)}   accept="image/*"      required error={errors.personal_picture} />
        <FileUpload label="بطاقة الجامعة"  value={form.university_id_photo} onChange={v => set('university_id_photo', v)} accept="image/*,.pdf" required error={errors.university_id_photo} />
      </div>
    </>
  )
}

// ─── Validation ────────────────────────────────────────────
function validateForm(form) {
  const e = {}
  const req    = (k, label)  => { if (!form[k]?.toString().trim()) e[k] = `${label} مطلوب` }
  const reqFile = (k, label) => { if (!form[k]) e[k] = `${label} مطلوب` }

  req('full_name',      'الاسم الكامل')
  req('national_id',    'رقم الهوية')
  req('governorate_id', 'المحافظة')
  req('region_id',      'المنطقة')
  req('description',    'وصف الاحتياج')
  req('required_amount','المبلغ المطلوب')
  req('title',          'العنوان')
  reqFile('personal_picture', 'الصورة الشخصية')

  if (form.category === 'patient') {
    reqFile('medical_report',       'التقرير الطبي')
    reqFile('national_id_document', 'وثيقة الهوية')
  }
  if (form.category === 'orphan') {
    req('phone', 'رقم الهاتف')
    reqFile('family_booklet',           'دفتر العائلة')
    reqFile('father_death_certificate', 'وثيقة وفاة الوالد')
  }
  if (form.category === 'school_student') {
    req('academic_grade', 'المرحلة الدراسية')
    req('school_name',    'اسم المدرسة')
    reqFile('family_book_photo', 'صورة دفتر العائلة')
  }
  if (form.category === 'university_student') {
    req('academic_year', 'السنة الدراسية')
    req('support_type',  'نوع الدعم')
    reqFile('university_id_photo', 'بطاقة الجامعة')
  }

  return e
}

// ─── Main Modal ────────────────────────────────────────────
export default function BeneficiaryModal({ open, onClose, onSave, editItem }) {
  const [activeCategory, setActiveCategory] = useState('patient')
  const [form,   setForm]   = useState(EMPTY['patient'])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editItem) {
      const cat = editItem.category ?? 'patient'
      setActiveCategory(cat)
      setForm({ ...EMPTY[cat], ...editItem })
    } else {
      setActiveCategory('patient')
      setForm(EMPTY['patient'])
    }
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCategoryChange = (cat) => {
    if (editItem) return
    setActiveCategory(cat)
    setForm(EMPTY[cat])
    setErrors({})
  }

  const handleSave = async () => {
    const e = validateForm(form)
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      const backendErrors = err?.response?.data?.errors ?? {}
      if (Object.keys(backendErrors).length) {
        const mapped = {}
        Object.entries(backendErrors).forEach(([k, msgs]) => {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs
        })
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  const catConfig  = CATEGORIES.find(c => c.key === activeCategory)
  const formProps  = { form, set, errors }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={700}
      title={editItem ? 'تعديل بيانات المستفيد' : 'إضافة مستفيد جديد'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: 80 }}>إلغاء</button>
          <PermissionButton onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: 140 }}>
            {saving
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  جاري الحفظ...
                </span>
              : editItem ? 'حفظ التعديلات' : 'إضافة المستفيد'
            }
          </PermissionButton>
        </>
      }
    >
      {/* Category Selector */}
      {!editItem && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            نوع المستفيد
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {CATEGORIES.map(({ key, icon: Icon, color, bg, label }) => {
              const active = activeCategory === key
              return (
                <button key={key} onClick={() => handleCategoryChange(key)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                  border: active ? `2px solid ${color}` : '2px solid var(--border-subtle)',
                  background: active ? bg : 'var(--bg-muted)', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? color : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={active ? '#fff' : 'var(--text-muted)'} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: active ? color : 'var(--text-secondary)', textAlign: 'center' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category indicator when editing */}
      {editItem && catConfig && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: catConfig.bg, borderRadius: 10, marginBottom: '1.25rem', border: `1px solid ${catConfig.color}30` }}>
          <catConfig.icon size={14} color={catConfig.color} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: catConfig.color }}>{catConfig.label}</span>
        </div>
      )}

      {/* Forms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {activeCategory === 'patient'            && <PatientForm           {...formProps} />}
        {activeCategory === 'orphan'             && <OrphanForm            {...formProps} />}
        {activeCategory === 'school_student'     && <SchoolStudentForm     {...formProps} />}
        {activeCategory === 'university_student' && <UniversityStudentForm {...formProps} />}
      </div>
    </Modal>
  )
}