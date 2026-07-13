// features/campaigns/CampaignModal.jsx  (مطابقة تماماً لـ StoreCampaignRequest / UpdateCampaignRequest)
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import ImageUpload from '../../ui/ImageUpload'
import PermissionButton from '../../ui/PermissionButton'

// ⚠️ القيم لازم تطابق enums الباك بالظبط
const CAMPAIGN_TYPES = [
  { value: 'educational',   label: 'تعليمية' },
  { value: 'medical',       label: 'طبية' },
  { value: 'humanitarian',  label: 'إنسانية' },
  { value: 'environmental', label: 'بيئية' },
]

const PARTICIPATION_TYPES = [
  { value: 'donation_only',          label: 'تبرعات فقط' },
  { value: 'volunteer_only',         label: 'تطوع فقط' },
  { value: 'donation_and_volunteer', label: 'تبرعات وتطوع' },
]

// الحالات المسموح للمستخدم يحددها يدوياً فقط (الباقي زي completed_* و expired منظومة تلقائية)
const EDITABLE_STATUSES = [
  { value: 'open',      label: 'مفتوحة' },
  { value: 'closed',    label: 'مغلقة' },
  { value: 'paused',    label: 'متوقفة مؤقتاً' },
  { value: 'cancelled', label: 'ملغاة' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

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
  media:             [],   // صور جديدة (base64[]) لسا ما انبعتت
  existingMedia:     [],   // صور موجودة مسبقاً (بالتعديل فقط) — للعرض فقط
}

export default function CampaignModal({ open, onClose, onSave, editItem }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isEdit = !!editItem
  // إذا الحالة الحالية مو من الحالات القابلة للتعديل يدوياً (يعني تلقائية من النظام)
  const statusIsSystemManaged = isEdit && !EDITABLE_STATUSES.some(s => s.value === editItem?.status)

  useEffect(() => {
    if (editItem) {
      setForm({
        ...EMPTY,
        title:             editItem.title || '',
        description:       editItem.description || '',
        type:              editItem.type || '',
        participationType: editItem.participationType || 'donation_only',
        amountNeeded:      String(editItem.amountNeeded ?? ''),
        volunteersNeeded:  String(editItem.volunteersNeeded ?? ''),
        status:            editItem.status || 'open',
        startDate:         editItem.startDate || '',
        endDate:           editItem.endDate || '',
        media:             [],
        existingMedia:     editItem.media || [],
      })
    } else {
      setForm({ ...EMPTY, startDate: todayStr() })
    }
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const acceptsDonations  = ['donation_only', 'donation_and_volunteer'].includes(form.participationType)
  const acceptsVolunteers = ['volunteer_only', 'donation_and_volunteer'].includes(form.participationType)

  const validate = () => {
    const e = {}
    if (!form.title.trim())        e.title = t('campaigns.modal.errors.nameRequired')
    if (!form.description.trim()) e.description = 'وصف الحملة مطلوب'
    if (!form.type)                e.type = 'الرجاء اختيار نوع الحملة'
    if (!form.status)              e.status = 'الرجاء اختيار حالة الحملة'

    if (acceptsDonations && (!form.amountNeeded || Number(form.amountNeeded) <= 0)) {
      e.amountNeeded = t('campaigns.modal.errors.amountRequired')
    }
    if (acceptsVolunteers && (!form.volunteersNeeded || Number(form.volunteersNeeded) <= 0)) {
      e.volunteersNeeded = 'عدد المتطوعين مطلوب لهذا النوع من الحملات'
    }

    if (!isEdit) {
      // بالإنشاء فقط: start_date إلزامي ولازم يكون اليوم أو بالمستقبل
      if (!form.startDate) {
        e.startDate = 'تاريخ البداية مطلوب'
      } else if (form.startDate < todayStr()) {
        e.startDate = 'تاريخ البداية لا يمكن أن يكون بالماضي'
      }
      // صورة واحدة على الأقل إلزامية بالإنشاء
      if (!form.media.length) {
        e.media = 'صورة واحدة على الأقل مطلوبة للحملة'
      }
    }

    if (!form.endDate) {
      e.endDate = 'تاريخ النهاية مطلوب'
    } else {
      const minEnd = isEdit ? todayStr() : (form.startDate || todayStr())
      if (form.endDate <= minEnd) {
        e.endDate = isEdit
          ? 'تاريخ النهاية يجب أن يكون تاريخاً مستقبلياً'
          : 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
      }
    }

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave({
      title:             form.title,
      description:       form.description,
      type:              form.type,
      participationType: form.participationType,
      amountNeeded:      acceptsDonations ? Number(form.amountNeeded) : null,
      volunteersNeeded:  acceptsVolunteers ? Number(form.volunteersNeeded) : null,
      status:            form.status,
      // start_date ما بينبعت أبداً بالتعديل — الباك بيرفضه (prohibited)
      startDate:         isEdit ? undefined : form.startDate,
      endDate:           form.endDate,
      media:             form.media, // base64[] فقط الجديدة
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
      {/* ── صور موجودة مسبقاً (بالتعديل فقط) ── */}
      {isEdit && form.existingMedia.length > 0 && (
        <FormRow label="الصور الحالية">
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
            لا يمكن حذف الصور الحالية من الواجهة حالياً. أي صورة جديدة رح تُضاف معهن، مش تستبدلهن.
          </p>
        </FormRow>
      )}

      {/* ── صورة جديدة ── */}
      <FormRow label={isEdit ? 'إضافة صورة جديدة (اختياري)' : 'صورة الحملة'} required={!isEdit}>
        <ImageUpload
          value={form.media[0] || null}
          onChange={(v) => set('media', v ? [v] : [])}
          label="اضغط أو اسحب صورة للحملة"
          maxHeight={160}
        />
        <FieldError msg={errors.media} />
      </FormRow>

      {/* ── اسم الحملة ── */}
      <FormRow label={t('campaigns.modal.name')} required>
        <input
          className="input"
          placeholder={t('campaigns.modal.namePlaceholder')}
          value={form.title}
          onChange={e => set('title', e.target.value)}
        />
        <FieldError msg={errors.title} />
      </FormRow>

      {/* ── الوصف (إلزامي) ── */}
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

      {/* ── نوع الحملة / نوع المشاركة ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="نوع الحملة" required>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="">اختر النوع</option>
            {CAMPAIGN_TYPES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <FieldError msg={errors.type} />
        </FormRow>

        <FormRow label="نوع المشاركة" required>
          <select
            className="input"
            value={form.participationType}
            onChange={e => set('participationType', e.target.value)}
          >
            {PARTICIPATION_TYPES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FormRow>
      </div>

      {/* ── المبلغ المطلوب (فقط إذا الحملة تقبل تبرعات) ── */}
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

      {/* ── عدد المتطوعين (فقط إذا الحملة تقبل متطوعين) ── */}
      {acceptsVolunteers && (
        <FormRow label="عدد المتطوعين المطلوب" required>
          <input
            className="input"
            type="number"
            min={1}
            placeholder="مثال: 20 متطوع"
            value={form.volunteersNeeded}
            onChange={e => set('volunteersNeeded', e.target.value)}
            dir="ltr"
          />
          <FieldError msg={errors.volunteersNeeded} />
        </FormRow>
      )}

      {/* ── حالة الحملة ── */}
      <FormRow label="حالة الحملة" required>
        {statusIsSystemManaged ? (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            هذه الحالة ({editItem.status}) محددة تلقائياً من النظام ولا يمكن تعديلها يدوياً هون.
          </div>
        ) : (
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {EDITABLE_STATUSES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        <FieldError msg={errors.status} />
      </FormRow>

      {/* ── التواريخ ── */}
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
              تاريخ البداية لا يمكن تعديله بعد إنشاء الحملة
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
    </Modal>,
    document.body
  )
}