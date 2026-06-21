import { useState, lazy, Suspense, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, TableIcon, Award, Check, X, ArrowUpDown, Eye } from 'lucide-react'
import { volunteersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import ExportPDFPermissionButton from '../../ui/Pdfexportbutton'
import { usePDFReport } from '../../hooks/Usepdfexport'
import PermissionButton from '../../ui/PermissionButton'
import { getTotalHours } from '../certificates/mockVolunteers' // عدّلي المسار حسب مكان الملف
import { useAuth } from '../../context/AuthContext'
import VolunteerDetailsModal from './VolunteerDetailsModal'

// Lazy load Kanban
const VolunteersKanban = lazy(() => import('./VolunteersKanban'))

const REQUIRED_HOURS = 50
const LIMIT = 10

export default function Volunteers() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { exportVolunteers, isExporting } = usePDFReport()
  const navigate = useNavigate()

  // ✅ الأدمن فقط يشاهد زر "شهادة"
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const page   = Number(params.get('page') || 1)
  const sortByHours = params.get('sort') === 'hours' // ✅ ترتيب حسب ساعات التطوع

  const [view,       setView]       = useState('table')   // 'table' | 'kanban'
  const [selected,   setSelected]  = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false) // ✅ مودال عرض تفاصيل المتطوع (قراءة فقط)

  const STATUS_TABS = [
    { key: '',           label: t('volunteers.tabs.all') },
    { key: 'pending',    label: t('volunteers.tabs.pending') },
    { key: 'approved',   label: t('volunteers.tabs.approved') },
    { key: 'completed',  label: t('volunteers.tabs.completed') },
    { key: 'rejected',   label: t('volunteers.tabs.rejected') },
  ]

  const { data, isLoading } = useQuery({
    queryKey: ['volunteers', search, status, page, sortByHours],
    queryFn: () => volunteersService.getList({ search, status, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  // ✅ ترتيب محلي حسب إجمالي ساعات التطوع (تنازلياً) عند تفعيل الزر
  const sortedData = useMemo(() => {
    if (!data?.data) return data?.data
    if (!sortByHours) return data.data
    return [...data.data].sort((a, b) => getTotalHours(b) - getTotalHours(a))
  }, [data, sortByHours])

  // ✅ تغيير حالة المتطوع (قبول/رفض/إعادة للحالة السابقة)
  const statusMut = useMutation({
    mutationFn: ({ id, newStatus }) => volunteersService.changeStatus(id, newStatus),
    onSuccess: () => qc.invalidateQueries(['volunteers']),
  })

  const handleApprove = (row) => statusMut.mutate({ id: row.id, newStatus: 'approved' })
  const handleReject  = (row) => statusMut.mutate({ id: row.id, newStatus: 'rejected' })

  // عرض تفاصيل المتطوع (قراءة فقط)
  const handleShowDetails = (row) => {
    setSelected(row)
    setDetailsOpen(true)
  }

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1')
    return n
  })

  const toggleSortByHours = () => setParam('sort', sortByHours ? '' : 'hours')

  const viewBtn = (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#094037' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  })

  // تعريف الأعمدة للجدول مع توسيط العناوين
  const columns = useMemo(() => [
    {
      title: t('volunteers.table.name'),
      key: 'name',
      align: 'center',
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
    // ✅ عمود: إجمالي ساعات التطوع + مؤشر "مستحق لشهادة"
    {
      title: 'ساعات التطوع',
      key: 'totalHours',
      align: 'center',
      render: (_, row) => {
        const total = getTotalHours(row)
        const isEligible = total >= REQUIRED_HOURS

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{total}</span>

            {isEligible && (
              <span
                title="مستحق لشهادة تطوع"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#92400e',
                  background: '#fef3c7',
                  padding: '2px 8px',
                  borderRadius: 99,
                }}
              >
                <Award size={11} />
                مستحق لشهادة
              </span>
            )}
          </div>
        )
      },
    },
    {
      title: t('volunteers.table.status'),
      key: 'status',
      align: 'center',
      render: (val) => <Badge status={val} />
    },
    // ✅ عمود واحد للإجراء:
    //    - لو approved: زر "عرض" فقط (+ زر شهادة للأدمن إذا مستحق)
    //    - غير ذلك (pending/rejected/...): زرّا قبول/رفض
    {
      title: t('volunteers.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, row) => {
        const isApproved = row.status === 'approved'
        const isEligible = getTotalHours(row) >= REQUIRED_HOURS

        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
            {isApproved ? (
              <>
                {/* ✅ زر "شهادة" - فقط للأدمن وعند الاستحقاق */}
                {isEligible && isAdmin && (
                  <button
                    onClick={() => navigate('/certificates')}
                    title="الانتقال لصفحة الشهادات"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 10px', borderRadius: 8, border: 'none',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                      fontFamily: 'Cairo, sans-serif',
                      background: 'var(--color-secondary-500)', color: '#111',
                    }}
                  >
                    <Award size={13} />
                    شهادة
                  </button>
                )}

                {/* عرض تفاصيل المتطوع (قراءة فقط) */}
                <button
                  onClick={() => handleShowDetails(row)}
                  title="عرض التفاصيل"
                  style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--bg-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={16} />
                </button>
              </>
            ) : (
              <>
                <PermissionButton
                  onClick={() => handleApprove(row)}
                  disabled={statusMut.isLoading}
                  title="قبول المتطوع"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    background: '#dcfce7', color: '#16a34a',
                  }}
                >
                  <Check size={13} />
                  قبول
                </PermissionButton>

                <PermissionButton
                  onClick={() => handleReject(row)}
                  disabled={row.status === 'rejected' || statusMut.isLoading}
                  title={row.status === 'rejected' ? 'مرفوض حالياً' : 'رفض المتطوع'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    cursor: row.status === 'rejected' ? 'default' : 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                    background: row.status === 'rejected' ? 'rgba(220,38,38,0.12)' : '#fee2e2',
                    color: '#dc2626',
                    opacity: row.status === 'rejected' ? 0.6 : 1,
                  }}
                >
                  <X size={13} />
                  رفض
                </PermissionButton>
              </>
            )}
          </div>
        )
      }
    }
  ], [t, isAdmin, statusMut.isLoading])


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
          </button >

          <button 
            style={viewBtn(view === 'kanban')}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid size={15} />
          </button >
        </div>

        <ExportPDFPermissionButton 
          onClick={() =>
            exportVolunteers(data?.data ?? [])
          }
          loading={isExporting}
          label={t('common.export')}
        />

        {/* ✅ بديل زر "الإضافة": ترتيب المتطوعين حسب إجمالي ساعات التطوع
            مفيد لمتابعة الأقرب للاستحقاق بسرعة */}
        <PermissionButton
          onClick={toggleSortByHours}
          title="ترتيب حسب ساعات التطوع"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: sortByHours ? '#094037' : 'var(--bg-muted)',
            color: sortByHours ? '#fff' : 'var(--text-secondary)',
            border: sortByHours ? 'none' : '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '10px 18px',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 700,
          }}
        >
          <ArrowUpDown size={15} />
          الأعلى ساعات
        </PermissionButton>
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
                <PermissionButton 
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
                </PermissionButton >
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
            data={sortedData}
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

    {/* ✅ مودال عرض تفاصيل المتطوع - قراءة فقط، بدلاً من VolunteerModal */}
    <VolunteerDetailsModal
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      volunteer={selected}
    />
  </div>
)


}