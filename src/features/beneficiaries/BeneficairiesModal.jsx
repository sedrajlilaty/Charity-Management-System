import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const SYRIAN_GOVERNORATES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة'
];

const EMPTY = {
  name: '',
  phone: '',
  category: 'orphan',
  subCategory: '',
  priority: 'medium',
  membersCount: 1,
  monthlySupport: 0,
  assignedWorker: '',
  governorate: '', // الحقل الجديد
  region: '',      // الحقل الجديد
  address: '',
  academicYear: '',
  supportType: '',
  medicalCondition: '',
  requiredAmount: 0,
  needDescription: '',
}

export default function BeneficiaryModal({ open, onClose, onSave, editItem }) {
  const { t } = useTranslation()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editItem ? { ...editItem } : EMPTY)
    setErrors({})
  }, [editItem, open])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('beneficiaries.modal.errors.nameRequired')
    if (!form.phone?.trim()) e.phone = t('beneficiaries.modal.errors.phoneRequired')
    if (!form.governorate) e.governorate = t('beneficiaries.modal.errors.required') // تأكد من وجود مفتاح required في الترجمة
    if (!form.region?.trim()) e.region = t('beneficiaries.modal.errors.required')
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({ 
        ...form, 
        membersCount: Number(form.membersCount), 
        monthlySupport: Number(form.monthlySupport) 
      })
      onClose()
    } catch (error) {
      console.error("Save failed", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? t('beneficiaries.modal.titleEdit') : t('beneficiaries.modal.titleAdd')}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: 80 }}>
            {t('beneficiaries.modal.buttons.cancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: 140 }}>
            {editItem ? t('beneficiaries.modal.buttons.update') : t('beneficiaries.modal.buttons.submit')}
          </button>
        </>
      }
    >
      {/* الفئة والأولوية */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('beneficiaries.modal.fields.category')} required>
          <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="orphan">{t('beneficiaries.modal.categories.orphan')}</option>
            <option value="educational">{t('beneficiaries.modal.categories.educational')}</option>
            <option value="medical">{t('beneficiaries.modal.categories.medical')}</option>
          </select>
        </FormRow>
        <FormRow label={t('beneficiaries.modal.fields.priority')}>
          <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="high">{t('beneficiaries.modal.priority.high')}</option>
            <option value="medium">{t('beneficiaries.modal.priority.medium')}</option>
            <option value="low">{t('beneficiaries.modal.priority.low')}</option>
          </select>
        </FormRow>
      </div>

      {/* الاسم الكامل */}
      <FormRow label={t('beneficiaries.modal.fields.fullName')} required>
        <input 
          className="input" 
          placeholder={t('beneficiaries.modal.fields.fullNamePlaceholder')} 
          value={form.name} 
          onChange={(e) => set('name', e.target.value)} 
        />
        <FieldError msg={errors.name} />
      </FormRow>

      {/* رقم الهاتف والمحافظة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('beneficiaries.modal.fields.phone')} required>
          <input 
            className="input" 
            type="tel" 
            placeholder={t('beneficiaries.modal.fields.phonePlaceholder')} 
            value={form.phone} 
            onChange={(e) => set('phone', e.target.value)} 
            dir="ltr" 
          />
          <FieldError msg={errors.phone} />
        </FormRow>
        <FormRow label={t('beneficiaries.modal.fields.governorate')} required>
          <select className="input" value={form.governorate} onChange={(e) => set('governorate', e.target.value)}>
            <option value="">{t('beneficiaries.modal.fields.selectGov')}</option>
            {SYRIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
          </select>
          <FieldError msg={errors.governorate} />
        </FormRow>
      </div>

      {/* المنطقة والعنوان التفصيلي */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('beneficiaries.modal.fields.region')} required>
          <input 
            className="input" 
            placeholder={t('beneficiaries.modal.fields.regionPlaceholder')} 
            value={form.region} 
            onChange={(e) => set('region', e.target.value)} 
          />
          <FieldError msg={errors.region} />
        </FormRow>
        <FormRow label={t('beneficiaries.modal.fields.detailedAddress')}>
          <input 
            className="input" 
            placeholder={t('beneficiaries.modal.fields.addressPlaceholder')} 
            value={form.address} 
            onChange={(e) => set('address', e.target.value)} 
          />
        </FormRow>
      </div>

      {/* تفاصيل تعليمية */}
      {form.category === 'educational' && (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#094037' }}>
            {t('beneficiaries.modal.educational.sectionTitle')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormRow label={t('beneficiaries.modal.educational.academicYear')}>
              <input className="input" placeholder={t('beneficiaries.modal.educational.academicPlaceholder')} value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} />
            </FormRow>
            <FormRow label={t('beneficiaries.modal.educational.supportType')}>
              <select className="input" value={form.supportType} onChange={(e) => set('supportType', e.target.value)}>
                <option value="laptop">{t('beneficiaries.modal.educational.supportOptions.laptop')}</option>
                <option value="tuition">{t('beneficiaries.modal.educational.supportOptions.tuition')}</option>
                <option value="stationary">{t('beneficiaries.modal.educational.supportOptions.stationary')}</option>
              </select>
            </FormRow>
          </div>
        </div>
      )}

      {/* تفاصيل طبية */}
      {form.category === 'medical' && (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#094037' }}>
            {t('beneficiaries.modal.medical.sectionTitle')}
          </p>
          <FormRow label={t('beneficiaries.modal.medical.condition')}>
            <textarea className="input" style={{ height: '60px' }} placeholder={t('beneficiaries.modal.medical.conditionPlaceholder')} value={form.medicalCondition} onChange={(e) => set('medicalCondition', e.target.value)} />
          </FormRow>
          <FormRow label={t('beneficiaries.modal.medical.requiredAmount')}>
            <input className="input" type="number" value={form.requiredAmount} onChange={(e) => set('requiredAmount', e.target.value)} />
          </FormRow>
        </div>
      )}

      {/* وصف الاحتياج */}
      <FormRow label={t('beneficiaries.modal.fields.needDescription')}>
        <textarea className="input" style={{ height: '60px' }} placeholder={t('beneficiaries.modal.fields.needPlaceholder')} value={form.needDescription} onChange={(e) => set('needDescription', e.target.value)} />
      </FormRow>

      {/* أفراد الأسرة والدعم المالي */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label={t('beneficiaries.modal.fields.membersCount')}>
          <input className="input" type="number" value={form.membersCount} onChange={(e) => set('membersCount', e.target.value)} />
        </FormRow>
        <FormRow label={t('beneficiaries.modal.fields.monthlySupport')}>
          <input className="input" type="number" value={form.monthlySupport} onChange={(e) => set('monthlySupport', e.target.value)} />
        </FormRow>
      </div>
    </Modal>
  )
}