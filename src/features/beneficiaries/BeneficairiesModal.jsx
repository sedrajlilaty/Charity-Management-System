
import { useState, useEffect } from 'react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const EMPTY = { name:'', phone:'', category:'poor', priority:'medium', membersCount:1, monthlySupport:0, assignedWorker:'', registrationDate:'' }

export default function BeneficiaryModal({ open, onClose, onSave, editItem }) {
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
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave({ ...form, membersCount: Number(form.membersCount), monthlySupport: Number(form.monthlySupport) })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Case' : 'New Case'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth:'80px' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth:'120px' }}>
            {saving && <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>}
            {editItem ? 'Save changes' : 'Create case'}
          </button>
        </>
      }
    >
      <FormRow label="Beneficiary / Family name" required>
        <input className="input" placeholder="Alya Alqahtani Family"
          value={form.name} onChange={e => set('name', e.target.value)}/>
        <FieldError msg={errors.name}/>
      </FormRow>

      <FormRow label="Phone number" required>
        <input className="input" type="tel" placeholder="05XXXXXXXX"
          value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr"/>
        <FieldError msg={errors.phone}/>
      </FormRow>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <FormRow label="Category">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="orphan">Orphan</option>
            <option value="widow">Widow</option>
            <option value="poor">Low-income Family</option>
            <option value="elderly">Elderly</option>
          </select>
        </FormRow>
        <FormRow label="Priority">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </FormRow>
        <FormRow label="Members count">
          <input className="input" type="number" min={1} max={20}
            value={form.membersCount} onChange={e => set('membersCount', e.target.value)} dir="ltr"/>
        </FormRow>
        <FormRow label="Monthly support (SAR)">
          <input className="input" type="number" min={0}
            value={form.monthlySupport} onChange={e => set('monthlySupport', e.target.value)} dir="ltr"/>
        </FormRow>
      </div>

      <FormRow label="Assigned worker">
        <input className="input" placeholder="Field worker name"
          value={form.assignedWorker} onChange={e => set('assignedWorker', e.target.value)}/>
      </FormRow>
    </Modal>
  )
}
