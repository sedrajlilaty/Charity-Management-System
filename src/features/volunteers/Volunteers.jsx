import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Eye, Users, Megaphone, Clock, ShieldCheck } from 'lucide-react'
import { volunteersService, parseSkills, getSkillLabel } from '../../hooks/volunteersService'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import DataTable from '../../ui/DataTable'
import VolunteerDetailsModal from './VolunteerDetailsModal'
import CertificateVerifyModal from './CertificateVerifyModal'

export default function Volunteers() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const status = params.get('status') || 'all'
  const search = params.get('search') || ''
  const type   = params.get('type') || 'general' // تبويب افتراضي: تطوع عام

  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [certifyOpen, setCertifyOpen] = useState(false)

  const STATUS_TABS = [
    { key: 'all',       label: t('volunteers.tabs.all', { defaultValue: 'الكل' }) },
    { key: 'pending',   label: t('volunteers.tabs.pending', { defaultValue: 'قيد الانتظار' }) },
    { key: 'approved',  label: t('volunteers.tabs.approved', { defaultValue: 'مقبول' }) },
    { key: 'rejected',  label: t('volunteers.tabs.rejected', { defaultValue: 'مرفوض' }) },
    { key: 'suspended', label: t('volunteers.tabs.suspended', { defaultValue: 'معلق' }) },
  ]

  const TYPE_TABS = [
    { key: 'general',  label: t('volunteers.type.general', { defaultValue: 'تطوع عام' }),   icon: Users },
    { key: 'campaign', label: t('volunteers.type.campaign', { defaultValue: 'تطوع لحملات' }), icon: Megaphone },
  ]

  const isGeneralType = type === 'general'

  const { data, isLoading } = useQuery({
    queryKey: ['volunteer-applications', type, status],
    queryFn: () =>
      isGeneralType
        ? volunteersService.getGeneralApplicationsByStatus(status)
        : volunteersService.getCampaignVolunteersSummary(),
  })

  const rows = useMemo(() => {
    let list = data?.data ?? []

    if (isGeneralType) {
      // احتياط: لو الـ endpoint (مثلاً filter بدون باراميترات) رجّع صفوف مش عامة بالغلط
      list = list.filter((r) => r.general_application === true)
    } else {
      // قسم الحملات: بس المتطوعين اللي إلهم حملة وحدة عالأقل
      list = list.filter((r) => (r.campaigns_count ?? 0) > 0)
      if (status !== 'all') {
        list = list.filter((r) => r.status === status)
      }
    }

    if (search) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) ||
          v.phone?.toLowerCase?.().includes(q) ||
          v.email?.toLowerCase().includes(q) ||
          v.governorate?.toLowerCase().includes(q)
      )
    }
    return list
  }, [data, search, status, isGeneralType])

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
        title: t('volunteers.table.name', { defaultValue: 'اسم المتطوع' }),
        key: 'name',
        align: 'center',
        render: (_, row) => (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'gray' }}>{row.phone || '-'}</div>
          </div>
        ),
      },
      {
        title: t('volunteers.table.governorate', { defaultValue: 'المحافظة' }),
        key: 'governorate',
        align: 'center',
        render: (val) => val || '-',
      },
      {
        title: t('volunteers.table.skills', { defaultValue: 'المهارات' }),
        key: 'skills',
        align: 'center',
        render: (_, row) => {
          const skillsArray = parseSkills(row.skills)
          if (!skillsArray.length) return <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>-</span>
          return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {skillsArray.slice(0, 2).map((skill) => (
                <span key={skill} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', padding: '3px 8px', borderRadius: 99 }}>
                  {getSkillLabel(skill)}
                </span>
              ))}
              {skillsArray.length > 2 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{skillsArray.length - 2}</span>
              )}
            </div>
          )
        },
      },
      // عمود "الحالة" — بس لقسم العام
      ...(isGeneralType
        ? [
            {
              title: t('volunteers.table.status', { defaultValue: 'الحالة' }),
              key: 'status',
              align: 'center',
              render: (_, row) => <Badge status={row.status} />,
            },
          ]
        : []),
      // عمود "الحملات / الساعات" — بس لقسم الحملات
      ...(!isGeneralType
        ? [
            {
              title: t('volunteers.table.stats', { defaultValue: 'الحملات / الساعات' }),
              key: 'stats',
              align: 'center',
              render: (_, row) => (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#F2C055', color: '#FAF8D8' }}>
                    <Megaphone size={11} /> {row.campaigns_count ?? 0} {t('volunteers.table.campaignsShort', { defaultValue: 'حملة' })}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: ' var(--color-primary-500)', color: '#FBFDFC' }}>
                    <Clock size={11} /> {row.total_hours ?? 0} {t('volunteers.table.hoursShort', { defaultValue: 'ساعة' })}
                  </span>
                </div>
              ),
            },
          ]
        : []),
      {
        title: t('volunteers.table.actions', { defaultValue: 'الإجراءات' }),
        key: 'actions',
        align: 'center',
        render: (_, row) => (
          <button
            onClick={() => handleShowDetails(row)}
            title={t('volunteers.table.viewDetails', { defaultValue: 'عرض التفاصيل' })}
            style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--bg-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-500)' }}
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [t, isGeneralType]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <PageHeader title={t('volunteers.title', { defaultValue: 'إدارة المتطوعين' })} subtitle={`${rows.length} ${t('volunteers.subtitle', { defaultValue: 'متطوع' })}`} />

        <button
          onClick={() => setCertifyOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--color-primary-300)',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-700)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
          }}
        >
          <ShieldCheck size={16} />
          {t('volunteers.certificate.button', { defaultValue: 'التحقق من شهادة' })}
        </button>
      </div>

      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {TYPE_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setParam('type', tab.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '9px 16px', borderRadius: '12px',
                  border: type === tab.key ? '1px solid var(--color-primary-300)' : '1px solid var(--border-subtle)',
                  background: type === tab.key ? 'var(--color-primary-500)' : 'transparent',
                  color: type === tab.key ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                }}>
                {tab.icon && <tab.icon size={13} />} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {STATUS_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setParam('status', tab.key)}
                style={{
                  padding: '10px 18px', borderRadius: '14px',
                  border: status === tab.key ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
                  background: status === tab.key ? 'var(--color-primary-50)' : 'transparent',
                  color: status === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                  fontWeight: status === tab.key ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '260px', height: '46px', borderRadius: '14px', border: '1px solid var(--border-default)', background: 'var(--bg-muted)', paddingInline: '14px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder={t('volunteers.searchPlaceholder', { defaultValue: 'بحث بالاسم، رقم الهاتف، أو المحافظة...' })}
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
          EmptyComponent={<EmptyState title={t('volunteers.empty', { defaultValue: 'لا يوجد متطوعين' })} />}
        />
      </Card>

      <VolunteerDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} volunteer={selected} />
      <CertificateVerifyModal open={certifyOpen} onClose={() => setCertifyOpen(false)} />
    </div>
  )
}