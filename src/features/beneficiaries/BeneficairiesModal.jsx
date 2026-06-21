import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileText, Image as ImageIcon, User, Heart, GraduationCap, BookOpen } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import PermissionButton from '../../ui/PermissionButton'

// ─── Category Config ───────────────────────────────────────
const CATEGORIES = [
  { key: 'patient',            icon: Heart,           color: '#094037', bg: 'var(--color-primary-50)', label: 'مريض',          labelEn: 'Patient'            },
  { key: 'orphan',             icon: User,            color: '#094037', bg: 'var(--color-primary-100)', label: 'يتيم',           labelEn: 'Orphan'             },
  { key: 'school_student',     icon: BookOpen,        color: '#92400e', bg: '#fef3c7', label: 'طالب مدرسة',    labelEn: 'School Student'     },
  { key: 'university_student', icon: GraduationCap,   color: '#92400e', bg: '#fef3c7', label: 'طالب جامعة',    labelEn: 'University Student' },
]

const SYRIAN_GOVERNORATES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة'
]

// ─── Empty forms per category ──────────────────────────────
const EMPTY = {
  patient: {
    category: 'patient', full_name: '', address: '', email: '', phone: '',
    description: '', required_amount: '', governorate: '', region: '',
    personal_picture: null, medical_report: null, national_id: null,
  },
  orphan: {
    category: 'orphan', full_name: '', address: '', title: '', phone: '',
    description: '', required_amount: '', governorate: '', region: '',
    personal_picture: null, family_booklet: null, father_death_certificate: null,
  },
  school_student: {
    category: 'school_student', full_name: '', address: '', title: '', email: '',
    phone: '', description: '', academic_grade: '', school_name: '',
    required_amount: '', governorate: '', region: '',
    personal_picture: null, family_book_photo: null,
  },
  university_student: {
    category: 'university_student', full_name: '', address: '', title: '',
    email: '', phone: '', description: '', academic_year: '',
    support_type: 'laptop_support', required_amount: '', governorate: '', region: '',
    personal_picture: null, university_id_photo: null,
  },
}

// ─── FileUpload component ──────────────────────────────────
function FileUpload({ label, value, onChange, accept = 'image/*,.pdf', hint, required }) {
  const ref = useRef()
  const isImage = value && typeof value === 'string' && value.startsWith('data:image')

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
          {hint && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginRight: 4 }}>({hint})</span>}
        </label>
      )}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{
          border: '1.5px dashed var(--border-default)',
          borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
          background: 'var(--bg-muted)', transition: 'border-color 0.15s',
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 52,
          position: 'relative',
        }}
      >
        {value ? (
          <>
            {isImage
              ? <img src={value} alt="" style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 38, height: 38, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} color="#3b82f6" />
                </div>
            }
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>تم رفع الملف</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              style={{ marginRight: 'auto', width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                {accept.includes('pdf') ? 'JPG, PNG, PDF' : 'JPG, PNG'}
              </p>
            </div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}

// ─── Section divider ───────────────────────────────────────
function Section({ title, color = '#094037' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 2px' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

// ─── Shared location fields ────────────────────────────────
function LocationFields({ form, set, errors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <FormRow compact label="المحافظة" required>
        <select className="input" value={form.governorate} onChange={(e) => set('governorate', e.target.value)}>
          <option value="">اختر المحافظة</option>
          {SYRIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <FieldError msg={errors.governorate} />
      </FormRow>
      <FormRow compact label="المنطقة / الحي" required>
        <input className="input" placeholder="مثال: المزة" value={form.region} onChange={(e) => set('region', e.target.value)} />
        <FieldError msg={errors.region} />
      </FormRow>
      <FormRow compact label="العنوان التفصيلي" style={{ gridColumn: '1 / -1' }}>
        <input className="input" placeholder="الشارع، رقم المبنى..." value={form.address} onChange={(e) => set('address', e.target.value)} />
      </FormRow>
    </div>
  )
}

// ─── Patient Form ──────────────────────────────────────────
function PatientForm({ form, set, errors }) {
  return (
    <>
      <Section title="المعلومات الشخصية" color="#3b82f6" />
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="رقم الهاتف" required>
          <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <FieldError msg={errors.phone} />
        </FormRow>
        <FormRow compact label="البريد الإلكتروني">
          <input className="input" type="email" dir="ltr" placeholder="example@mail.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FormRow>
      </div>

      <Section title="الموقع" color="#3b82f6" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="الحالة الطبية" color="#3b82f6" />
      <FormRow compact label="وصف الحالة" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف الحالة الصحية والاحتياج..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب (ل.س)" required>
        <input className="input" type="number" placeholder="0" value={form.required_amount} onChange={(e) => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#3b82f6" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية" value={form.personal_picture} onChange={(v) => set('personal_picture', v)} accept="image/*" required />
        <FileUpload label="التقرير الطبي" value={form.medical_report} onChange={(v) => set('medical_report', v)} accept="image/*,.pdf" required />
        <FileUpload label="الهوية الوطنية" value={form.national_id} onChange={(v) => set('national_id', v)} accept="image/*,.pdf" required />
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
        <input className="input" placeholder="مثال: كفالة يتيم — أسرة الرشيدي" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <FormRow compact label="رقم الهاتف" required>
        <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <FieldError msg={errors.phone} />
      </FormRow>

      <Section title="الموقع" color="#10b981" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الكفالة" color="#10b981" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الأسرة والاحتياجات..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب (ل.س)" required>
        <input className="input" type="number" placeholder="0" value={form.required_amount} onChange={(e) => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#10b981" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية" value={form.personal_picture} onChange={(v) => set('personal_picture', v)} accept="image/*" required />
        <FileUpload label="دفتر العائلة" value={form.family_booklet} onChange={(v) => set('family_booklet', v)} accept="image/*,.pdf" required />
        <FileUpload label="وثيقة وفاة الوالد" value={form.father_death_certificate} onChange={(v) => set('father_death_certificate', v)} accept="image/*,.pdf" required />
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
        <input className="input" placeholder="مثال: دعم طالب مدرسة — الصف التاسع" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="رقم الهاتف" required>
          <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <FieldError msg={errors.phone} />
        </FormRow>
        <FormRow compact label="البريد الإلكتروني">
          <input className="input" type="email" dir="ltr" placeholder="example@mail.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FormRow>
        <FormRow compact label="المرحلة الدراسية" required>
          <input className="input" placeholder="مثال: الصف التاسع" value={form.academic_grade} onChange={(e) => set('academic_grade', e.target.value)} />
          <FieldError msg={errors.academic_grade} />
        </FormRow>
        <FormRow compact label="اسم المدرسة" required>
          <input className="input" placeholder="اسم المدرسة" value={form.school_name} onChange={(e) => set('school_name', e.target.value)} />
          <FieldError msg={errors.school_name} />
        </FormRow>
      </div>

      <Section title="الموقع" color="#f59e0b" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الطلب" color="#f59e0b" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الطالب وما يحتاجه..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب (ل.س)" required>
        <input className="input" type="number" placeholder="0" value={form.required_amount} onChange={(e) => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#f59e0b" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية" value={form.personal_picture} onChange={(v) => set('personal_picture', v)} accept="image/*" required />
        <FileUpload label="صورة دفتر العائلة" value={form.family_book_photo} onChange={(v) => set('family_book_photo', v)} accept="image/*,.pdf" required />
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
        <input className="input" placeholder="مثال: دعم طالب جامعي — هندسة حاسوب" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <FieldError msg={errors.title} />
      </FormRow>
      <FormRow compact label="الاسم الكامل" required>
        <input className="input" placeholder="الاسم الرباعي" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
        <FieldError msg={errors.full_name} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow compact label="رقم الهاتف" required>
          <input className="input" type="tel" dir="ltr" placeholder="09XXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <FieldError msg={errors.phone} />
        </FormRow>
        <FormRow compact label="البريد الإلكتروني">
          <input className="input" type="email" dir="ltr" placeholder="example@mail.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FormRow>
        <FormRow compact label="السنة الدراسية" required>
          <input className="input" placeholder="مثال: السنة الثالثة" value={form.academic_year} onChange={(e) => set('academic_year', e.target.value)} />
          <FieldError msg={errors.academic_year} />
        </FormRow>
        <FormRow compact label="نوع الدعم المطلوب" required>
          <select className="input" value={form.support_type} onChange={(e) => set('support_type', e.target.value)}>
            <option value="laptop_support">دعم لابتوب</option>
            <option value="tuition_assistance">دعم رسوم دراسية</option>
          </select>
        </FormRow>
      </div>

      <Section title="الموقع" color="#f97316" />
      <LocationFields form={form} set={set} errors={errors} />

      <Section title="تفاصيل الطلب" color="#f97316" />
      <FormRow compact label="وصف الاحتياج" required>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="وصف وضع الطالب والهدف من الدعم..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        <FieldError msg={errors.description} />
      </FormRow>
      <FormRow compact label="المبلغ المطلوب (ل.س)" required>
        <input className="input" type="number" placeholder="0" value={form.required_amount} onChange={(e) => set('required_amount', e.target.value)} />
        <FieldError msg={errors.required_amount} />
      </FormRow>

      <Section title="المستندات" color="#f97316" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FileUpload label="الصورة الشخصية" value={form.personal_picture} onChange={(v) => set('personal_picture', v)} accept="image/*" required />
        <FileUpload label="بطاقة الجامعة" value={form.university_id_photo} onChange={(v) => set('university_id_photo', v)} accept="image/*,.pdf" required />
      </div>
    </>
  )
}

// ─── Validation per category ───────────────────────────────
function validate(form) {
  const e = {}
  const req = (k, label) => { if (!form[k]?.toString().trim()) e[k] = `${label} مطلوب` }

  req('full_name', 'الاسم الكامل')
  req('phone', 'رقم الهاتف')
  req('governorate', 'المحافظة')
  req('region', 'المنطقة')
  req('description', 'وصف الاحتياج')
  req('required_amount', 'المبلغ المطلوب')

  if (form.category === 'orphan') req('title', 'عنوان الكفالة')
  if (form.category === 'school_student') {
    req('title', 'عنوان الطلب')
    req('academic_grade', 'المرحلة الدراسية')
    req('school_name', 'اسم المدرسة')
  }
  if (form.category === 'university_student') {
    req('title', 'عنوان الطلب')
    req('academic_year', 'السنة الدراسية')
  }

  return e
}

// ─── Main Modal ────────────────────────────────────────────
export default function BeneficiaryModal({ open, onClose, onSave, editItem }) {
  const { t } = useTranslation()

  const defaultCat = editItem?.category || 'patient'
  const [activeCategory, setActiveCategory] = useState(defaultCat)
  const [form, setForm] = useState(EMPTY[defaultCat])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editItem) {
      setActiveCategory(editItem.category || 'patient')
      setForm({ ...EMPTY[editItem.category || 'patient'], ...editItem })
    } else {
      setActiveCategory('patient')
      setForm(EMPTY['patient'])
    }
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleCategoryChange = (cat) => {
    if (editItem) return // لا تغير النوع عند التعديل
    setActiveCategory(cat)
    setForm(EMPTY[cat])
    setErrors({})
  }

  const handleSave = async () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setSaving(false)
    }
  }

  const catConfig = CATEGORIES.find(c => c.key === activeCategory)

  const formProps = { form, set, errors }

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
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
                    border: active ? `2px solid ${color}` : '2px solid var(--border-subtle)',
                    background: active ? bg : 'var(--bg-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? color : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <Icon size={16} color={active ? '#fff' : 'var(--text-muted)'} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: active ? color : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          background: catConfig.bg, borderRadius: 10, marginBottom: '1.25rem',
          border: `1px solid ${catConfig.color}30`,
        }}>
          <catConfig.icon size={14} color={catConfig.color} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: catConfig.color }}>
            {catConfig.label}
          </span>
        </div>
      )}

      {/* Dynamic Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {activeCategory === 'patient'            && <PatientForm           {...formProps} />}
        {activeCategory === 'orphan'             && <OrphanForm            {...formProps} />}
        {activeCategory === 'school_student'     && <SchoolStudentForm     {...formProps} />}
        {activeCategory === 'university_student' && <UniversityStudentForm {...formProps} />}
      </div>
    </Modal>
  )
}