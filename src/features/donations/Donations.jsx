import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Heart, Search, DollarSign, Hash, TrendingUp, Award, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import ExportPDFPermissionButton from '../../ui/Pdfexportbutton'
import { usePDFReport } from '../../hooks/Usepdfexport'
import PermissionButton from '../../ui/PermissionButton'
import { useDonations } from '../../hooks/useDonations'
import { useMonthlyDonationsReport } from '../../hooks/useMonthlyReports'
import PDFPreviewModal from '../../ui/PDFPreviewModal'
import MonthYearPickerModal from '../../ui/MonthYearPickerModal'
import toast from 'react-hot-toast'

const LIMIT = 10

/* ── Target-type tabs — الكل / حملة / طلب ── */
const TYPE_TABS = ['all', 'campaign', 'request']

/* ───────── Summary Card ───────── */
function SummaryCard({ label, value, icon: Icon, accent }) {
  return (
    <div
      style={{
        background: 'var(--color-primary-500)',
        borderRadius: '16px',
        padding: '1.1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 2px 12px rgba(9,64,55,0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,64,55,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(9,64,55,0.2)'
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={accent ?? '#eab308'} />
      </div>
      <div>
        <p style={{
          margin: '0 0 6px', fontSize: '0.68rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  )
}

export default function Donations() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const page    = Number(searchParams.get('page') || 1)
  const typeTab = searchParams.get('type') || 'all'

  const [search, setSearch] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const {
    exportDonations, isExporting,
    exportMonthlyDonationsReport,
    previewUrl, closePreview, confirmDownload,
  } = usePDFReport()

  const { mutateAsync: fetchMonthlyDonations, isPending: isFetchingReport } = useMonthlyDonationsReport()

  /* ── Fetch — الباك بيرجع كل التبرعات دفعة وحدة، مفلترة حسب target_type ── */
  const { data, isLoading } = useDonations({ donationableType: typeTab })

  /* ── فلترة محلية إضافية: البحث باسم المتبرع ── */
  const filtered = useMemo(() => {
    if (!data?.donations) return []
    if (!search.trim()) return data.donations
    return data.donations.filter(d =>
      d.donor_name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [data?.donations, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT))

  useEffect(() => {
    if (page > totalPages) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('page', String(totalPages))
        return next
      })
    }
  }, [filtered.length, page, totalPages])

  const paginated = useMemo(() => {
    const start = (page - 1) * LIMIT
    return filtered.slice(start, start + LIMIT)
  }, [filtered, page])

  /* ── Summary cards ── */
  const totalAmount = filtered.reduce((s, d) => s + (Number(d.amount_usd) || 0), 0)
  const count       = filtered.length
  const avg         = count > 0 ? Math.round(totalAmount / count) : 0
  const maxAmount   = count > 0 ? Math.max(...filtered.map(d => Number(d.amount_usd) || 0)) : 0

  const setTypeParam = (value) => {
    setSearch('')
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value && value !== 'all') next.set('type', value)
      else next.delete('type')
      next.set('page', '1')
      return next
    })
  }

  /* ── تقرير شهري ── */
  const handleGenerateMonthlyReport = async ({ year, month }) => {
    try {
      const reportData = await fetchMonthlyDonations({ year, month })
      await exportMonthlyDonationsReport(reportData)
      setReportModalOpen(false)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('reports.error', { defaultValue: 'فشل جلب التقرير' }))
    }
  }

  const columns = useMemo(() => [
    {
      title: t('donations.table.id'),
      key: 'id',
      textAlign: 'center',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>#{val}</span>,
    },
    {
      title: t('donations.table.donor'),
      key: 'donor_name',
      textAlign: 'center',
      align: 'center',
      render: (val, row) => (
        <span style={{
          fontWeight: 700,
          color: row.donor_anonymous ? 'var(--text-muted)' : 'var(--text-primary)',
          fontStyle: row.donor_anonymous ? 'italic' : 'normal',
        }}>
          {row.donor_anonymous ? t('donations.anonymous', { defaultValue: 'مجهول' }) : val}
        </span>
      ),
    },
    {
      title: t('donations.table.amount'),
      key: 'amount_usd',
      textAlign: 'center',
      align: 'center',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: 'var(--color-primary-700)' }}>
            {formatCurrency(val)}
          </span>
          {row.original_currency && row.original_currency !== 'USD' && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ({row.original_amount} {row.original_currency})
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('donations.table.type'),
      key: 'target_type',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{
          fontSize: '0.82rem', padding: '5px 10px', borderRadius: '99px',
          background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontWeight: 600,
        }}>
          {val === 'campaign'
            ? t('donations.types.campaign', { defaultValue: 'حملة' })
            : t('donations.types.request', { defaultValue: 'طلب' })}
        </span>
      ),
    },
    {
      title: t('donations.table.campaign'),
      key: 'target_name',
      textAlign: 'center',
      align: 'center',
      render: (val) => val || '—',
    },
    {
      title: t('donations.table.date'),
      key: 'donated_at',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {formatDate(val)}
        </span>
      ),
    },
  ], [t])

  const inputStyle = {
    padding: '9px 36px 9px 14px',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: 'Cairo,sans-serif',
    outline: 'none',
    width: '260px',
    transition: 'border-color 0.2s',
  }

 console.log(data?.donations?.filter(d => d.target_type === 'request'))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-base)' }}>

      {/* ── Header ── */}
      <PageHeader
        title={t('donations.title')}
        subtitle={t('donations.subtitle', { count: data?.donationsCount ?? 0 })}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <PermissionButton
            onClick={() => setReportModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--color-primary-700)',
              fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
            }}
          >
            <FileText size={15} />
            {t('reports.monthlyReport', { defaultValue: 'تقرير شهري' })}
          </PermissionButton>

          <ExportPDFPermissionButton
            onClick={() => exportDonations(paginated)}
            loading={isExporting}
            label={t('common.export')}
          />
        </div>
      </PageHeader>

      {/* ── Summary Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <SummaryCard
          label={t('donations.summary.total')}
          value={formatCurrency(totalAmount)}
          icon={DollarSign}
          accent="#eab308"
        />
        <SummaryCard
          label={t('donations.summary.count')}
          value={count.toLocaleString('ar-SA')}
          icon={Hash}
          accent="#6ee7b7"
        />
        <SummaryCard
          label={t('donations.summary.avg')}
          value={formatCurrency(avg)}
          icon={TrendingUp}
          accent="#93c5fd"
        />
        <SummaryCard
          label={t('donations.summary.max')}
          value={formatCurrency(maxAmount)}
          icon={Award}
          accent="#f9a8d4"
        />
      </div>

      {/* ── Filter Row: tabs (left) + search (right) ── */}
      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--bg-base)' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '12px',
        }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TYPE_TABS.map((tab) => {
              const active = typeTab === tab
              return (
                <PermissionButton
                  key={tab}
                  onClick={() => setTypeParam(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '9px 18px', borderRadius: '14px',
                    border: active
                      ? '1px solid var(--color-primary-100)'
                      : '1px solid var(--border-subtle)',
                    background: active ? 'var(--color-primary-50)' : 'transparent',
                    color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.88rem', cursor: 'pointer',
                    transition: '0.2s', fontFamily: 'Cairo,sans-serif',
                  }}
                >
                  {tab === 'all'
                    ? t('common.all')
                    : t(`donations.types.${tab}`)}
                </PermissionButton>
              )
            })}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', top: '50%',
              right: '12px', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder={t('donations.filter.search')}
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev)
                  next.set('page', '1')
                  return next
                })
              }}
              style={inputStyle}
            />
          </div>

        </div>
      </Card>

      {/* ── Table Card ── */}
      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>

        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('donations.tableTitle')}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('donations.tableSubtitle')}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={
            <EmptyState
              icon={Heart}
              title={t('donations.empty.title')}
              description={t('donations.empty.description')}
            />
          }
        />

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            total={filtered.length}
            limit={LIMIT}
            onPageChange={(next) => {
              setSearchParams(prev => {
                const p = new URLSearchParams(prev)
                p.set('page', String(next))
                return p
              })
            }}
          />
        </div>
      </Card>

      <PDFPreviewModal url={previewUrl} onClose={closePreview} onDownload={confirmDownload} />

      <MonthYearPickerModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onConfirm={handleGenerateMonthlyReport}
        isLoading={isFetchingReport || isExporting}
        title={t('reports.donationsTitle', { defaultValue: 'تقرير التبرعات الشهري' })}
      />
    </div>
  )
}