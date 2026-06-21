import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    /* Overlay */
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5vh 1rem',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* Modal container — flex column بارتفاع محدود */}
      <div
        style={{
          width: '100%',
          maxWidth: `${width}px`,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',      /* header | body(scroll) | footer */
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          overflow: 'hidden',           /* يمنع أي طفح خارج الـ border-radius */
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* ── HEADER (ثابت) ── */}
        <div style={{
          flexShrink: 0,                /* لا يتقلص أبداً */
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: 'var(--bg-muted)', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border-default)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── BODY (يسكرول) ── */}
        <div style={{
          flex: 1,                      /* يأخذ كل المساحة المتبقية */
          minHeight: 0,                 /* 🔑 ضروري جداً لكي يعمل overflow */
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
        }}>
          {children}
        </div>

        {/* ── FOOTER (ثابت) ── */}
        {footer && (
          <div style={{
            flexShrink: 0,              /* لا يتقلص أبداً */
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: 10, padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── FormRow ── */
export function FormRow({ label, required, children, hint, compact = false }) {
  return (
    <div style={{ marginBottom: compact ? '0.5rem' : '1rem' }}>
      <label style={{
        display: 'block', fontSize: '0.78rem', fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: '5px',
      }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginRight: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

/* ── FieldError ── */
export function FieldError({ msg }) {
  if (!msg) return null
  return <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{msg}</p>
}

export function TestModal() { return <div>Test</div> }