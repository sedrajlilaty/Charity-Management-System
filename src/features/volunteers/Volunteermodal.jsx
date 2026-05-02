import { useEffect, useState } from 'react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  campaignId: '',
  skill: '',
  availability: '',
  experience: '',
  notes: '',
}

export default function VolunteerModal({
  open,
  onClose,
  onSave,
  editItem,
  campaigns = [],
}) {
  const [form, setForm] = useState(EMPTY)
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
    if (!form.campaignId) e.campaignId = 'Please select a campaign'
    if (!form.skill) e.skill = 'Please select a skill'
    if (!form.availability) e.availability = 'Please select availability'
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
      title={editItem ? 'Edit Volunteer Request' : 'New Volunteer Request'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth: '120px' }}>
            {saving && (
              <span
                style={{
                  width: '13px',
                  height: '13px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                  marginRight: '8px',
                }}
              />
            )}
            {editItem ? 'Save changes' : 'Create request'}
          </button>
        </>
      }
    >
      <FormRow label="Volunteer name" required>
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
        <FieldError msg={errors.name} />
      </FormRow>

      <FormRow label="Phone number" required>
        <input
          className="input"
          type="tel"
          placeholder="05XXXXXXXX"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          dir="ltr"
        />
        <FieldError msg={errors.phone} />
      </FormRow>

      <FormRow label="Email">
        <input
          className="input"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          dir="ltr"
        />
      </FormRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormRow label="Campaign" required>
          <select
            className="input"
            style={{ fontSize: '0.875rem' }}
            value={form.campaignId}
            onChange={e => set('campaignId', e.target.value)}
          >
            <option value="">Select campaign</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError msg={errors.campaignId} />
        </FormRow>

        <FormRow label="Skill" required>
          <select
            className="input"
            style={{ fontSize: '0.875rem' }}
            value={form.skill}
            onChange={e => set('skill', e.target.value)}
          >
            <option value="">Select skill</option>
            <option value="medical">Medical / Health</option>
            <option value="teaching">Education</option>
            <option value="logistics">Logistics</option>
            <option value="social">Social</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>
          <FieldError msg={errors.skill} />
        </FormRow>

        <FormRow label="Availability" required>
          <select
            className="input"
            style={{ fontSize: '0.875rem' }}
            value={form.availability}
            onChange={e => set('availability', e.target.value)}
          >
            <option value="">Select availability</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="weekend">Weekend</option>
            <option value="flexible">Flexible</option>
          </select>
          <FieldError msg={errors.availability} />
        </FormRow>

        <FormRow label="Experience">
          <select
            className="input"
            style={{ fontSize: '0.875rem' }}
            value={form.experience}
            onChange={e => set('experience', e.target.value)}
          >
            <option value="">Select experience</option>
            <option value="none">No experience</option>
            <option value="1_2">1 - 2 years</option>
            <option value="3_5">3 - 5 years</option>
            <option value="5_plus">5+ years</option>
          </select>
        </FormRow>
      </div>

      <FormRow label="Notes">
        <textarea
          className="input"
          rows="3"
          placeholder="Any additional information..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </FormRow>
    </Modal>
  )
}