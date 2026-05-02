
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer, width = 520 }) {
  /* منع scroll الصفحة عند فتح الـ modal */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else       document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        /* التغبيش الحقيقي */
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: `${width}px`,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border-default)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-default)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* حقول الفورم — row بـ label يمين و input يسار */
export function FormRow({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '6px',
      }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginRight: '3px' }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{hint}</p>
      )}
    </div>
  )
}

/* رسالة خطأ */
export function FieldError({ msg }) {
  if (!msg) return null
  return <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>{msg}</p>
}

export  function TestModal() {
  return <div>Test</div>
}