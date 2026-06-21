import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Award, Download, FileCheck } from 'lucide-react'
import { certificatesService } from '../../service/Certificatesservice'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import DataTable from '../../ui/DataTable'
import Pagination from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'
import CertificateTemplate from './CertificateTemplate'
import { useCertificateExport } from '../../hooks/useCertificateExport'

const LIMIT = 10

export default function Certificates() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { certRef, generatePDF, isGenerating } = useCertificateExport()

  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const page = Number(params.get('page') || 1)

  // المتطوع الذي يتم توليد شهادته حالياً (يُستخدم لتعبئة القالب المخفي)
  const [activeCert, setActiveCert] = useState(null)
  const [issuingId, setIssuingId] = useState(null)

  const STATUS_TABS = [
    { key: '', label: 'الكل' },
    { key: 'eligible', label: 'مستحق لشهادة' },
    { key: 'issued', label: 'تم الإصدار' },
  ]

  const { data, isLoading } = useQuery({
    queryKey: ['certificates', search, status, page],
    queryFn: () => certificatesService.getList({ search, status, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const issueMut = useMutation({
    mutationFn: (certificateId) => certificatesService.issueCertificate(certificateId),
    onSuccess: () => qc.invalidateQueries(['certificates']),
  })

  // الخطوة الكاملة: تعبئة القالب -> انتظار الرندر -> توليد PDF -> تحديث الحالة
  const handleIssue = async (row) => {
    setIssuingId(row.id)
    setActiveCert(row)

    // ننتظر فريم واحد عشان يترندر القالب بالبيانات الجديدة قبل التصوير
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

    await generatePDF(`شهادة-${row.volunteerName}.pdf`)

    if (row.status === 'eligible') {
      issueMut.mutate(row.id)
    }

    setIssuingId(null)
  }

  const setParam = (key, value) =>
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      if (value) n.set(key, value)
      else n.delete(key)
      n.set('page', '1')
      return n
    })

  const columns = useMemo(
    () => [
      {
        title: 'المتطوع',
        key: 'volunteerName',
        align: 'center',
        render: (_, row) => (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Avatar name={row.volunteerName} size="sm" />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{row.volunteerName}</div>
              <div style={{ fontSize: 12, color: 'gray' }}>{row.phone}</div>
            </div>
          </div>
        ),
      },
      {
        title: 'عدد الساعات',
        key: 'totalHours',
        align: 'center',
        render: (_, row) => (
          <span style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>
            {row.totalHours} / {row.requiredHours}
          </span>
        ),
      },
      {
        title: 'الحالة',
        key: 'status',
        align: 'center',
        render: (val) => (
          <Badge status={val === 'issued' ? 'approved' : 'pending'}>
            {val === 'issued' ? 'تم الإصدار' : 'مستحق لشهادة'}
          </Badge>
        ),
      },
      {
        title: 'تاريخ الإصدار',
        key: 'issueDate',
        align: 'center',
        render: (val) => val || '—',
      },
      {
        title: 'الإجراء',
        key: 'actions',
        align: 'center',
        render: (_, row) => (
          <PermissionButton
            onClick={() => handleIssue(row)}
            disabled={issuingId === row.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'Cairo, sans-serif',
              background: row.status === 'issued' ? 'var(--bg-muted)' : 'var(--color-secondary-500)',
              color: row.status === 'issued' ? 'var(--text-primary)' : '#111',
              opacity: issuingId === row.id ? 0.6 : 1,
            }}
          >
            {issuingId === row.id ? (
              '...جارٍ التوليد'
            ) : row.status === 'issued' ? (
              <>
                <Download size={15} />
                إعادة تحميل
              </>
            ) : (
              <>
                <Award size={15} />
                إصدار شهادة
              </>
            )}
          </PermissionButton>
        ),
      },
    ],
    [issuingId]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <PageHeader title="شهادات التطوع" subtitle={`${data?.total ?? 0} متطوع`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '12px',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          <FileCheck size={15} />
          إصدار وتحميل شهادات التطوع
        </div>
      </PageHeader>

      {/* Filter Card */}
      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {STATUS_TABS.map((tab) => (
              <PermissionButton
                key={tab.key}
                onClick={() => setParam('status', tab.key)}
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
                  background: status === tab.key ? 'var(--color-primary-50)' : 'transparent',
                  color: status === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                  fontWeight: status === tab.key ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: '0.2s',
                  fontFamily: 'Cairo,sans-serif',
                }}
              >
                {tab.label}
              </PermissionButton>
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
              border: '1px solid var(--border-default)',
              background: 'var(--bg-muted)',
              paddingInline: '14px',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder="البحث عن متطوع..."
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                fontFamily: 'Cairo,sans-serif',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--surface)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            قائمة الشهادات
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            المتطوعون المستحقون لشهادة تطوع والشهادات المُصدرة سابقاً
          </p>
        </div>

        <DataTable
          columns={columns}
          data={data?.data}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={<EmptyState title="لا يوجد متطوعون مستحقون حالياً" />}
        />

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            total={data?.total ?? 0}
            limit={LIMIT}
            onPageChange={(next) =>
              setParams((prev) => {
                const n = new URLSearchParams(prev)
                n.set('page', String(next))
                return n
              })
            }
          />
        </div>
      </Card>

      {/* قالب الشهادة المخفي - يُستخدم فقط للتصوير وتوليد PDF */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
        {activeCert && (
          <CertificateTemplate
            ref={certRef}
            volunteerName={activeCert.volunteerName}
            hours={activeCert.totalHours}
            issueDate={activeCert.issueDate || new Date().toISOString().split('T')[0]}
            certificateId={activeCert.id}
          />
        )}
      </div>
    </div>
  )
}