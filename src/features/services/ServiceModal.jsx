import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Modal, { FormRow } from '../../ui/Modal'
import PermissionButton from '../../ui/PermissionButton'
export default function ServiceModal({
  open,
  onClose,
  onSave,
  editItem,
  categories,
}) {
  const { t } = useTranslation()

  const EMPTY = {
    name: '',
    category: 'orphan',
    description: '',
    amount: '',
    active: true,
  }

  const [form, setForm] = useState(
    editItem
      ? {
          ...editItem,
          amount: String(editItem.amount),
        }
      : EMPTY
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: v,
    }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError(
        t('services.modal.errors.nameRequired')
      )
      return
    }

    setSaving(true)

    await onSave({
      ...form,
      amount: Number(form.amount) || 0,
    })

    setSaving(false)

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editItem
          ? t('services.modal.titleEdit')
          : t('services.modal.titleAdd')
      }
      footer={
        <>
          <PermissionButton 
            onClick={onClose}
            className="btn-outline"
          >
            {t('services.modal.PermissionButtons.cancel')}
          </PermissionButton >

          <PermissionButton 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ minWidth: '120px' }}
          >
            {saving && (
              <span
                style={{
                  width: '13px',
                  height: '13px',
                  border:
                    '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation:
                    'spin 0.7s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}

            {editItem
              ? t('services.modal.PermissionButtons.save')
              : t('services.modal.PermissionButtons.add')}
          </PermissionButton >
        </>
      }
    >
      <FormRow
        label={t('services.modal.name')}
        required
      >
        <input
          className="input"
          placeholder={t(
            'services.modal.namePlaceholder'
          )}
          value={form.name}
          onChange={(e) => {
            set('name', e.target.value)
            setError('')
          }}
        />

        {error && (
          <p
            style={{
              fontSize: '0.72rem',
              color: '#ef4444',
              marginTop: '4px',
            }}
          >
            {error}
          </p>
        )}
      </FormRow>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <FormRow
          label={t('services.modal.category')}
        >
          <select
            className="input"
            value={form.category}
            onChange={(e) =>
              set('category', e.target.value)
            }
          >
            {categories.map((c) => (
              <option
                key={c.key}
                value={c.key}
              >
                {c.label}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow
          label={t('services.modal.amount')}
        >
          <input
            className="input"
            type="number"
            min={0}
            placeholder="500"
            value={form.amount}
            onChange={(e) =>
              set('amount', e.target.value)
            }
            dir="ltr"
          />
        </FormRow>
      </div>

      <FormRow
        label={t('services.modal.description')}
      >
        <textarea
          className="input"
          rows={3}
          style={{ resize: 'vertical' }}
          placeholder={t(
            'services.modal.descPlaceholder'
          )}
          value={form.description}
          onChange={(e) =>
            set('description', e.target.value)
          }
        />
      </FormRow>

      <FormRow
        label={t('services.modal.status')}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
          }}
        >
          {[
            {
              v: true,
              l: t('services.modal.active'),
            },
            {
              v: false,
              l: t('services.modal.inactive'),
            },
          ].map((opt) => (
            <label
              key={String(opt.v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text-primary)',
              }}
            >
              <input
                type="radio"
                checked={form.active === opt.v}
                onChange={() =>
                  set('active', opt.v)
                }
                style={{
                  accentColor: '#094037',
                }}
              />

              {opt.l}
            </label>
          ))}
        </div>
      </FormRow>
    </Modal>
  )
}