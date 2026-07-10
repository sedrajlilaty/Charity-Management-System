// src/features/beneficiaries/Beneficiaries.jsx
import { useState, useMemo, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Search, Plus, MoreVertical, MapPin, Map, TableIcon, Eye, Heart, User, BookOpen, GraduationCap } from 'lucide-react'
import { PageHeader }          from '../../ui/PageHeader'
import { Card }                from '../../ui/Card'
import { Badge }               from '../../ui/Badge'
import { Avatar }              from '../../ui/Avatar'
import DataTable               from '../../ui/DataTable'
import Pagination              from '../../ui/Pagination'
import { SpinnerPage }         from '../../ui/Spinner'
import { EmptyState }          from '../../ui/EmptyState'
import BeneficiaryModal        from './BeneficairiesModal'
import BeneficiaryCaseView     from './BeneficiaryCaseView'
import { ActionModal }         from '../../ui/ActionModal'
import ExportPDFPermissionButton from '../../ui/Pdfexportbutton'
import { usePDFReport }        from '../../hooks/Usepdfexport'
import { formatCurrency }      from '../../utlis/helper'
import {
  usePendingRequests,
  useOpenAcceptedPatients,
  useOpenAcceptedOrphans,
  useOpenAcceptedSchools,
  useOpenAcceptedUniversities,
  useAcceptRequest,
  useCloseRequest,
  useStorePatient,
  useStoreOrphan,
  useStoreSchool,
  useStoreUniversity,
} from '../../hooks/useRequests'

const BeneficiaryMap = lazy(() => import('./BeneficiaryMap'))

const LIMIT = 10

// ── Category config ───────────────────────────────────────
export const CAT_CFG = {
  patient:            { icon: Heart,         color: '#094037', bg: 'var(--color-primary-50)',  labelKey: 'beneficiaries.categories.patient'            },
  orphan:             { icon: User,          color: '#094037', bg: 'var(--color-primary-100)', labelKey: 'beneficiaries.categories.orphan'             },
  school_student:     { icon: BookOpen,      color: '#92400e', bg: '#fef3c7',                  labelKey: 'beneficiaries.categories.school_student'     },
  university_student: { icon: GraduationCap, color: '#92400e', bg: '#fef3c7',                  labelKey: 'beneficiaries.categories.university_student' },
}

function CatBadge({ category }) {
  const { t } = useTranslation()
  const cfg = CAT_CFG[category]
  if (!cfg) return null
  const Icon = cfg.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {t(cfg.labelKey)}
    </span>
  )
}

export default function Beneficiaries() {
  const { t }  = useTranslation()
  const [params, setParams] = useSearchParams()
  const { exportBeneficiaries, isExporting } = usePDFReport()

  const search   = params.get('search')   || ''
  const status   = params.get('status')   || ''
  const category = params.get('category') || ''
  const page     = Number(params.get('page') || 1)

  const [view,            setView]            = useState('table')
  const [modalOpen,       setModalOpen]       = useState(false)
  const [editItem,        setEditItem]        = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedRow,     setSelectedRow]     = useState(null)
  const [caseViewOpen,    setCaseViewOpen]    = useState(false)
  const [viewItem,        setViewItem]        = useState(null)
  const [viewInitStep,    setViewInitStep]    = useState('view')

  // ── جلب البيانات ─────────────────────────────────────────
  const { data: pendingData     = [], isLoading: pl  } = usePendingRequests()
  const { data: accPatients     = [], isLoading: al1 } = useOpenAcceptedPatients()
  const { data: accOrphans      = [], isLoading: al2 } = useOpenAcceptedOrphans()
  const { data: accSchools      = [], isLoading: al3 } = useOpenAcceptedSchools()
  const { data: accUniversities = [], isLoading: al4 } = useOpenAcceptedUniversities()

  const isLoading = pl || al1 || al2 || al3 || al4

  // دمج البيانات مع إزالة المكررات
  const allData = useMemo(() => {
    const merged = [
      ...pendingData,
      ...accPatients,
      ...accOrphans,
      ...accSchools,
      ...accUniversities,
    ]
    return merged.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    )
  }, [pendingData, accPatients, accOrphans, accSchools, accUniversities])

  // ── فلترة من الفرونت ──────────────────────────────────────
  const filtered = useMemo(() => {
    let result = allData
    if (status)   result = result.filter(r => r.status   === status)
    if (category) result = result.filter(r => r.category === category)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.full_name?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q)     ||
        r.governorate?.toLowerCase().includes(q)
      )
    }
    return result
  }, [allData, status, category, search])

  const total    = filtered.length
  const pageData = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  // ── Mutations ─────────────────────────────────────────────
  const acceptMut  = useAcceptRequest()
  const closeMut   = useCloseRequest()
  const patientMut = useStorePatient()
  const orphanMut  = useStoreOrphan()
  const schoolMut  = useStoreSchool()
  const uniMut     = useStoreUniversity()

  // ── إنشاء طلب جديد ───────────────────────────────────────
  const handleSave = async (form) => {
    try {
      const cat = form.category
      const base = {
        full_name:        form.full_name,
        national_id:      form.national_id,
        governorate_id:   form.governorate_id,
        region_id:        form.region_id,
        description:      form.description,
        required_amount:  form.required_amount,
        title:            form.title,
        personal_picture: form.personal_picture instanceof File ? form.personal_picture : undefined,
      }

      if (cat === 'patient') {
        await patientMut.mutateAsync({
          ...base,
          is_self:              'false',
          phone:                form.phone  || undefined,
          email:                form.email  || undefined,
          medical_report:       form.medical_report,
          national_id_document: form.national_id_document,
        })
      } else if (cat === 'orphan') {
        await orphanMut.mutateAsync({
          ...base,
          phone:                    form.phone,
          family_booklet:           form.family_booklet,
          father_death_certificate: form.father_death_certificate,
        })
      } else if (cat === 'school_student') {
        await schoolMut.mutateAsync({
          ...base,
          academic_grade:    form.academic_grade,
          school_name:       form.school_name,
          family_book_photo: form.family_book_photo,
        })
      } else if (cat === 'university_student') {
        await uniMut.mutateAsync({
          ...base,
          academic_year:       form.academic_year,
          support_type:        form.support_type,
          university_id_photo: form.university_id_photo,
        })
      }

      toast.success(t('beneficiaries.toast.createSuccess', { defaultValue: 'تمت إضافة الطلب بنجاح ✅' }))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('beneficiaries.toast.createError', { defaultValue: 'فشل إضافة الطلب' }))
      throw err
    }
  }

  // ── قبول الطلب ───────────────────────────────────────────
  const handleApproveAndPublish = async (enrichedData) => {
    try {
      await acceptMut.mutateAsync({
        id:              enrichedData.id,
        title:           enrichedData.caseTitle       ?? enrichedData.title,
        description:     enrichedData.caseDescription ?? enrichedData.description,
        required_amount: enrichedData.required_amount,
      })
      toast.success(t('beneficiaries.toast.acceptSuccess', { defaultValue: 'تم قبول الطلب ونشره ✅' }))
    } catch (err) {
      const msg = err?.response?.data?.message
        ?? Object.values(err?.response?.data?.errors ?? {})[0]?.[0]
        ?? t('beneficiaries.toast.acceptError', { defaultValue: 'فشل قبول الطلب' })
      toast.error(msg)
    }
  }

  // ── إغلاق الطلب ──────────────────────────────────────────
  const handleClose = (row) => {
    closeMut.mutate(row.id, {
      onSuccess: () => toast.success(t('beneficiaries.toast.closeSuccess', { defaultValue: 'تم إغلاق الطلب' })),
      onError:   (err) => toast.error(err?.response?.data?.message ?? t('beneficiaries.toast.error', { defaultValue: 'حدث خطأ' })),
    })
  }

  // ── Action Modal ──────────────────────────────────────────
  const handleAction = (action, row) => {
    switch (action) {
      case 'view':    setViewItem(row); setViewInitStep('view');    setCaseViewOpen(true); break
      case 'approve': setViewItem(row); setViewInitStep('publish'); setCaseViewOpen(true); break
      case 'archive':
      case 'delete':  handleClose(row); break
      default: break
    }
    setActionModalOpen(false)
  }

  // ── Status Tabs ───────────────────────────────────────────
  const STATUS_TABS = [
    { key: '',         label: t('beneficiaries.tabs.all')      },
    { key: 'accepted', label: t('beneficiaries.tabs.active')   },
    { key: 'pending',  label: t('beneficiaries.tabs.pending')  },
    { key: 'rejected', label: t('beneficiaries.tabs.rejected') },
  ]

  // ── الأعمدة ───────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      title: t('beneficiaries.table.beneficiary'),
      key: 'full_name',
      align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row.personal_picture
            ? <img src={row.personal_picture} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            : <Avatar name={row.full_name} size="sm" />
          }
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{row.full_name}</div>
            {row.title
              ? <div style={{ fontSize: '0.72rem', color: '#094037', fontWeight: 600 }}>📢 {row.title}</div>
              : <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.phone}</div>
            }
          </div>
        </div>
      ),
    },
    {
      title: t('beneficiaries.table.category'),
      key: 'category',
      align: 'center',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <CatBadge category={val} />
          {val === 'school_student'     && row.academic_grade && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{row.academic_grade}</span>}
          {val === 'university_student' && row.academic_year  && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{row.academic_year}</span>}
        </div>
      ),
    },
    {
      title: t('beneficiaries.table.location'),
      key: 'governorate',
      render: (_, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            <MapPin size={12} /> {row.governorate ?? '—'}
          </div>
          {row.region && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 16 }}>{row.region}</div>}
        </div>
      ),
    },
    {
      title: t('beneficiaries.table.amount'),
      key: 'required_amount',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 0 ? '#094037' : 'var(--text-hint)', fontSize: '0.85rem' }}>
          {val > 0 ? formatCurrency(val) : '—'}
        </span>
      ),
    },
    {
      title: t('beneficiaries.table.status'),
      key: 'status',
      render: (val) => <Badge status={val} />,
    },
    {
      title: t('beneficiaries.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <button
            onClick={() => { setViewItem(row); setViewInitStep('view'); setCaseViewOpen(true) }}
            title={t('common.view')}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(9,64,55,0.08)', color: '#094037', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => { setSelectedRow(row); setActionModalOpen(true) }}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--bg-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      ),
    },
  ], [t])

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1'); return n
  })

  const viewBtn = (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#094037' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-base)' }}>

      <PageHeader title={t('beneficiaries.title')} subtitle={t('beneficiaries.subtitle', { count: total })}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-default)' }}>
            <button style={viewBtn(view === 'table')} onClick={() => setView('table')}><TableIcon size={15} /></button>
            <button style={viewBtn(view === 'map')}   onClick={() => setView('map')}><Map size={15} /></button>
          </div>
          <ExportPDFPermissionButton onClick={() => exportBeneficiaries(pageData)} loading={isExporting} label={t('common.export')} />
          <button
            className="btn-primary"
            onClick={() => { setEditItem(null); setModalOpen(true) }}
            style={{ background: 'var(--color-secondary-500)', color: '#111', borderRadius: '14px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.88rem' }}
          >
            <Plus size={15} /> {t('beneficiaries.addBtn')}
          </button>
        </div>
      </PageHeader>

      {view === 'map' ? (
        <Suspense fallback={<SpinnerPage />}><BeneficiaryMap /></Suspense>
      ) : (
        <>
          <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--bg-base)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {STATUS_TABS.map(tab => (
                    <button key={tab.key} onClick={() => setParam('status', tab.key)} style={{
                      padding: '8px 16px', borderRadius: '12px', cursor: 'pointer',
                      border:     status === tab.key ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
                      background: status === tab.key ? 'var(--color-primary-50)' : 'transparent',
                      color:      status === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                      fontWeight: status === tab.key ? 700 : 500,
                      fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif', transition: '0.2s',
                    }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px', height: '44px', borderRadius: '12px', border: '1px solid var(--border-default)', background: 'var(--bg-muted)', paddingInline: '12px' }}>
                  <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    placeholder={t('beneficiaries.search')}
                    value={search}
                    onChange={e => setParam('search', e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem', color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif' }}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>{t('beneficiaries.categories.label')}:</span>
                <button onClick={() => setParam('category', '')} style={{
                  padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', border: '1.5px solid',
                  borderColor: !category ? '#094037' : 'var(--border-subtle)',
                  background:  !category ? 'rgba(9,64,55,0.08)' : 'transparent',
                  color:       !category ? '#094037' : 'var(--text-secondary)',
                  fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Cairo, sans-serif',
                }}>
                  {t('beneficiaries.categories.all')}
                </button>
                {Object.entries(CAT_CFG).map(([key, cfg]) => {
                  const active = category === key
                  const Icon = cfg.icon
                  return (
                    <button key={key} onClick={() => setParam('category', key)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: '10px', cursor: 'pointer',
                      border: `1.5px solid ${active ? cfg.color : 'var(--border-subtle)'}`,
                      background: active ? cfg.bg : 'transparent',
                      color:      active ? cfg.color : 'var(--text-secondary)',
                      fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Cairo, sans-serif', transition: '0.15s',
                    }}>
                      <Icon size={12} /> {t(cfg.labelKey)}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('beneficiaries.table.title')}</h3>
              <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('beneficiaries.table.subtitle')}</p>
            </div>
            <DataTable
              columns={columns}
              data={pageData}
              isLoading={isLoading}
              loadingComponent={<SpinnerPage />}
              EmptyComponent={<EmptyState title={t('beneficiaries.empty.title')} description={t('beneficiaries.empty.description')} />}
            />
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
              <Pagination
                page={page} total={total} limit={LIMIT}
                onPageChange={next => setParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(next)); return n })}
              />
            </div>
          </Card>
        </>
      )}

      <BeneficiaryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={handleSave}
        editItem={editItem}
      />

      <BeneficiaryCaseView
        isOpen={caseViewOpen}
        onClose={() => { setCaseViewOpen(false); setViewItem(null) }}
        caseData={viewItem}
        initialStep={viewInitStep}
        onApprove={handleApproveAndPublish}
        onReject={(row) => handleClose(row)}
        onArchive={(row) => handleClose(row)}
      />

      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onAction={handleAction}
        row={selectedRow}
      />
    </div>
  )
}