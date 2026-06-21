/**
 * ExportPDFPermissionButton  — زر تصدير PDF قابل لإعادة الاستخدام
 *
 * الاستخدام في Donations.jsx:
 *   import ExportPDFPermissionButton  from '../../ui/ExportPDFPermissionButton '
 *   import { usePDFReport } from '../../hooks/usePDFReport'
 *
 *   const { exportDonations, isExporting } = usePDFReport()
 *   <ExportPDFPermissionButton  onClick={() => exportDonations(data?.data)} loading={isExporting} />
 */

import { FileDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PermissionButton from './PermissionButton'
export default function ExportPDFPermissionButton ({ onClick, loading = false, label, style = {} }) {
  const { t } = useTranslation()

  return (
    <PermissionButton
      onClick={onClick}
      disabled={loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '6px',
        padding:        '7px 14px',
        borderRadius:   '10px',
        border:         '1px solid var(--border-default)',
        background:     loading ? 'var(--color-secondary-500)' : 'var(--color-secondary-500)',
        color:          loading ? '#111' : '#094037',
        fontSize:       '0.82rem',
        fontWeight:     600,
        fontFamily:     'Cairo, sans-serif',
        cursor:         loading ? 'not-allowed' : 'pointer',
        transition:     'all 0.15s',
        opacity:        loading ? 0.7 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e6f0ee' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--bg-surface)' }}
      title={label ?? t('common.export')}
    >
      {loading
        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        : <FileDown size={14} />
      }
      {label ?? t('common.export')}
    </PermissionButton >
  )
}