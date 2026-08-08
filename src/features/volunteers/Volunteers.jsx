import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Check, X, Eye } from 'lucide-react'
import { volunteersService, getSkillLabel, SKILLS_LABELS_AR } from '../../hooks/volunteersService'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import DataTable from '../../ui/DataTable'
import PermissionButton from '../../ui/PermissionButton'
import VolunteerDetailsModal from './VolunteerDetailsModal'

const LIMIT = 7

export default function Volunteers() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  const status = params.get('status') || 'pending'
  const search = params.get('search') || ''

  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const STATUS_TABS = [
    { key: 'pending',   label: t('volunteers.tabs.pending') },
    { key: 'approved',  label: t('volunteers.tabs.approved') },
    { key: 'rejected',  label: t('volunteers.tabs.rejected') },
    { key: 'suspended', label: t('volunteers.tabs.suspended') },
  ]

  // ✅ طلبات التطوع العامة حسب الحالة
  const { data, isLoading, isError, error } = useQuery({
  queryKey: ['volunteer-applications', status],
  queryFn: () => volunteersService.getApplicationsByStatus(status),
})

console.log('isLoading:', isLoading, 'isError:', isError, 'error:', error, 'data:', data)

  const rows = useMemo(() => {
    const list = data?.data ?? []
    console.log('RAW API RESPONSE:', data)
    if (!search) return list
    const q = search.trim().toLowerCase()
    return list.filter(
      (v) => v.name?.toLowerCase().includes(q) || v.phone?.includes(q) || v.email?.toLowerCase().includes(q)
    )
  }, [data, search])

  const reviewMut = useMutation({
    mutationFn: ({ id, newStatus }) => volunteersService.reviewApplication(id, newStatus),
    onSuccess: () => qc.invalidateQueries(['volunteer-applications']),
  })

  const handleApprove = (row) => reviewMut.mutate({ id: row.volunteer_id, newStatus: 'approved' })
  const handleReject  = (row) => reviewMut.mutate({ id: row.volunteer_id, newStatus: 'rejected' })

  const handleShowDetails = (row) => {
    setSelected(row)
    setDetailsOpen(true)
  }

  const setParam = (key, value) =>
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      if (value) n.set(key, value)
      else n.delete(key)
      return n
    })

  const columns = useMemo(
    () => [
      {
        title: t('volunteers.table.name'),
        key: 'name',
        align: 'center',
        render: (_, row) => (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'gray' }}>{row.phone}</div>
          </div>
        ),
      },
      {
        title: t('volunteers.table.governorate') || 'المحافظة',
        key: 'governorate',
        align: 'center',
      },
      {
        title: t('volunteers.table.skills') || 'المهارات',
        key: 'skills',
        align: 'center',
        render: (_, row) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {(row.skills || []).slice(0, 2).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-700)',
                  background: 'var(--color-primary-50)',
                  padding: '2px 8px',
                  borderRadius: 99,
                }}
              >
                {getSkillLabel(s)}
              </span>
            ))}
            {(row.skills || []).length > 2 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                +{row.skills.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        title: t('volunteers.table.status'),
        key: 'status',
        align: 'center',
        render: (val) => <Badge status={val} />,
      },
      {
        title: t('volunteers.table.actions'),
        key: 'actions',
        align: 'center',
        render: (_, row) => (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => handleShowDetails(row)}
              title="عرض التفاصيل"
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'var(--bg-muted)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Eye size={16} />
            </button>

            {row.status !== 'approved' && (
              <PermissionButton
                onClick={() => handleApprove(row)}
                disabled={reviewMut.isLoading}
                  permission="volunteers.approve" 
                title="قبول الطلب"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                  background: '#dcfce7', color: '#16a34a',
                }}
              >
                <Check size={13} /> قبول
              </PermissionButton>
            )}

            {row.status !== 'rejected' && (
              <PermissionButton
                onClick={() => handleReject(row)}
                disabled={reviewMut.isLoading}
                permission="volunteers.reject" 
                title="رفض الطلب"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                  background: '#fee2e2', color: '#dc2626',
                }}
              >
                <X size={13} /> رفض
              </PermissionButton>
            )}
          </div>
        ),
      },
    ],
    [t, reviewMut.isLoading]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title={t('volunteers.title')}
        subtitle={`${data?.count ?? 0} طلب تطوع`}
      />

      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {STATUS_TABS.map((tab) => (
              <PermissionButton
                key={tab.key}
                onClick={() => setParam('status', tab.key)}
                style={{
                  padding: '10px 18px', borderRadius: '14px',
                  border: status === tab.key ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
                  background: status === tab.key ? 'var(--color-primary-50)' : 'transparent',
                  color: status === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                  fontWeight: status === tab.key ? 700 : 500,
                  fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                }}
              >
                {tab.label}
              </PermissionButton>
            ))}
          </div>

          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', minWidth: '260px', height: '46px',
              borderRadius: '14px', border: '1px solid var(--border-default)',
              background: 'var(--bg-muted)', paddingInline: '14px',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder={t('volunteers.searchPlaceholder')}
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: 'Cairo,sans-serif' }}
            />
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--surface)' }}>
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={<EmptyState title={t('volunteers.empty')} />}
        />
      </Card>

      <VolunteerDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} volunteer={selected} />
    </div>
  )
}