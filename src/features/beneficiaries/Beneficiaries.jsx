import { useState, lazy, Suspense, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, MoreVertical, MapPin, Map, TableIcon } from 'lucide-react'
import { beneficiariesService } from '../../service/ServiceLayer'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Avatar } from '../../ui/Avatar'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import BeneficiaryModal from './BeneficairiesModal'
import { ActionModal } from '../../ui/ActionModal'
import ExportPDFButton from '../../ui/Pdfexportbutton'
import { usePDFReport } from '../../hooks/Usepdfexport'
import { formatCurrency } from '../../utlis/helper'

// Lazy load Map
const BeneficiaryMap = lazy(() => import('./BeneficiaryMap'))

const LIMIT = 10

const PRI_STYLE = {
  high:   { bg: '#fee2e2', color: '#dc2626' },
  medium: { bg: '#fef9c3', color: '#a16207' },
  low:    { bg: '#f3f4f6', color: '#6b7280' },
}

export default function Beneficiaries() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { exportBeneficiaries, isExporting } = usePDFReport()

  const search   = params.get('search')   || ''
  const status   = params.get('status')   || ''
  const category = params.get('category') || ''
  const campaign = params.get('campaign') || ''
  const page     = Number(params.get('page') || 1)

  const [view,               setView]               = useState('table')  // 'table' | 'map'
  const [modalOpen,          setModalOpen]          = useState(false)
  const [editItem,           setEditItem]           = useState(null)
  const [actionModalOpen,    setActionModalOpen]    = useState(false)
  const [selectedRow,        setSelectedRow]        = useState(null)

  const STATUS_TABS = [
    { key:'',         label:t('beneficiaries.tabs.all')      },
    { key:'active',   label:t('beneficiaries.tabs.active')   },
    { key:'pending',  label:t('beneficiaries.tabs.pending')  },
    { key:'rejected', label:t('beneficiaries.tabs.rejected') },
    { key:'archived', label:t('beneficiaries.tabs.archived') },
  ]

  const CATEGORY_OPTIONS = [
    { value:'',            label:t('beneficiaries.filters.allCategories') },
    { value:'orphan',      label:t('beneficiaries.categories.orphan')      },
    { value:'educational', label:t('beneficiaries.categories.educational') },
    { value:'medical',     label:t('beneficiaries.categories.medical')     },
    { value:'widow',       label:t('beneficiaries.categories.widow')       },
    { value:'poor',        label:t('beneficiaries.categories.poor')        },
  ]

  const CAMPAIGN_OPTIONS = [
    { value:'',       label:t('beneficiaries.filters.allCampaigns') },
    { value:'camp_1', label:t('beneficiaries.campaigns.camp_1') },
    { value:'camp_2', label:t('beneficiaries.campaigns.camp_2') },
    { value:'camp_3', label:t('beneficiaries.campaigns.camp_3') },
    { value:'camp_4', label:t('beneficiaries.campaigns.camp_4') },
    { value:'camp_5', label:t('beneficiaries.campaigns.camp_5') },
    { value:'camp_6', label:t('beneficiaries.campaigns.camp_6') },
  ]

  // تعريف الأعمدة للـ DataTable
  const columns = useMemo(() => [
    {
      title: t('beneficiaries.table.beneficiary'),
      key: 'name',
      textAlign: 'center',
      align:'center',
      render: (_, row) => (
        <div style={{ display:'flex', gap:10, alignItems: 'center' }}>
          <Avatar name={row.name} size={34} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight:600 }}>{row.name}</div>
            <div style={{ fontSize:12, color:'gray' }}>{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      title: t('beneficiaries.table.location'),
      key: 'governorate',
      textAlign: 'center',
      align:'center',
      render: (_, row) => (
        <div style={{ display:'flex', flexDirection: 'column', textAlign: 'right' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'4px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <MapPin size={14} className="text-emerald-600" />
            {t(`beneficiaries.modal.governorates.${row.governorate}`)}
          </div>
          <div style={{ fontSize:'0.875rem', color:'var(--text-muted)', marginRight: '18px' }}>
            {row.region}
          </div>
        </div>
      )
    },
    {
      title: t('beneficiaries.table.category'),
      key: 'category',
      textAlign: 'center',
      align:'center',
      render: (val) => (
        <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)', fontWeight:500 }}>
          {t(`beneficiaries.categories.${val}`, { defaultValue: val })}
        </span>
      )
    },
    {
      title: t('beneficiaries.table.priority'),
      key: 'priority',
      textAlign: 'center',
      align:'center',
      render: (val) => val ? (
        <span style={{ padding:'3px 10px', borderRadius:'99px', fontSize:'0.72rem', fontWeight:700, background:PRI_STYLE[val]?.bg, color:PRI_STYLE[val]?.color }}>
          {t(`beneficiaries.priority.${val}`, { defaultValue: val })}
        </span>
      ) : '—'
    },
    {
      title: t('beneficiaries.table.support'),
      key: 'monthlySupport',
      textAlign: 'center',
      align:'center',
      render: (val) => (
        <span style={{ fontWeight:700, color: val > 0 ? '#094037' : 'var(--text-hint)' }}>
          {val > 0 ? formatCurrency(val) : '—'}
        </span>
      )
    },
    {
      title: t('beneficiaries.table.status'),
      key: 'status',
      render: (val) => <Badge status={val} />
    },
    {
      title: t('beneficiaries.table.actions'),
      key: 'actions',
      align: 'center',
      textAlign: 'center',
      render: (_, row) => (
        <button onClick={() => { setSelectedRow(row); setActionModalOpen(true) }}
          style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', background:'var(--bg-muted)', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
          <MoreVertical size={16} />
        </button>
      )
    }
  ], [t])

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries', status, category, campaign, search, page],
    queryFn:  () => beneficiariesService.getList({ status, category, campaign, search, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const changeStatus = useMutation({ mutationFn: ({ id,s }) => beneficiariesService.changeStatus(id,s), onSuccess: () => qc.invalidateQueries(['beneficiaries']) })
  const createMut    = useMutation({ mutationFn: (p) => beneficiariesService.create({ ...p, status:'pending', registrationDate: new Date().toISOString().split('T')[0] }), onSuccess: () => qc.invalidateQueries(['beneficiaries']) })
  const updateMut    = useMutation({ mutationFn: ({ id, ...r }) => beneficiariesService.update(id,r), onSuccess: () => qc.invalidateQueries(['beneficiaries']) })
  const deleteMut    = useMutation({ mutationFn: (id) => beneficiariesService.archive(id), onSuccess: () => qc.invalidateQueries(['beneficiaries']) })

  const handleSave = (form) => {
    if (editItem) updateMut.mutate({ ...form, id:editItem.id })
    else          createMut.mutate(form)
    setModalOpen(false); setEditItem(null)
  }

  const handleAction = (action, row) => {
    switch (action) {
      case 'approve': changeStatus.mutate({ id:row.id, s:'active'   }); break
      case 'reject':  changeStatus.mutate({ id:row.id, s:'rejected' }); break
      case 'archive': deleteMut.mutate(row.id);                         break
      case 'edit':    setEditItem(row); setModalOpen(true);             break
      case 'delete':  if (window.confirm(t('beneficiaries.deleteConfirm'))) deleteMut.mutate(row.id); break
      default: break
    }
    setActionModalOpen(false)
  }

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page','1'); return n
  })

  const viewBtn = (active) => ({
    display:'flex', alignItems:'center', justifyContent:'center',
    width:'34px', height:'34px', borderRadius:'8px', border:'none', cursor:'pointer',
    background: active ? '#094037' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)', transition:'all 0.15s',
  })

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
      title={t('beneficiaries.title')}
      subtitle={t('beneficiaries.subtitle', {
        count: data?.total ?? 0,
      })}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '4px',
            borderRadius: '12px',
            background: 'var( --bg-base)',
            border:
              '1px solid var(--border-default)',
          }}
        >
          <button
            style={viewBtn(view === 'table')}
            onClick={() => setView('table')}
          >
            <TableIcon size={15} />
          </button>

          <button
            style={viewBtn(view === 'map')}
            onClick={() => setView('map')}
          >
            <Map size={15} />
          </button>
        </div>

        <ExportPDFButton
          onClick={() =>
            exportBeneficiaries(data?.data ?? [])
          }
          loading={isExporting}
          label={t('common.export')}
        />

        <button
          className="btn-primary"
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
          style={{
            background:
              'var(--color-secondary-500)',
color:'#111',
            borderRadius: '14px',
            padding: '10px 18px',
          }}
        >
          <Plus size={15} />
          {t('beneficiaries.addBtn')}
        </button>
      </div>
    </PageHeader>

    {view === 'map' ? (
      <Suspense fallback={<SpinnerPage />}>
        <BeneficiaryMap />
      </Suspense>
    ) : (
      <>
        {/* Filter Card */}
        <Card
          style={{
            padding: '16px',
            borderRadius: '24px',
            background: 'var( --bg-base)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Top Filters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '16px',
              }}
            >
              {/* Status Tabs */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setParam(
                        'status',
                        tab.key
                      )
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      padding: '10px 18px',
                      borderRadius: '14px',
                      border:
                        status === tab.key
                          ? '1px solid var(--color-primary-100)'
                          : '1px solid var(--border-subtle)',
                      background:
                        status === tab.key
                          ? 'var(--color-primary-50)'
                          : 'transparent',
                      color:
                        status === tab.key
                          ? 'var(--color-primary-700)'
                          : 'var(--text-secondary)',
                      fontWeight:
                        status === tab.key
                          ? 700
                          : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: '0.2s',
                      fontFamily:
                        'Cairo,sans-serif',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '260px',
                  height: '46px',
                  borderRadius: '14px',
                  border:
                    '1px solid var(--border-default)',
                  background:
                    'var(--bg-muted)',
                  paddingInline: '14px',
                }}
              >
                <Search
                  size={16}
                  style={{
                    color:
                      'var(--text-muted)',
                    flexShrink: 0,
                  }}
                />

                <input
                  placeholder={t(
                    'beneficiaries.filters.searchPlaceholder'
                  )}
                  value={search}
                  onChange={(e) =>
                    setParam(
                      'search',
                      e.target.value
                    )
                  }
                  style={{
                    background:
                      'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.9rem',
                    color:
                      'var(--text-primary)',
                    fontFamily:
                      'Cairo,sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Select Filters */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {/* Category */}
              <select
                value={category}
                onChange={(e) =>
                  setParam(
                    'category',
                    e.target.value
                  )
                }
                style={{
                  minWidth: '220px',
                  height: '46px',
                  borderRadius: '14px',
                  border:
                    '1px solid var(--border-default)',
                  background:
                    'var(--bg-muted)',
                  color:
                    'var(--text-primary)',
                  paddingInline: '14px',
                  fontSize: '0.88rem',
                  fontFamily:
                    'Cairo,sans-serif',
                  cursor: 'pointer',
                }}
              >
                {CATEGORY_OPTIONS.map(
                  (opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  )
                )}
              </select>

              {/* Campaign */}
              <select
                value={campaign}
                onChange={(e) =>
                  setParam(
                    'campaign',
                    e.target.value
                  )
                }
                style={{
                  minWidth: '240px',
                  height: '46px',
                  borderRadius: '14px',
                  border:
                    '1px solid var(--border-default)',
                  background:
                    'var(--bg-muted)',
                  color:
                    'var(--text-primary)',
                  paddingInline: '14px',
                  fontSize: '0.88rem',
                  fontFamily:
                    'Cairo,sans-serif',
                  cursor: 'pointer',
                }}
              >
                {CAMPAIGN_OPTIONS.map(
                  (opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </Card>

        {/* Table Card */}
        <Card
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            padding: 0,
            background: 'var( --bg-base)',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '22px 24px',
              borderBottom:
                '1px solid var(--border-subtle)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                color:
                  'var(--text-primary)',
              }}
            >
              {t(
                'beneficiaries.tableTitle'
              )}
            </h3>

            <p
              style={{
                marginTop: '6px',
                fontSize: '0.88rem',
                color:
                  'var(--text-muted)',
              }}
            >
              إدارة وعرض بيانات
              المستفيدين
            </p>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={data?.data}
            isLoading={isLoading}
            loadingComponent={
              <SpinnerPage />
            }
            EmptyComponent={
              <EmptyState
                title={t(
                  'beneficiaries.empty.title'
                )}
                description={t(
                  'beneficiaries.empty.description'
                )}
              />
            }
          />

          {/* Pagination */}
          <div
            style={{
              padding: '20px 24px',
              borderTop:
                '1px solid var(--border-subtle)',
            }}
          >
            <Pagination
              page={page}
              total={data?.total ?? 0}
              limit={LIMIT}
              onPageChange={(next) =>
                setParams((prev) => {
                  const n =
                    new URLSearchParams(
                      prev
                    )

                  n.set(
                    'page',
                    String(next)
                  )

                  return n
                })
              }
            />
          </div>
        </Card>
      </>
    )}

    {/* Modals */}
    <BeneficiaryModal
      open={modalOpen}
      onClose={() => {
        setModalOpen(false)
        setEditItem(null)
      }}
      onSave={handleSave}
      editItem={editItem}
    />

    <ActionModal
      isOpen={actionModalOpen}
      onClose={() =>
        setActionModalOpen(false)
      }
      onAction={handleAction}
      row={selectedRow}
    />
  </div>
)
}