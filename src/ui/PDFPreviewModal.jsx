// src/ui/PDFPreviewModal.jsx
import { X, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PDFPreviewModal({ url, onClose, onDownload }) {
  const { t } = useTranslation()
  if (!url) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px',
          height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            {t('common.pdfPreview', { defaultValue: 'معاينة التقرير' })}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none',
                background: 'var(--color-primary-500)', color: '#fff',
                cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 600, fontSize: '0.85rem',
              }}
            >
              <Download size={14} /> {t('common.download', { defaultValue: 'تنزيل' })}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: '10px', border: 'none',
                background: 'var(--bg-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <iframe src={url} title="pdf-preview" style={{ flex: 1, border: 'none' }} />
      </div>
    </div>
  )
}