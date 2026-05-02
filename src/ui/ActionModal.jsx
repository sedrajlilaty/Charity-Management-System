// ActionModal.jsx - مودل منفصل للأزرار
import { useState } from 'react'
import { Check, X, Archive, Edit2, Trash2 } from 'lucide-react'

export function ActionModal({ row, isOpen, onClose, onAction }) {
  if (!isOpen) return null

  const actions = [
    { key: 'approve', label: 'Approve', icon: <Check size={16} />, color: '#fff', bg: '#094037', show: row.status === 'pending' },
    { key: 'reject', label: 'Reject', icon: <X size={16} />, color: '#dc2626', bg: '#fee2e2', show: row.status === 'pending' },
    { key: 'archive', label: 'Archive', icon: <Archive size={16} />, color: 'var(--text-secondary)', bg: 'var(--bg-muted)', show: row.status === 'active' },
    { key: 'edit', label: 'Edit', icon: <Edit2 size={16} />, color: '#fff', bg: '#835500', show: true },
    { key: 'delete', label: 'Delete', icon: <Trash2 size={16} />, color: '#dc2626', bg: '#fee2e2', show: true },
  ].filter(action => action.show)

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          minWidth: '250px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Actions for {row.name}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions.map(action => (
            <button
              key={action.key}
              onClick={() => {
                onAction(action.key, row)
                onClose()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: action.bg,
                color: action.color,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--border-default)',
            background: '#fff',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}