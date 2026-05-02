import { useEffect, useState } from 'react'
import Modal, { FieldError, FormRow } from '../../ui/Modal'

const EMPTY_FORM = {
  donorName: '',
  amount: '',
  type: 'cash',
  campaignName: '',
  recurring: false,
}

export default function DonationModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(EMPTY_FORM)
    setErrors({})
  }, [open])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    const nextErrors = {}
    if (!form.donorName.trim()) nextErrors.donorName = 'اسم المتبرع مطلوب'
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    await onSave({ ...form, amount: Number(form.amount), status: 'pending' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إضافة تبرع جديد"
      footer={
        <>
          <button onClick={onClose} className="btn-outline">إلغاء</button>
          <button onClick={handleSubmit} className="btn-primary">حفظ التبرع</button>
        </>
      }
    >
      <FormRow label="اسم المتبرع" required>
        <input className="input" value={form.donorName} onChange={(e) => set('donorName', e.target.value)} />
        <FieldError msg={errors.donorName} />
      </FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="المبلغ" required>
          <input className="input" type="number" min={1} value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          <FieldError msg={errors.amount} />
        </FormRow>
        <FormRow label="نوع التبرع">
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="cash">نقدي</option>
            <option value="transfer">تحويل</option>
            <option value="inkind">عيني</option>
          </select>
        </FormRow>
      </div>
      <FormRow label="الحملة">
        <input className="input" value={form.campaignName} onChange={(e) => set('campaignName', e.target.value)} />
      </FormRow>
      <FormRow label="متكرر">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={form.recurring} onChange={(e) => set('recurring', e.target.checked)} />
          نعم، تبرع متكرر
        </label>
      </FormRow>
    </Modal>
  )
}
