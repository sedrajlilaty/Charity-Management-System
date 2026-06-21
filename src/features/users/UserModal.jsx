// ── UserModal.jsx ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, Camera, X } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import PermissionButton from '../../ui/PermissionButton'
const EMPTY = { name: '', email: '', phone: '', role: 'fieldWorker', status: 'active', image: null }

export default function UserModal({ open, onClose, onSave, editUser }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setForm(editUser ? { ...editUser } : EMPTY)
    setErrors({})
  }, [editUser, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => set('image', reader.result)
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = t('users.modal.errors.nameRequired')
    if (!form.email.trim()) e.email = t('users.modal.errors.emailRequired')
    if (!form.phone.trim()) e.phone = t('users.modal.errors.phoneRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}
      title={editUser ? t('users.modal.titleEdit') : t('users.modal.titleAdd')}
      footer={
        <>
          <PermissionButton  onClick={onClose} className="btn-outline" style={{ minWidth: '90px' }}>{t('users.modal.PermissionButtons.cancel')}</PermissionButton >
          <PermissionButton  onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: '120px' }}>
            {saving && <span className="spinner-small" />}
            {editUser ? t('users.modal.PermissionButtons.update') : t('users.modal.PermissionButtons.create')}
          </PermissionButton >
        </>
      }
    >
      {/* Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
        <div onClick={() => fileInputRef.current.click()}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdfa', color: '#094037', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #094037', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          {form.image ? <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={24} />}
          <div style={{ position: 'absolute', bottom: 0, background: 'rgba(13,82,71,0.6)', width: '100%', textAlign: 'center', padding: '2px 0' }}>
            <span style={{ fontSize: '10px', color: '#fff' }}>{editUser ? t('users.modal.changePhoto') : t('users.modal.uploadPhoto')}</span>
          </div>
        </div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
        {form.image && (
          <PermissionButton  onClick={() => set('image', null)} style={{ fontSize: '11px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <X size={12} />{t('users.modal.removePhoto')}
          </PermissionButton >
        )}
      </div>

      <FormRow label={t('users.modal.fullName')} required>
        <div style={{ position: 'relative' }}>
          <User size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingInlineEnd: '36px' }} placeholder={t('users.modal.namePlaceholder')} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <FieldError msg={errors.name} />
      </FormRow>

      <FormRow label={t('users.modal.email')} required>
        <div style={{ position: 'relative' }}>
          <Mail size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingInlineEnd: '36px' }} type="email" placeholder={t('users.modal.emailPlaceholder')} value={form.email} onChange={e => set('email', e.target.value)} dir="ltr" />
        </div>
        <FieldError msg={errors.email} />
      </FormRow>

      <FormRow label={t('users.modal.phone')} required>
        <div style={{ position: 'relative' }}>
          <Phone size={14} style={{ position: 'absolute', top: '50%', insetInlineEnd: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingInlineEnd: '36px' }} type="tel" placeholder={t('users.modal.phonePlaceholder')} value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
        </div>
        <FieldError msg={errors.phone} />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('users.modal.role')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="admin">{t('users.modal.roles.admin')}</option>
            <option value="fieldWorker">{t('users.modal.roles.fieldWorker')}</option>
          </select>
        </FormRow>
        <FormRow label={t('users.modal.status')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">{t('users.modal.statuses.active')}</option>
            <option value="inactive">{t('users.modal.statuses.inactive')}</option>
          </select>
        </FormRow>
      </div>
    </Modal>
  )
}