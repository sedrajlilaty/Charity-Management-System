// ── DeleteConfirmModal.jsx ────────────────────────────────────────────────────
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import Modal from '../../ui/Modal'

export default function DeleteConfirm({ open, onClose, onConfirm, userName, loading }) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={t('users.deleteModal.title')} width={400}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>{t('users.deleteModal.cancel')}</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger" style={{ minWidth: '100px' }}>
            {loading ? '...' : t('users.deleteModal.confirm')}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '8px 0' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={24} color="#ef4444" />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {t('users.deleteModal.message')}<br />
          <strong style={{ color: 'var(--text-primary)' }}>{userName}</strong>?<br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('users.deleteModal.warning')}</span>
        </p>
      </div>
    </Modal>
  )
}