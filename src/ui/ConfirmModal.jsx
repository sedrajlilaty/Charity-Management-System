// ui/ConfirmModal.jsx
// نسخة معمّمة من DeleteConfirmModal تقدر تُستخدم للحذف والإغلاق وأي عملية تحتاج تأكيد
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import PermissionButton from './PermissionButton'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'تأكيد العملية',
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = true, // true = أحمر (حذف)، false = أصفر (إغلاق/تحذير بسيط)
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={400}
      footer={
        <>
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {cancelLabel}
          </PermissionButton>
          <PermissionButton
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'btn-danger' : 'btn-primary'}
            style={{ minWidth: '100px' }}
          >
            {loading ? '...' : confirmLabel}
          </PermissionButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: danger ? '#fee2e2' : '#fef3c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle size={24} color={danger ? '#ef4444' : '#f59e0b'} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {message}
        </p>
      </div>
    </Modal>
  )
}