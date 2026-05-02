
import { useState, useEffect } from 'react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const EMPTY = { name:'', description:'', targetAmount:'', startDate:'', endDate:'', status:'active' }

export default function CampaignModal({ open, onClose, onSave, editItem }) {
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
    if (!form.name.trim()) e.name = 'Campaign name is required'
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = 'Target amount is required'
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Campaign' : 'New Campaign'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth:'80px' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth:'120px' }}>
            {saving && <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>}
            {editItem ? 'Save changes' : 'Create campaign'}
          </button>
        </>
      }
    >
      <FormRow label="Campaign name" required>
        <input className="input" placeholder="Example: Winter Clothing 2026"
          value={form.name} onChange={e => set('name', e.target.value)}/>
        <FieldError msg={errors.name}/>
      </FormRow>

      <FormRow label="Description">
        <textarea className="input" rows={3} style={{ resize:'vertical' }} placeholder="Short campaign description..."
          value={form.description} onChange={e => set('description', e.target.value)}/>
      </FormRow>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <FormRow label="Target amount (SAR)" required>
          <input className="input" type="number" min={0} placeholder="50000"
            value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} dir="ltr"/>
          <FieldError msg={errors.targetAmount}/>
        </FormRow>
        <FormRow label="Status">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </FormRow>
        <FormRow label="Start date">
          <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} dir="ltr"/>
        </FormRow>
        <FormRow label="End date">
          <input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} dir="ltr"/>
        </FormRow>
      </div>
    </Modal>
  )
}
