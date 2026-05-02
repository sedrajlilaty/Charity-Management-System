
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const EMPTY = { name:'', email:'', phone:'', role:'fieldWorker', status:'active' }

export default function UserModal({ open, onClose, onSave, editUser }) {
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editUser ? { ...editUser } : EMPTY)
    setErrors({})
  }, [editUser, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editUser ? 'Edit User' : 'New User'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth:'90px' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth:'120px' }}>
            {saving && <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>}
            {editUser ? 'Save changes' : 'Create user'}
          </button>
        </>
      }
    >
      {/* Avatar preview */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'#e6f0ee', color:'#0D5247', fontSize:'1.1rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #c0d9d4' }}>
          {form.name ? form.name.slice(0,2) : <User size={22} color="#0D5247"/>}
        </div>
      </div>

      <FormRow label="Full name" required>
        <div style={{ position:'relative' }}>
          <User size={14} style={{ position:'absolute', top:'50%', right:'12px', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="input" style={{ paddingRight:'36px' }} placeholder="John Smith"
            value={form.name} onChange={e => set('name', e.target.value)}/>
        </div>
        <FieldError msg={errors.name}/>
      </FormRow>

      <FormRow label="Email address" required>
        <div style={{ position:'relative' }}>
          <Mail size={14} style={{ position:'absolute', top:'50%', right:'12px', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="input" style={{ paddingRight:'36px' }} type="email" placeholder="user@charity.org"
            value={form.email} onChange={e => set('email', e.target.value)} dir="ltr"/>
        </div>
        <FieldError msg={errors.email}/>
      </FormRow>

      <FormRow label="Phone number" required>
        <div style={{ position:'relative' }}>
          <Phone size={14} style={{ position:'absolute', top:'50%', right:'12px', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="input" style={{ paddingRight:'36px' }} type="tel" placeholder="05XXXXXXXX"
            value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr"/>
        </div>
        <FieldError msg={errors.phone}/>
      </FormRow>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <FormRow label="Role">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="fieldWorker">Field Worker</option>
          </select>
        </FormRow>
        <FormRow label="Status">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormRow>
      </div>
    </Modal>
  )
}
