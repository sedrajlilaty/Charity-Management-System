import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal, { FieldError, FormRow } from '../../ui/Modal'

const EMPTY_FORM = {
  donorName:    '',
  amount:       '',
  type:         'cash',
  campaignName: '',
  recurring:    false,
}

export default function DonationModal({ open, onClose, onSave }) {
  // ✅ useTranslation() بدون namespace — نصل بـ donations.modal.xxx
  const { t } = useTranslation()
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(EMPTY_FORM)
    setErrors({})
  }, [open])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const nextErrors = {}
    if (!form.donorName.trim())                    nextErrors.donorName = t('donations.modal.errors.donorRequired')
    if (!form.amount || Number(form.amount) <= 0)  nextErrors.amount    = t('donations.modal.errors.amountInvalid')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSave({ ...form, amount: Number(form.amount), status: 'pending' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('donations.modal.titleAdd')}
      footer={
        <>
          <button onClick={onClose} className="btn-outline">
            {t('donations.modal.cancel')}
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            {t('donations.modal.save')}
          </button>
        </>
      }
    >
      <FormRow label={t('donations.modal.donorName')} required>
        <input
          className="input"
          placeholder={t('donations.modal.donorPlaceholder')}
          value={form.donorName}
          onChange={(e) => set('donorName', e.target.value)}
        />
        <FieldError msg={errors.donorName} />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('donations.modal.amount')} required>
          <input
            className="input" type="number" min={1}
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
          <FieldError msg={errors.amount} />
        </FormRow>

        <FormRow label={t('donations.modal.type')}>
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="cash">{t('donations.modal.types.cash')}</option>
            <option value="transfer">{t('donations.modal.types.transfer')}</option>
            <option value="inkind">{t('donations.modal.types.inkind')}</option>
          </select>
        </FormRow>
      </div>

      <FormRow label={t('donations.modal.campaign')}>
        <input
          className="input"
          placeholder={t('donations.modal.campaignPlaceholder')}
          value={form.campaignName}
          onChange={(e) => set('campaignName', e.target.value)}
        />
      </FormRow>

      <FormRow label={t('donations.modal.recurring')}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(e) => set('recurring', e.target.checked)}
          />
          {t('donations.modal.recurringLabel')}
        </label>
      </FormRow>
    </Modal>
  )
}