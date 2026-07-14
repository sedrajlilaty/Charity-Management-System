// features/campaigns/CampaignModal.jsx  (مترجمة بالكامل عبر react-i18next)
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import ImageUpload from '../../ui/ImageUpload'
import PermissionButton from '../../ui/PermissionButton'
import { SpinnerPage } from '../../ui/Spinner'
import { useCampaignQuery } from '../../hooks/Usecampaigns ' // ⚠️ عدّلي المسار حسب مشروعك
import { CAMPAIGN_TYPES, PARTICIPATION_TYPES, EDITABLE_STATUSES } from './campaignConstants'

const todayStr = () => new Date().toISOString().split('T')[0]

// الباك بيرجع تاريخ ISO كامل مع وقت "2026-07-01T00:00:00.000000Z"
// بينما input type="date" بده بالضبط "yyyy-MM-dd" وإلا React بيرمي warning وما بيعبّي القيمة
const toDateInputValue = (value) => {
  if (!value) return ''
  return String(value).split('T')[0]
}

const EMPTY = {
  title:             '',
  description:       '',
  type:              '',
  participationType: 'donation_only',
  amountNeeded:      '',
  volunteersNeeded:  '',
  status:            'open',
  startDate:         '',
  endDate:           '',
  media:             [],
  existingMedia:     [],
}

// campaignId = null → إنشاء جديد | رقم → تعديل حملة موجودة (بيجيب التفاصيل الكاملة لحاله)
export default function CampaignModal({ open, onClose, onSave, campaignId }) {
  const { t } = useTranslation()
  const isEdit = !!campaignId

  const { data: fullCampaign, isLoading: loadingDetails } = useCampaignQuery(isEdit ? campaignId : null)

  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState(null)

  const statusIsSystemManaged = isEdit && fullCampaign && !EDITABLE_STATUSES.some(s => s.value === fullCampaign.status)

  useEffect(() => {
    if (!open) return
    if (isEdit && fullCampaign) {
      setForm({
        ...EMPTY,
        title:             fullCampaign.title || '',
        description:       fullCampaign.description || '',
        type:              fullCampaign.type || '',
        participationType: fullCampaign.participationType || 'donation_only',
        amountNeeded:      String(fullCampaign.amountNeeded ?? ''),
        volunteersNeeded:  String(fullCampaign.volunteersNeeded ?? ''),
        status:            fullCampaign.status || 'open',
        startDate:         toDateInputValue(fullCampaign.startDate),
        endDate:           toDateInputValue(fullCampaign.endDate),
        media:             [],
        existingMedia:     fullCampaign.media || [],
      })
    } else if (!isEdit) {
      setForm({ ...EMPTY, startDate: todayStr() })
    }
    setErrors({})
    setServerError(null)
  }, [isEdit, fullCampaign, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const acceptsDonations  = ['donation_only', 'donation_and_volunteer'].includes(form.participationType)
  const acceptsVolunteers = ['volunteer_only', 'donation_and_volunteer'].includes(form.participationType)

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title = t('campaigns.modal.errors.nameRequired')
    if (!form.description.trim()) e.description = t('campaigns.modal.errors.descriptionRequired')
    if (!form.type)                e.type = t('campaigns.modal.errors.typeRequired')
    if (!form.status)              e.status = t('campaigns.modal.errors.statusRequired')

    if (acceptsDonations && (!form.amountNeeded || Number(form.amountNeeded) <= 0)) {
      e.amountNeeded = t('campaigns.modal.errors.amountRequired')
    }
    if (acceptsVolunteers && (!form.volunteersNeeded || Number(form.volunteersNeeded) <= 0)) {
      e.volunteersNeeded = t('campaigns.modal.errors.volunteersRequired')
    }

    if (!isEdit) {
      if (!form.startDate) {
        e.startDate = t('campaigns.modal.errors.startDateRequired')
      } else if (form.startDate < todayStr()) {
        e.startDate = t('campaigns.modal.errors.startDatePast')
      }
      if (!form.media.length) {
        e.media = t('campaigns.modal.errors.mediaRequired')
      }
    }

    if (!form.endDate) {
      e.endDate = t('campaigns.modal.errors.endDateRequired')
    } else {
      const minEnd = isEdit ? todayStr() : (form.startDate || todayStr())
      if (form.endDate <= minEnd) {
        e.endDate = isEdit
          ? t('campaigns.modal.errors.endDateFuture')
          : t('campaigns.modal.errors.endDateAfterStart')
      }
    }

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setServerError(null)
    try {
      await onSave({
        title:             form.title,
        description:       form.description,
        type:              form.type,
        participationType: form.participationType,
        amountNeeded:      acceptsDonations ? Number(form.amountNeeded) : null,
        volunteersNeeded:  acceptsVolunteers ? Number(form.volunteersNeeded) : null,
        status:            statusIsSystemManaged ? undefined : form.status,
        startDate:         isEdit ? undefined : form.startDate,
        endDate:           form.endDate,
        media:             form.media,
      })
      onClose()
    } catch (err) {
      // ⚠️ هون رح تطلع رسالة الباك الحقيقية بالكونسول (مو بس "500")
      console.error('Campaign save failed:', err.response?.data || err.message)
      if (err.response?.status === 422) {
        // أخطاء validation من لارافيل: { message, errors: { field: [msgs] } }
        const serverErrors = err.response.data?.errors || {}
        const mapped = {}
        Object.keys(serverErrors).forEach((key) => {
          const localKey = key === 'title' ? 'title'
            : key === 'amount_needed' ? 'amountNeeded'
            : key === 'volunteers_needed' ? 'volunteersNeeded'
            : key === 'start_date' ? 'startDate'
            : key === 'end_date' ? 'endDate'
            : key
          mapped[localKey] = serverErrors[key][0]
        })
        setErrors((prev) => ({ ...prev, ...mapped }))
        setServerError(err.response.data?.message || 'يوجد أخطاء بالبيانات، تأكدي من الحقول.')
      } else {
        setServerError(err.response?.data?.message || 'حصل خطأ غير متوقع أثناء الحفظ. حاولي مرة تانية.')
      }
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('campaigns.modal.titleEdit') : t('campaigns.modal.titleAdd')}
      footer={
        <>
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {t('campaigns.modal.PermissionButtons.cancel')}
          </PermissionButton>
          <PermissionButton
            onClick={handleSave}
            disabled={saving || (isEdit && loadingDetails)}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {saving && (
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            )}
            {isEdit ? t('campaigns.modal.PermissionButtons.update') : t('campaigns.modal.PermissionButtons.create')}
          </PermissionButton>
        </>
      }
    >
      {isEdit && loadingDetails ? (
        <div style={{ padding: '2rem 0' }}><SpinnerPage /></div>
      ) : (
        <>
          {serverError && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: '0.75rem',
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
              color: '#dc2626', fontSize: '0.85rem',
            }}>
              {serverError}
            </div>
          )}

          {isEdit && form.existingMedia.length > 0 && (
            <FormRow label={t('campaigns.modal.existingMedia')}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {form.existingMedia.map((m) => (
                  <img
                    key={m.id}
                    src={m.url}
                    alt=""
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-subtle)' }}
                  />
                ))}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {t('campaigns.modal.existingMediaNote')}
              </p>
            </FormRow>
          )}

          <FormRow label={isEdit ? t('campaigns.modal.newMedia') : t('campaigns.modal.media')} required={!isEdit}>
            <ImageUpload
              value={form.media[0] || null}
              onChange={(v) => set('media', v ? [v] : [])}
              label={t('campaigns.modal.mediaUploadLabel')}
              maxHeight={160}
            />
            <FieldError msg={errors.media} />
          </FormRow>

          <FormRow label={t('campaigns.modal.name')} required>
            <input
              className="input"
              placeholder={t('campaigns.modal.namePlaceholder')}
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            <FieldError msg={errors.title} />
          </FormRow>

          <FormRow label={t('campaigns.modal.description')} required>
            <textarea
              className="input"
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder={t('campaigns.modal.descPlaceholder')}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            <FieldError msg={errors.description} />
          </FormRow>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormRow label={t('campaigns.modal.type')} required>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">{t('campaigns.modal.selectType')}</option>
                {CAMPAIGN_TYPES.map(o => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
              <FieldError msg={errors.type} />
            </FormRow>

            <FormRow label={t('campaigns.modal.participationType')} required>
              <select
                className="input"
                value={form.participationType}
                onChange={e => set('participationType', e.target.value)}
              >
                {PARTICIPATION_TYPES.map(o => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
            </FormRow>
          </div>

          {acceptsDonations && (
            <FormRow label={t('campaigns.modal.targetAmount')} required>
              <input
                className="input"
                type="number"
                min={1}
                placeholder={t('campaigns.modal.targetPlaceholder')}
                value={form.amountNeeded}
                onChange={e => set('amountNeeded', e.target.value)}
                dir="ltr"
              />
              <FieldError msg={errors.amountNeeded} />
            </FormRow>
          )}

          {acceptsVolunteers && (
            <FormRow label={t('campaigns.modal.volunteersNeeded')} required>
              <input
                className="input"
                type="number"
                min={1}
                placeholder={t('campaigns.modal.volunteersPlaceholder')}
                value={form.volunteersNeeded}
                onChange={e => set('volunteersNeeded', e.target.value)}
                dir="ltr"
              />
              <FieldError msg={errors.volunteersNeeded} />
            </FormRow>
          )}

          <FormRow label={t('campaigns.modal.status')} required>
            {statusIsSystemManaged ? (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t('campaigns.modal.systemManagedStatus', { status: t(`campaigns.statuses.${fullCampaign.status}`) })}
              </div>
            ) : (
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {EDITABLE_STATUSES.map(o => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
            )}
            <FieldError msg={errors.status} />
          </FormRow>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormRow label={t('campaigns.modal.startDate')} required={!isEdit}>
              <input
                className="input"
                type="date"
                min={isEdit ? undefined : todayStr()}
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                disabled={isEdit}
                dir="ltr"
              />
              {isEdit ? (
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {t('campaigns.modal.startDateLocked')}
                </p>
              ) : (
                <FieldError msg={errors.startDate} />
              )}
            </FormRow>
            <FormRow label={t('campaigns.modal.endDate')} required>
              <input
                className="input"
                type="date"
                min={isEdit ? todayStr() : (form.startDate || todayStr())}
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                dir="ltr"
              />
              <FieldError msg={errors.endDate} />
            </FormRow>
          </div>
        </>
      )}
    </Modal>,
    document.body
  )
}