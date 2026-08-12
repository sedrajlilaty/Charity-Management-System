// src/pages/users/UserModal.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, Camera, X } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import PermissionButton from '../../ui/PermissionButton'

const EMPTY = {
  first_name: '',
  last_name:  '',
  email:      '',
  phone:      '',
  password:   '',
  role:       'field_worker',  // رول الباك اند الحقيقي
  status:     'approved',
  imageFile:  null,            // File object للرفع
  imagePreview: null,          // base64 للعرض فقط
}

export default function UserModal({ open, onClose, onSave, editUser }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const isEdit = Boolean(editUser)

  useEffect(() => {
    if (editUser) {
      // تقسيم الاسم الكامل لو جاء موحد من الداشبورد
      const nameParts = (editUser.name ?? '').split(' ')
      setForm({
        first_name:   editUser.first_name ?? nameParts[0] ?? '',
        last_name:    editUser.last_name  ?? nameParts.slice(1).join(' ') ?? '',
        email:        editUser.email   ?? '',
        phone:        editUser.phone   ?? '',
        password:     '',
        role:         editUser.role    ?? 'field_worker',
        status:       editUser.status  ?? 'approved',
        imageFile:    null,
        imagePreview: editUser.profile_image
          ? `${import.meta.env.VITE_STORAGE_URL ?? ''}/${editUser.profile_image}`
          : null,
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [editUser, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── اختيار الصورة (وضع الإضافة فقط) ───────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    set('imageFile', file)

    // preview فقط
    const reader = new FileReader()
    reader.onloadend = () => set('imagePreview', reader.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    set('imageFile', null)
    set('imagePreview', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {}

    if (isEdit) {
      // بوضع التعديل ما في شي مطلوب غير role/status، وهنن select دايماً معبّيين
      setErrors(e)
      return true
    }

    if (!form.first_name.trim()) e.first_name = t('users.modal.errors.firstNameRequired', { defaultValue: 'الاسم الأول مطلوب' })
    if (!form.last_name.trim())  e.last_name  = t('users.modal.errors.lastNameRequired',  { defaultValue: 'الاسم الأخير مطلوب' })
    if (!form.email.trim())      e.email      = t('users.modal.errors.emailRequired')
    if (!form.phone.trim())      e.phone      = t('users.modal.errors.phoneRequired')
    if (!form.password.trim())   e.password   = t('users.modal.errors.passwordRequired', { defaultValue: 'كلمة المرور مطلوبة' })
    if (!form.imageFile)         e.image      = t('users.modal.errors.imageRequired', { defaultValue: 'صورة البروفايل مطلوبة' })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── الحفظ ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        // بوضع التعديل: نبعت فقط role و status
        await onSave({
          role:   form.role,
          status: form.status,
        })
      } else {
        await onSave({
          first_name:            form.first_name.trim(),
          last_name:             form.last_name.trim(),
          email:                 form.email.trim(),
          phone:                 form.phone.trim(),
          password:              form.password,
          password_confirmation: form.password,
          role:                  form.role,
          status:                form.status,
          profile_image:         form.imageFile ?? undefined, // File object أو undefined
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('users.modal.titleEdit') : t('users.modal.titleAdd')}
      footer={
        <>
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '90px' }}>
            {t('users.modal.PermissionButtons.cancel')}
          </PermissionButton>
          <PermissionButton onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: '120px' }}>
            {saving && <span className="spinner-small" />}
            {isEdit ? t('users.modal.PermissionButtons.update') : t('users.modal.PermissionButtons.create')}
          </PermissionButton>
        </>
      }
    >
      {/* صورة البروفايل */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
        <div
          onClick={() => !isEdit && fileInputRef.current.click()}
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#f0fdfa', color: 'var(--color-primary-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--color-primary-500)', cursor: isEdit ? 'default' : 'pointer',
            position: 'relative', overflow: 'hidden', opacity: isEdit ? 0.85 : 1,
          }}
        >
          {form.imagePreview
            ? <img src={form.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Camera size={24} />
          }
          {!isEdit && (
            <div style={{ position: 'absolute', bottom: 0, background: 'rgba(13,82,71,0.6)', width: '100%', textAlign: 'center', padding: '2px 0' }}>
              <span style={{ fontSize: '10px', color: '#fff' }}>
                {t('users.modal.uploadPhoto')}
              </span>
            </div>
          )}
        </div>
        {!isEdit && (
          <>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
            {form.imagePreview && (
              <PermissionButton
                onClick={removeImage}
                style={{ fontSize: '11px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <X size={12} /> {t('users.modal.removePhoto')}
              </PermissionButton>
            )}
            {errors.image && (
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.image}</span>
            )}
            {!form.imagePreview && !errors.image && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {t('users.modal.imageRequired', { defaultValue: '* الصورة مطلوبة' })}
              </span>
            )}
          </>
        )}
      </div>

      {isEdit ? (
        // ── وضع التعديل: بيانات للعرض فقط ─────────────────────
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 10 }}>
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {form.first_name} {form.last_name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 10 }}>
            <Mail size={14} style={{ color: 'var(--text-muted)' }} />
            <span dir="ltr" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{form.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 10 }}>
            <Phone size={14} style={{ color: 'var(--text-muted)' }} />
            <span dir="ltr" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{form.phone}</span>
          </div>
        </div>
      ) : (
        <>
          {/* الاسم الأول + الأخير */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormRow label={t('users.modal.firstName', { defaultValue: 'الاسم الأول' })} required>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  style={{ paddingInlineEnd: '36px' }}
                  placeholder={t('users.modal.firstNamePlaceholder', { defaultValue: 'أدخل الاسم الأول' })}
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                />
              </div>
              <FieldError msg={errors.first_name} />
            </FormRow>

            <FormRow label={t('users.modal.lastName', { defaultValue: 'الاسم الأخير' })} required>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                   autoComplete="off"
                  style={{ paddingInlineEnd: '36px' }}
                  placeholder={t('users.modal.lastNamePlaceholder', { defaultValue: 'أدخل الاسم الأخير' })}
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                />
              </div>
              <FieldError msg={errors.last_name} />
            </FormRow>
          </div>

          {/* الإيميل */}
          <FormRow label={t('users.modal.email')} required>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input"
                 autoComplete="off"
                style={{ paddingInlineEnd: '36px' }}
                type="email"
                placeholder={t('users.modal.emailPlaceholder')}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                dir="ltr"
              />
            </div>
            <FieldError msg={errors.email} />
          </FormRow>

          {/* الهاتف */}
          <FormRow label={t('users.modal.phone')} required>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input"
                 autoComplete="off"
                style={{ paddingInlineEnd: '36px' }}
                type="tel"
                placeholder={t('users.modal.phonePlaceholder')}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                dir="ltr"
              />
            </div>
            <FieldError msg={errors.phone} />
          </FormRow>

          {/* كلمة المرور — مطلوبة فقط عند الإنشاء */}
          <FormRow label={t('users.modal.password', { defaultValue: 'كلمة المرور' })} required>
            <input
              className="input"
               autoComplete="off"
              type="password"
              placeholder={t('users.modal.passwordPlaceholder', { defaultValue: 'أدخل كلمة المرور' })}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              dir="ltr"
            />
            <FieldError msg={errors.password} />
          </FormRow>
        </>
      )}

      {/* الرول والحالة — قابلين للتعديل دايماً (إنشاء وتعديل) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('users.modal.role')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="sub_admin">{t('users.modal.roles.supervisor', { defaultValue: 'مشرف' })}</option>
            <option value="field_worker">{t('users.modal.roles.fieldWorker')}</option>
          </select>
        </FormRow>

        <FormRow label={t('users.modal.status')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="approved">{t('users.modal.statuses.active')}</option>
            <option value="pending">{t('users.modal.statuses.inactive')}</option>
            <option value="rejected">{t('users.modal.statuses.rejected', { defaultValue: 'مرفوض' })}</option>
          </select>
        </FormRow>
      </div>
    </Modal>
  )
}