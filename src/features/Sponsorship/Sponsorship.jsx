import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { HeartHandshake, Search, XCircle, Users, DollarSign, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'
import { useAuth } from '../../context/AuthContext'
import { useSponsoredOrphans, useCancelSponsorship } from '../../hooks/useSponsorship'

const LIMIT = 10

/* ── اسم المستفيد — نفس منطق اسم المتبرع، بمحاولة أكتر من حقل احتياطي ── */
function getBeneficiaryName(beneficiary) {
  if (!beneficiary) return '—'
  return (
    beneficiary.full_name ||
    beneficiary.name ||
    `${beneficiary.first_name ?? ''} ${beneficiary.last_name ?? ''}`.trim() ||
    '—'
  )
}

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

export default function Sponsorship() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || 1)
  const [search, setSearch] = useState('')

  const { data, isLoading, error, isError } = useSponsoredOrphans()
  const cancelSponsorship = useCancelSponsorship()
console.log({ data, isLoading, error, isError })
const dataObj = data?.data ?? {}
const rows = useMemo(() => {
  return Object.keys(dataObj)
    .filter(key => key !== 'count')
    .map(key => dataObj[key])
}, [dataObj])

  /* ── بحث محلي باسم اليتيم أو الكفيل ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      getBeneficiaryName(r.beneficiary).toLowerCase().includes(q) ||
      r.sponsor_name?.toLowerCase().includes(q)
    )
  }, [rows, search])

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

  /* ── Summary — من نتيجة الفلترة الحالية ── */
  const totalDonated  = filtered.reduce((s, r) => s + (Number(r.donated_amount) || 0), 0)
  const totalRemaining = filtered.reduce((s, r) => s + (Number(r.remaining_amount) || 0), 0)

  const handleCancel = (row) => {
    const name = getBeneficiaryName(row.beneficiary)
    if (window.confirm(t('sponsorship.cancelConfirm', { name }))) {
      cancelSponsorship.mutate(row.orphan.id)
    }
  }

  const columns = useMemo(() => [
    {
      title: t('sponsorship.table.id'),
      key: 'id',
      textAlign: 'center',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>#{val}</span>,
    },
    {
      title: t('sponsorship.table.orphanName'),
      key: 'beneficiary',
      textAlign: 'center',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 700 }}>{getBeneficiaryName(val)}</span>,
    },
    {
  title: t('sponsorship.table.sponsorName'),
  key: 'sponsor_name', // ← رجعناها متل الأصل، بس غيرنا الـ render
  textAlign: 'center',
  align: 'center',
  render: (_, row) => {
    const sponsor = row.orphan?.sponsor
    if (!sponsor) return '—'
    return `${sponsor.first_name ?? ''} ${sponsor.last_name ?? ''}`.trim() || '—'
  },
},
    {
      title: t('sponsorship.table.startDate'),
      key: 'orphan',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {val?.sponsored_at ? formatDate(val.sponsored_at) : '—'}
        </span>
      ),
    },
    {
      title: t('sponsorship.table.progress'),
      key: 'progress_percentage',
      textAlign: 'center',
      align: 'center',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '90px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-700)' }}>
            {val ?? 0}%
          </span>
          <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: 'var(--bg-muted)', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(val ?? 0, 100)}%`, height: '100%',
              background: 'var(--color-primary-500)', borderRadius: '99px',
            }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {formatCurrency(row.remaining_amount)} {t('sponsorship.remaining', { defaultValue: 'متبقي' })}
          </span>
        </div>
      ),
    },
    {
  title: t('sponsorship.table.actions'),
  key: 'actions',
  textAlign: 'center',
  align: 'center',
  render: (_, row) => (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      {user?.role === 'admin' ? (
        <PermissionButton
          onClick={() => handleCancel(row)}
          disabled={cancelSponsorship.isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '10px',
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: '#ef4444', fontWeight: 700, fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
          }}
        >
          <XCircle size={14} />
          {t('sponsorship.cancelButton')}
        </PermissionButton>
      ) : '—'}
    </div>
  ),
},
  ], [t, user?.role, cancelSponsorship.isPending])

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
  }
console.log('Sponsorship mounted')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-base)' }}>

      <PageHeader
        title={t('sponsorship.title')}
subtitle={t('sponsorship.subtitle', { count: data?.count ?? 0 })}      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <SummaryCard
          label={t('sponsorship.summary.count')}
value={(data?.count ?? 0).toLocaleString('ar-SA')}          icon={Users}
          accent="#6ee7b7"
        />
        <SummaryCard
          label={t('sponsorship.summary.donated')}
          value={formatCurrency(totalDonated)}
          icon={DollarSign}
          accent="#eab308"
        />
        <SummaryCard
          label={t('sponsorship.summary.remaining')}
          value={formatCurrency(totalRemaining)}
          icon={TrendingDown}
          accent="#93c5fd"
        />
      </div>

      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', top: '50%',
              right: '12px', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder={t('sponsorship.filter.search')}
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

      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('sponsorship.tableTitle')}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('sponsorship.tableSubtitle')}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={
            <EmptyState
              icon={HeartHandshake}
              title={t('sponsorship.empty.title')}
              description={t('sponsorship.empty.description')}
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
    </div>
  )
}