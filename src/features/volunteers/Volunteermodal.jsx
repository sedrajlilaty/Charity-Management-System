// ── VolunteerModal.jsx ────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const EMPTY = { name: '', phone: '', email: '', campaignId: '', skill: '', availability: '', experience: '', notes: '' }

export default function VolunteerModal({ open, onClose, onSave, editItem, campaigns = [] }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editItem ? { ...editItem } : EMPTY)
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name         = t('volunteers.modal.errors.nameRequired')
    if (!form.phone.trim())   e.phone        = t('volunteers.modal.errors.phoneRequired')
    if (!form.campaignId)     e.campaignId   = t('volunteers.modal.errors.campaignRequired')
    if (!form.skill)          e.skill        = t('volunteers.modal.errors.skillRequired')
    if (!form.availability)   e.availability = t('volunteers.modal.errors.availabilityRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave?.(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}
      title={editItem ? t('volunteers.modal.titleEdit') : t('volunteers.modal.titleAdd')}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {t('volunteers.modal.buttons.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: '120px' }}>
            {saving && <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', marginInlineEnd:'8px' }} />}
            {editItem ? t('volunteers.modal.buttons.update') : t('volunteers.modal.buttons.create')}
          </button>
        </>
      }
    >
      <FormRow label={t('volunteers.modal.name')} required>
        <input className="input" placeholder={t('volunteers.modal.namePlaceholder')} value={form.name} onChange={e => set('name', e.target.value)} />
        <FieldError msg={errors.name} />
      </FormRow>

      <FormRow label={t('volunteers.modal.phone')} required>
        <input className="input" type="tel" placeholder={t('volunteers.modal.phonePlaceholder')} value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
        <FieldError msg={errors.phone} />
      </FormRow>

      <FormRow label={t('volunteers.modal.email')}>
        <input className="input" type="email" placeholder="example@email.com" value={form.email} onChange={e => set('email', e.target.value)} dir="ltr" />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('volunteers.modal.campaign')} required>
          <select className="input" style={{ fontSize: '1rem' }} value={form.campaignId} onChange={e => set('campaignId', e.target.value)}>
            <option value="">{t('volunteers.modal.campaignPlaceholder')}</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <FieldError msg={errors.campaignId} />
        </FormRow>

        <FormRow label={t('volunteers.modal.skill')} required>
          <select className="input" style={{ fontSize: '1rem' }} value={form.skill} onChange={e => set('skill', e.target.value)}>
            <option value="">{t('volunteers.modal.skillPlaceholder')}</option>
            {['medical','teaching','logistics','social','technical','other'].map(s => (
              <option key={s} value={s}>{t(`volunteers.modal.skills.${s}`)}</option>
            ))}
          </select>
          <FieldError msg={errors.skill} />
        </FormRow>

        <FormRow label={t('volunteers.modal.availability')} required>
          <select className="input" style={{ fontSize: '1rem' }} value={form.availability} onChange={e => set('availability', e.target.value)}>
            <option value="">{t('volunteers.modal.availabilityPlaceholder')}</option>
            {['morning','evening','weekend','flexible'].map(a => (
              <option key={a} value={a}>{t(`volunteers.modal.availability_options.${a}`)}</option>
            ))}
          </select>
          <FieldError msg={errors.availability} />
        </FormRow>

        <FormRow label={t('volunteers.modal.experience')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.experience} onChange={e => set('experience', e.target.value)}>
            <option value="">{t('volunteers.modal.experiencePlaceholder')}</option>
            {['none','1_2','3_5','5_plus'].map(ex => (
              <option key={ex} value={ex}>{t(`volunteers.modal.experience_options.${ex}`)}</option>
            ))}
          </select>
        </FormRow>
      </div>

      <FormRow label={t('volunteers.modal.notes')}>
        <textarea className="input" rows="3" placeholder={t('volunteers.modal.notesPlaceholder')} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
      </FormRow>
    </Modal>
  )
}