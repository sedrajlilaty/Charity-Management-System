
import { useState, lazy, Suspense, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Search, MoreVertical, LayoutGrid, TableIcon } from 'lucide-react'
import { volunteersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import DataTable from '../../ui/DataTable' 
import Pagination from '../../ui/Pagination'
import VolunteerModal from './Volunteermodal'
import { ActionModal } from '../../ui/ActionModal'
import ExportPDFButton from '../../ui/Pdfexportbutton'
import { usePDFReport } from '../../hooks/Usepdfexport'

// Lazy load Kanban
const VolunteersKanban = lazy(() => import('./VolunteersKanban'))

const LIMIT = 10

export default function Volunteers() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { exportVolunteers, isExporting } = usePDFReport()

  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const page   = Number(params.get('page') || 1)

  const [view,       setView]       = useState('table')   // 'table' | 'kanban'
  const [modalOpen, setModalOpen] = useState(false)
  const [selected,   setSelected]  = useState(null)
  const [actionOpen, setActionOpen] = useState(false)

  const STATUS_TABS = [
    { key: '',           label: t('volunteers.tabs.all') },
    { key: 'pending',    label: t('volunteers.tabs.pending') },
    { key: 'approved',   label: t('volunteers.tabs.approved') },
    { key: 'completed',  label: t('volunteers.tabs.completed') },
    { key: 'rejected',   label: t('volunteers.tabs.rejected') },
  ]

  // تعريف الأعمدة للجدول مع توسيط العناوين
  const columns = useMemo(() => [
    {
      title: t('volunteers.table.name'),
      key: 'name',
      align: 'center', // توسيط العنوان والبيانات
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Avatar name={row.name} size="sm" />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'gray' }}>{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      title: t('volunteers.table.campaign'),
      key: 'campaignName',
      align: 'center'
    },
    {
      title: t('volunteers.table.status'),
      key: 'status',
      align: 'center',
      render: (val) => <Badge status={val} />
    },
    {
      title: t('volunteers.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, row) => (
        <button 
          onClick={() => { setSelected(row); setActionOpen(true) }}
          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--bg-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <MoreVertical size={16} />
        </button>
      )
    }
  ], [t])

  const { data, isLoading } = useQuery({
    queryKey: ['volunteers', search, status, page],
    queryFn: () => volunteersService.getList({ search, status, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const actionMut = useMutation({
    mutationFn: ({ id, action }) => volunteersService.changeStatus(id, action),
    onSuccess: () => qc.invalidateQueries(['volunteers']),
  })

  const handleAction = (action, row) => {
    if (action === 'edit') { setSelected(row); setModalOpen(true) }
    else actionMut.mutate({ id: row.id, action })
    setActionOpen(false)
  }

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1')
    return n
  })

  const viewBtn = (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#094037' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  })

 
return (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}
  >
    {/* Header */}
    <PageHeader
      title={t('volunteers.title')}
      subtitle={t('volunteers.subtitle', {
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
            background: 'var(--bg-muted)',
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
            style={viewBtn(view === 'kanban')}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        <ExportPDFButton
          onClick={() =>
            exportVolunteers(data?.data ?? [])
          }
          loading={isExporting}
          label={t('common.export')}
        />

        <button
          className="btn-primary"
          onClick={() => {
            setSelected(null)
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
          <UserPlus size={15} />
          {t('volunteers.addBtn')}
        </button>
      </div>
    </PageHeader>

    {view === 'kanban' ? (
      <Suspense fallback={<SpinnerPage />}>
        <VolunteersKanban />
      </Suspense>
    ) : (
      <>
        {/* Top Filter Card مثل صفحة الإعدادات */}
        <Card
          style={{
            padding: '16px',
            borderRadius: '24px',
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {/* Tabs */}
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
                    setParam('status', tab.key)
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                background: 'var(--bg-muted)',
                paddingInline: '14px',
              }}
            >
              <Search
                size={16}
                style={{
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              />

              <input
                placeholder={t(
                  'volunteers.searchPlaceholder'
                )}
                value={search}
                onChange={(e) =>
                  setParam(
                    'search',
                    e.target.value
                  )
                }
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  fontFamily:
                    'Cairo,sans-serif',
                }}
              />
            </div>
          </div>
        </Card>

        {/* Table Card */}
        <Card
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            padding: 0,
            background: 'var(--surface)',
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
                color: 'var(--text-primary)',
              }}
            >
              {t('volunteers.tableTitle')}
            </h3>

            <p
              style={{
                marginTop: '6px',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
              }}
            >
              عرض وإدارة بيانات المتطوعين
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
                title={t('volunteers.empty')}
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
                    new URLSearchParams(prev)

                  n.set('page', String(next))

                  return n
                })
              }
            />
          </div>
        </Card>
      </>
    )}

    <VolunteerModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      editItem={selected}
    />

    <ActionModal
      isOpen={actionOpen}
      onClose={() => setActionOpen(false)}
      onAction={handleAction}
      row={selected}
    />
  </div>
)


}

