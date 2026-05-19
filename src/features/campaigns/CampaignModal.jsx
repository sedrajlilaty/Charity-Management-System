import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import { createPortal } from 'react-dom'
const EMPTY = { name: '', description: '', targetAmount: '', startDate: '', endDate: '', status: 'active' }

export default function CampaignModal({ open, onClose, onSave, editItem }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editItem ? { ...editItem, targetAmount: String(editItem.targetAmount) } : EMPTY)
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())                                  e.name         = t('campaigns.modal.errors.nameRequired')
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = t('campaigns.modal.errors.amountRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave({ ...form, targetAmount: Number(form.targetAmount) })
    setSaving(false)
    onClose()
  }

  return createPortal(
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? t('campaigns.modal.titleEdit') : t('campaigns.modal.titleAdd')}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {t('campaigns.modal.buttons.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: '120px' }}>
            {saving && (
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            )}
            {editItem ? t('campaigns.modal.buttons.update') : t('campaigns.modal.buttons.create')}
          </button>
        </>
      }
    >
      <FormRow label={t('campaigns.modal.name')} required>
        <input className="input" placeholder={t('campaigns.modal.namePlaceholder')} value={form.name} onChange={e => set('name', e.target.value)} />
        <FieldError msg={errors.name} />
      </FormRow>

      <FormRow label={t('campaigns.modal.description')}>
        <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder={t('campaigns.modal.descPlaceholder')} value={form.description} onChange={e => set('description', e.target.value)} />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('campaigns.modal.targetAmount')} required>
          <input className="input" type="number" min={0} placeholder={t('campaigns.modal.targetPlaceholder')} value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} dir="ltr" />
          <FieldError msg={errors.targetAmount} />
        </FormRow>

        <FormRow label={t('campaigns.modal.status')}>
          <select className="input" style={{ fontSize: '1rem' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">{t('campaigns.modal.statuses.active')}</option>
            <option value="draft">{t('campaigns.modal.statuses.draft')}</option>
            <option value="completed">{t('campaigns.modal.statuses.completed')}</option>
          </select>
        </FormRow>

        <FormRow label={t('campaigns.modal.startDate')}>
          <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} dir="ltr" />
        </FormRow>

        <FormRow label={t('campaigns.modal.endDate')}>
          <input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} dir="ltr" />
        </FormRow>
      </div>
    </Modal>,
     document.body
  )
}