import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FileText } from 'lucide-react'

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function MonthYearPickerModal({ open, onClose, onConfirm, isLoading, title }) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language?.startsWith('ar')
  const now = new Date()

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  if (!open) return null

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)
  const months = isAr ? MONTHS_AR : MONTHS_EN

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: '20px',
        padding: '24px', width: '360px', maxWidth: '90vw',
        border: '1px solid var(--border-default)',
        fontFamily: 'Cairo, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: 'var(--bg-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              {t('reports.month', { defaultValue: 'الشهر' })}
            </label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif', fontSize: '0.88rem',
              }}
            >
              {months.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              {t('reports.year', { defaultValue: 'السنة' })}
            </label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1px solid var(--border-subtle)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif', fontSize: '0.88rem',
              }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button
            onClick={() => onConfirm({ year, month })}
            disabled={isLoading}
            style={{
              marginTop: '6px', padding: '11px', borderRadius: '12px',
              border: 'none', background: 'var(--color-primary-500)', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <FileText size={16} />
            {isLoading
              ? t('reports.generating', { defaultValue: 'جاري التجهيز...' })
              : t('reports.generate', { defaultValue: 'عرض التقرير' })}
          </button>
        </div>
      </div>
    </div>
  )
}