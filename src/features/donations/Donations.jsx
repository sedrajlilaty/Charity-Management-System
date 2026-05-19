import { useState, useMemo } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Check, X, Heart, Plus } from 'lucide-react'
import { donationsService } from '../../service/ServiceLayer'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import DonationModal from './DonationModal'
import ExportPDFButton from '../../ui/Pdfexportbutton'
import { usePDFReport } from '../../hooks/Usepdfexport'

const LIMIT = 10

export default function Donations() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const status = searchParams.get('status') || ''
  const page = Number(searchParams.get('page') || 1)

  const [openModal, setOpenModal] = useState(false)

  const { exportDonations, isExporting } = usePDFReport()

  const TABS = [
    { key: '', label: t('donations.tabs.all') },
    { key: 'pending', label: t('donations.tabs.pending') },
    { key: 'approved', label: t('donations.tabs.approved') },
    { key: 'rejected', label: t('donations.tabs.rejected') },
  ]

  // تعريف الأعمدة للـ DataTable
  const columns = useMemo(() => [
    {
      title: t('donations.table.id'),
      key: 'id',
      textAlign: 'center',
      align: 'center',
      render: (val) => <span style={{ fontWeight: 600 }}>#{val}</span>
    },
    {
      title: t('donations.table.donor'),
      key: 'donorName',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {val}
        </span>
      )
    },
    {
      title: t('donations.table.amount'),
      key: 'amount',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 800, color: 'var(--color-primary-700)' }}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      title: t('donations.table.type'),
      key: 'type',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{
          fontSize: '0.82rem',
          padding: '5px 10px',
          borderRadius: '99px',
          background: 'var(--bg-muted)',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          {t(`donations.types.${val}`, { defaultValue: val })}
        </span>
      )
    },
    {
      title: t('donations.table.campaign'),
      key: 'campaignName',
      textAlign: 'center',
      align: 'center',
      render: (val) => val || '—'
    },
    {
      title: t('donations.table.recurring'),
      key: 'recurring',
      textAlign: 'center',
      align: 'center',
      render: (val) => val ? t('donations.table.yes') : t('donations.table.no')
    },
    {
      title: t('donations.table.date'),
      key: 'date',
      textAlign: 'center',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {formatDate(val)}
        </span>
      )
    },
    {
      title: t('donations.table.status'),
      key: 'status',
      textAlign: 'center',
      align: 'center',
      render: (val) => <Badge status={val} />
    },
    {
      title: t('donations.table.actions'),
      key: 'actions',
      align: 'center',
      textAlign: 'center',
      render: (_, row) => (
        row.status === 'pending' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => reject.mutate(row.id)}
              disabled={reject.isPending}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: 'none',
                cursor: 'pointer',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'Cairo,sans-serif'
              }}
            >
              {t('donations.actions.reject')}
              <X size={13} />
            </button>
            <button
              onClick={() => approve.mutate(row.id)}
              disabled={approve.isPending}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'var(--color-primary-500)',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'Cairo,sans-serif'
              }}
            >
              {t('donations.actions.approve')}
              <Check size={13} />
            </button>
          </div>
        )
      )
    }
  ], [t])

  const { data, isLoading } = useQuery({
    queryKey: ['donations', status, page],
    queryFn: () => donationsService.getList({
      status,
      page,
      limit: LIMIT,
    }),
    keepPreviousData: true,
  })

  const approve = useMutation({
    mutationFn: donationsService.approve,
    onSuccess: () => qc.invalidateQueries(['donations'])
  })

  const reject = useMutation({
    mutationFn: donationsService.reject,
    onSuccess: () => qc.invalidateQueries(['donations'])
  })

  const createMut = useMutation({
    mutationFn: donationsService.create,
    onSuccess: () => {
      qc.invalidateQueries(['donations'])
      setOpenModal(false)
    }
  })

  const setStatusParam = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('status', value)
      else next.delete('status')
      next.set('page', '1')
      return next
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background: 'var(--bg-base)',
      }}
    >
      {/* Header */}
      <PageHeader
        title={t('donations.title')}
        subtitle={t('donations.subtitle', {
          count: data?.total ?? 0,
        })}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ExportPDFButton
            onClick={() => exportDonations(data?.data)}
            loading={isExporting}
            label={t('common.export')}
          />

          <button
            className="btn-primary"
            onClick={() => setOpenModal(true)}
            style={{
              background: 'var(--color-secondary-500)',
              color: '#111',
              borderRadius: '14px',
              padding: '10px 18px',
            }}
          >
            <Plus size={15} />
            {t('donations.addBtn')}
          </button>
        </div>
      </PageHeader>

      {/* Filter Card */}
      <Card
        style={{
          padding: '16px',
          borderRadius: '24px',
          background: 'var(--bg-base)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusParam(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: '14px',
                border: status === tab.key
                  ? '1px solid var(--color-primary-100)'
                  : '1px solid var(--border-subtle)',
                background: status === tab.key
                  ? 'var(--color-primary-50)'
                  : 'transparent',
                color: status === tab.key
                  ? 'var(--color-primary-700)'
                  : 'var(--text-secondary)',
                fontWeight: status === tab.key ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: '0.2s',
                fontFamily: 'Cairo,sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 0,
          background: 'var(--bg-base)',
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {t('donations.tableTitle')}
          </h3>

          <p
            style={{
              marginTop: '6px',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
            }}
          >
            متابعة وإدارة التبرعات الخاصة بالجمعية
          </p>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data?.data}
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

        {/* Pagination */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <Pagination
            page={page}
            total={data?.total ?? 0}
            limit={LIMIT}
            onPageChange={(next) => {
              setSearchParams((prev) => {
                const p = new URLSearchParams(prev)
                p.set('page', String(next))
                return p
              })
            }}
          />
        </div>
      </Card>

      {/* Modal */}
      <DonationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(payload) => createMut.mutate(payload)}
      />
    </div>
  )
}