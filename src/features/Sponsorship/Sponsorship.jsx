import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { HeartHandshake, Search, XCircle } from 'lucide-react'
import { formatDate } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'
import { useSponsorships, useCancelSponsorship } from '../../hooks/useSponsorship'

const LIMIT = 10

/* ── تابس الحالة — الكل / مكفول / بحاجة متابعة ── */
const STATUS_TABS = ['all', 'sponsored', 'needs_follow_up']

function StatusBadge({ status, t }) {
  const map = {
    sponsored:      { bg: 'var(--bg-muted)',            color: 'var(--color-primary-700)' },
    needs_follow_up:{ bg: 'rgba(239,68,68,0.1)',        color: '#ef4444' },
    unsponsored:    { bg: 'rgba(148,163,184,0.15)',     color: 'var(--text-muted)' },
  }
  const style = map[status] ?? map.unsponsored

  return (
    <span style={{
      fontSize: '0.8rem', padding: '5px 10px', borderRadius: '99px',
      background: style.bg, color: style.color, fontWeight: 700,
    }}>
      {t(`sponsorship.status.${status}`)}
    </span>
  )
}

export default function Sponsorship() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const page       = Number(searchParams.get('page') || 1)
  const statusTab  = searchParams.get('status') || 'all'
  const [search, setSearch] = useState('')

  /* ⚠️ لسا مربوطة بالباك — لما يجهز الـ endpoint منمرر status كـ param إذا الفلترة صارت من السيرفر،
     حالياً عم نجيب الكل ونفلتر محلي متل صفحة التبرعات */
  const { data, isLoading } = useSponsorships()
  const cancelSponsorship = useCancelSponsorship()

  const orphans = data?.orphans ?? []

  /* ── فلترة الحالة + البحث محلياً ── */
  const filtered = useMemo(() => {
    let list = orphans
    if (statusTab !== 'all') {
      list = list.filter(o => o.status === statusTab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.orphan_name?.toLowerCase().includes(q) ||
        o.sponsor_name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orphans, statusTab, search])

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

  const setStatusParam = (value) => {
    setSearch('')
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value && value !== 'all') next.set('status', value)
      else next.delete('status')
      next.set('page', '1')
      return next
    })
  }

  const handleCancel = (row) => {
    if (window.confirm(t('sponsorship.cancelConfirm', { name: row.orphan_name }))) {
      cancelSponsorship.mutate(row.sponsorship_id)
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
      key: 'orphan_name',
      textAlign: 'center',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 700 }}>{val}</span>,
    },
    {
      title: t('sponsorship.table.sponsorName'),
      key: 'sponsor_name',
      textAlign: 'center',
      align: 'center',
      render: (val) => val || (
        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {t('sponsorship.status.unsponsored')}
        </span>
      ),
    },
    {
      title: t('sponsorship.table.startDate'),
      key: 'sponsorship_start_date',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {val ? formatDate(val) : '—'}
        </span>
      ),
    },
    {
      title: t('sponsorship.table.status'),
      key: 'status',
      textAlign: 'center',
      align: 'center',
      render: (val) => <StatusBadge status={val} t={t} />,
    },
    {
      title: t('sponsorship.table.actions'),
      key: 'actions',
      textAlign: 'center',
      align: 'center',
      render: (_, row) => (
        row.sponsor_name ? (
          <PermissionButton
          permission="sponsorship.cancel"
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
        ) : '—'
      ),
    },
  ], [t, cancelSponsorship.isPending])

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-base)' }}>

      <PageHeader
        title={t('sponsorship.title')}
        subtitle={t('sponsorship.subtitle', { count: orphans.length ?? 0 })}
      />

      {/* ── Filter Row: تابس (يسار) + بحث (يمين) ── */}
      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--bg-base)' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STATUS_TABS.map((tab) => {
              const active = statusTab === tab
              return (
                <PermissionButton
                  key={tab}
                  onClick={() => setStatusParam(tab)}
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
                  {tab === 'all' ? t('common.all') : t(`sponsorship.tabs.${tab}`)}
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

      {/* ── Table Card ── */}
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