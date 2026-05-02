
import { AlertTriangle } from 'lucide-react'
import Modal from '../../ui/Modal'

export default function DeleteConfirm({ open, onClose, onConfirm, userName, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm deletion"
      width={400}
      footer={
        <>
          <button onClick={onClose} className="btn-outline" style={{ minWidth:'80px' }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger" style={{ minWidth:'100px' }}>
            {loading ? '...' : 'Yes, delete'}
          </button>
        </>
      }
    >
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', textAlign:'center', padding:'8px 0' }}>
        <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AlertTriangle size={24} color="#ef4444"/>
        </div>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.7 }}>
          Are you sure you want to delete user<br/>
          <strong style={{ color:'var(--text-primary)' }}>{userName}</strong>?<br/>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>This action cannot be undone.</span>
        </p>
      </div>
    </Modal>
  )
}
