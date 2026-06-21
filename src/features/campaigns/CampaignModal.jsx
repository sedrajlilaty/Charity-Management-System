// features/campaigns/CampaignModal.jsx  (النسخة المحدّثة)
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import ImageUpload from '../../ui/ImageUpload'       // ✅ جديد
import PermissionButton from '../../ui/PermissionButton'

const EMPTY = {
  name:             '',
  description:      '',
  targetAmount:     '',
  startDate:        '',
  endDate:          '',
  status:           'active',
  volunteersNeeded: '',    // ✅ جديد: عدد المتطوعين المطلوب
  coverImage:       null,  // ✅ جديد: صورة الغلاف
}

export default function CampaignModal({ open, onClose, onSave, editItem }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editItem
      ? {
          ...EMPTY,
          ...editItem,
          targetAmount:     String(editItem.targetAmount || ''),
          volunteersNeeded: String(editItem.volunteersNeeded || ''),
        }
      : EMPTY
    )
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())                                    e.name         = t('campaigns.modal.errors.nameRequired')
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = t('campaigns.modal.errors.amountRequired')
    if (form.volunteersNeeded && Number(form.volunteersNeeded) < 0) e.volunteersNeeded = 'العدد لا يمكن أن يكون سالباً'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave({
      ...form,
      targetAmount:     Number(form.targetAmount),
      volunteersNeeded: form.volunteersNeeded ? Number(form.volunteersNeeded) : 0,
    })
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
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {t('campaigns.modal.PermissionButtons.cancel')}
          </PermissionButton>
          <PermissionButton
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {saving && (
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            )}
            {editItem ? t('campaigns.modal.PermissionButtons.update') : t('campaigns.modal.PermissionButtons.create')}
          </PermissionButton>
        </>
      }
    >
      {/* ── صورة الغلاف ── */}
      <FormRow label="صورة غلاف الحملة">
        <ImageUpload
          value={form.coverImage}
          onChange={v => set('coverImage', v)}
          label="اضغط أو اسحب صورة غلاف الحملة"
          maxHeight={160}
        />
      </FormRow>

      {/* ── اسم الحملة ── */}
      <FormRow label={t('campaigns.modal.name')} required>
        <input
          className="input"
          placeholder={t('campaigns.modal.namePlaceholder')}
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
        <FieldError msg={errors.name} />
      </FormRow>

      {/* ── الوصف ── */}
      <FormRow label={t('campaigns.modal.description')}>
        <textarea
          className="input"
          rows={3}
          style={{ resize: 'vertical' }}
          placeholder={t('campaigns.modal.descPlaceholder')}
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </FormRow>

      {/* ── المبلغ / الحالة ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('campaigns.modal.targetAmount')} required>
          <input
            className="input"
            type="number"
            min={0}
            placeholder={t('campaigns.modal.targetPlaceholder')}
            value={form.targetAmount}
            onChange={e => set('targetAmount', e.target.value)}
            dir="ltr"
          />
          <FieldError msg={errors.targetAmount} />
        </FormRow>

        <FormRow label={t('campaigns.modal.status')}>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">{t('campaigns.modal.statuses.active')}</option>
            <option value="draft">{t('campaigns.modal.statuses.draft')}</option>
            <option value="completed">{t('campaigns.modal.statuses.completed')}</option>
          </select>
        </FormRow>
      </div>

      {/* ── التواريخ ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('campaigns.modal.startDate')}>
          <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} dir="ltr" />
        </FormRow>
        <FormRow label={t('campaigns.modal.endDate')}>
          <input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} dir="ltr" />
        </FormRow>
      </div>

      {/* ✅ عدد المتطوعين المطلوب ── */}
      <FormRow label="عدد المتطوعين المطلوب">
        <input
          className="input"
          type="number"
          min={0}
          placeholder="مثال: 20 متطوع"
          value={form.volunteersNeeded}
          onChange={e => set('volunteersNeeded', e.target.value)}
          dir="ltr"
        />
        <FieldError msg={errors.volunteersNeeded} />
        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          اتركه فارغاً إذا لم تكن الحملة بحاجة لمتطوعين
        </p>
      </FormRow>
    </Modal>,
    document.body
  )
}