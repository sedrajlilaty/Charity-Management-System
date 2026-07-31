// ui/ProfileEditModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal, { FormRow, FieldError } from './Modal'
import ImageUpload from './ImageUpload'
import PermissionButton from './PermissionButton'
import { useAuth } from '../context/AuthContext' // ⚠️ عدّلي المسار إذا مختلف
import { useUpdateProfile } from '../hooks/useUsers'

const EMPTY = {
  first_name:             '',
  last_name:              '',
  email:                  '',
  phone:                  '',
  address:                '',
  password:               '',
  password_confirmation:  '',
  profile_image:          null, // base64 جديدة، null = ما تغيرت
  national_id:            null,
  international_passport: null,
}

export default function ProfileEditModal({ open, onClose }) {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const updateMut = useUpdateProfile()

  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [changePassword, setChangePassword] = useState(false)

  useEffect(() => {
    if (open && user) {
      setForm({
        ...EMPTY,
        // ⚠️ إذا الباك اند بيرجع first_name/last_name منفصلين استخدميهن مباشرة،
        // وإلا هاد fallback بيقسم user.name لكلمتين
        first_name: user.first_name ?? user.name?.split(' ')[0] ?? '',
        last_name:  user.last_name  ?? user.name?.split(' ').slice(1).join(' ') ?? '',
        email:      user.email   || '',
        phone:      user.phone   || '',
        address:    user.address || '',
      })
      setChangePassword(false)
      setErrors({})
    }
  }, [open, user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'الاسم الأول مطلوب'
    if (!form.last_name.trim())  e.last_name  = 'الاسم الأخير مطلوب'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'بريد إلكتروني غير صالح'

    if (changePassword) {
      if (!form.password || form.password.length < 8) {
        e.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      }
      if (form.password !== form.password_confirmation) {
        e.password_confirmation = 'كلمتا المرور غير متطابقتين'
      }
    }

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return

    const payload = {
      first_name: form.first_name,
      last_name:  form.last_name,
      email:      form.email,
      phone:      form.phone,
      address:    form.address,
      profile_image:          form.profile_image,          // null → ما بينبعت
      national_id:            form.national_id,
      international_passport: form.international_passport,
    }
    if (changePassword) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      const res = await updateMut.mutateAsync(payload)
      // ✅ نحدّث AuthContext فوراً حتى الاسم/الصورة بالـ Navbar يتحدثوا بدون Refresh
      if (res?.user) updateUser(res.user)
      onClose()
    } catch (err) {
      // ✅ الـ toast العام بينعرض تلقائياً من الـ hook — هون بس منلقط أخطاء الحقول المحددة (422)
      if (err.response?.status === 422) {
        const serverErrors = err.response.data?.errors || {}
        const mapped = {}
        Object.keys(serverErrors).forEach((key) => { mapped[key] = serverErrors[key][0] })
        setErrors((prev) => ({ ...prev, ...mapped }))
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعديل الملف الشخصي"
      footer={
        <>
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            إلغاء
          </PermissionButton>
          <PermissionButton
            onClick={handleSave}
            disabled={updateMut.isLoading}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {updateMut.isLoading ? '...' : 'حفظ التعديلات'}
          </PermissionButton>
        </>
      }
    >
      <FormRow label="الصورة الشخصية">
        <ImageUpload
          value={form.profile_image || user?.avatar || null}
          onChange={(v) => set('profile_image', v)}
          label="اضغط أو اسحب صورة شخصية"
          maxHeight={160}
        />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="الاسم الأول" required>
          <input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
          <FieldError msg={errors.first_name} />
        </FormRow>
        <FormRow label="الاسم الأخير" required>
          <input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
          <FieldError msg={errors.last_name} />
        </FormRow>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="البريد الإلكتروني">
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} dir="ltr" />
          <FieldError msg={errors.email} />
        </FormRow>
        <FormRow label="رقم الهاتف">
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
          <FieldError msg={errors.phone} />
        </FormRow>
      </div>

      <FormRow label="العنوان">
        <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
        <FieldError msg={errors.address} />
      </FormRow>

      {/* ── صور الهوية (اختياري) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="صورة الهوية الشخصية (اختياري)">
          <ImageUpload
            value={form.national_id}
            onChange={(v) => set('national_id', v)}
            label="اضغط لرفع صورة الهوية"
            maxHeight={130}
          />
        </FormRow>
        <FormRow label="صورة جواز السفر (اختياري)">
          <ImageUpload
            value={form.international_passport}
            onChange={(v) => set('international_passport', v)}
            label="اضغط لرفع صورة الجواز"
            maxHeight={130}
          />
        </FormRow>
      </div>

      <div style={{ margin: '0.5rem 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={changePassword}
            onChange={e => setChangePassword(e.target.checked)}
          />
          أريد تغيير كلمة المرور
        </label>
      </div>

      {changePassword && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormRow label="كلمة المرور الجديدة" required>
            <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} dir="ltr" />
            <FieldError msg={errors.password} />
          </FormRow>
          <FormRow label="تأكيد كلمة المرور" required>
            <input className="input" type="password" value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)} dir="ltr" />
            <FieldError msg={errors.password_confirmation} />
          </FormRow>
        </div>
      )}
    </Modal>
  )
}