
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Megaphone, Plus, Trash2, Edit2, Users, CheckCircle2, ImageOff, XCircle } from 'lucide-react'
import {
  useCampaignsFilterQuery,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useCloseCampaign,
} from '../../hooks/Usecampaigns '          // ⚠️ عدّلي المسار حسب مكان الملف عندك
import { buildCampaignFormData } from '../../api/campaignsApi' // ⚠️ عدّلي المسار
import CampaignFilters, { EMPTY_FILTERS } from './Campaignfilters'
import ConfirmModal            from '../../ui/ConfirmModal'
import { ProgressBar }        from '../../ui/Progressbar'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { SpinnerPage }        from '../../ui/Spinner'
import { PageHeader }         from '../../ui/PageHeader'
import { Card }               from '../../ui/Card'
import { Badge }              from '../../ui/Badge'
import { EmptyState }         from '../../ui/EmptyState'
import CampaignModal          from './CampaignModal'
import Pagination             from '../../ui/Pagination'
import PermissionButton       from '../../ui/PermissionButton'
import { Users2 } from 'lucide-react'
import CampaignVolunteersModal from './CampaignVolunteersModal'

const LIMIT = 8

// ── مكوّن شريط تقدم المتطوعين ──────────────────────────────
function VolunteerProgress({ needed, count = 0 }) {
  if (!needed || needed === 0) return null

  const isFull = count >= needed
  const pct    = Math.min(100, Math.round((count / needed) * 100))

  return (
    <div style={{
      marginTop: '0.625rem',
      padding: '8px 10px',
      borderRadius: 10,
      background: isFull ? 'rgba(22,163,74,0.08)' : 'var(--bg-muted)',
      border: `1px solid ${isFull ? 'rgba(22,163,74,0.25)' : 'var(--border-subtle)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={13} style={{ color: isFull ? '#16a34a' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isFull ? '#16a34a' : 'var(--text-secondary)' }}>
            المتطوعون
          </span>
        </div>
        {isFull ? (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.68rem', fontWeight: 700,
            color: '#16a34a', background: '#dcfce7',
            padding: '2px 8px', borderRadius: 99,
          }}>
            <CheckCircle2 size={11} /> اكتمل العدد
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {count} / {needed}
          </span>
        )}
      </div>
      <div style={{ height: 5, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: isFull ? '#16a34a' : 'var(--color-primary-500)',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ── بطاقة حملة واحدة ────────────────────────────────────────
function CampaignCard({ c, onEdit, onDelete, onClose, onShowVolunteers }) {
  const { t } = useTranslation()
  const pct   = c.amountNeeded > 0
    ? Math.min(100, Math.round((c.amountCollected / c.amountNeeded) * 100))
    : 0
  const color = pct >= 100 ? 'success' : pct >= 60 ? 'primary' : 'warning'
  const coverUrl = c.media?.[0]?.url || null
  const isClosed = c.status === 'closed'

  return (
    <Card style={{
      borderRadius: 24, background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', padding: 0,
    }}>
      <div style={{ position: 'relative', height: 170, flexShrink: 0 }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={c.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ImageOff size={28} color="rgba(255,255,255,0.4)" />
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge status={c.status} />
        </div>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Megaphone size={17} color="#fff" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.875rem 1rem' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {c.title}
        </h3>
        {c.description && (
          <p style={{
            margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)',
            lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {c.description}
          </p>
        )}

        <div style={{ marginTop: 'auto' }}>
          {c.amountNeeded > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>{t('campaigns.raised')}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{pct}%</span>
              </div>
              <ProgressBar value={c.amountCollected} max={c.amountNeeded} color={color} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{formatCurrency(c.amountCollected)}</span>
                <span>{formatCurrency(c.amountNeeded)}</span>
              </div>
            </>
          )}

          {c.volunteersNeeded > 0 && (
            <VolunteerProgress
              needed={c.volunteersNeeded}
              count={c.volunteersJoined || 0}
            />
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <PermissionButton
              permission="campaigns.edit"
              onClick={() => onEdit(c)}
              style={{
                flex: 1, height: 38,
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                transition: 'all 0.25s ease', boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
              }}
            >
              <Edit2 size={14} />
              {t('campaigns.actions.edit')}
            </PermissionButton>

            {!isClosed && (
              <PermissionButton
                permission="campaigns.edit"
                onClick={() => onClose(c.id)}
                title="إغلاق الحملة"
                style={{
                  width: 38, height: 38,
                  background: 'rgba(234,179,8,0.1)', color: '#b45309',
                  border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <XCircle size={15} />
              </PermissionButton>
            )}

            <PermissionButton
              permission="campaigns.delete"
              onClick={() => onDelete(c.id)}
              style={{
                width: 38, height: 38,
                background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease', boxShadow: '0 4px 12px rgba(220,38,38,0.08)',
              }}
            >
              <Trash2 size={15} />
            </PermissionButton>
          </div>
        </div>

        {c.acceptsVolunteers && (
          <PermissionButton
            onClick={() => onShowVolunteers(c)}
            style={{
              width: '100%', marginTop: '8px', height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'var(--bg-muted)', color: 'var(--color-primary-700)',
              border: '1px solid var(--border-subtle)', borderRadius: 10, cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.78rem',
            }}
          >
            <Users2 size={15} />
            متطوعو الحملة وساعاتهم
          </PermissionButton>
        )}
      </div>
    </Card>
  )
}

// ── الصفحة الرئيسية ─────────────────────────────────────────
export default function Campaigns() {
  const { t }  = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [closeTargetId,  setCloseTargetId]  = useState(null)
  const [params, setParams]       = useSearchParams()

  const page = Number(params.get('page') || 1)

  // ── قراءة كل الفلاتر من الـ URL (نفس نمط useSearchParams المستخدم بالباقي) ──
  const filters = Object.keys(EMPTY_FILTERS).reduce((acc, key) => {
    acc[key] = params.get(key) || EMPTY_FILTERS[key]
    return acc
  }, {})

  // تحديث فلتر وحدة — بيصفر الصفحة لـ 1 تلقائياً
  const handleFilterChange = (key, value) => {
    setParams(prev => {
      const n = new URLSearchParams(prev)
      if (value) n.set(key, value)
      else n.delete(key)
      n.set('page', '1')
      return n
    })
  }

  // تصفير كل الفلاتر (ما عدا الترتيب)
  const handleClearFilters = () => {
    setParams(prev => {
      const n = new URLSearchParams(prev)
      Object.keys(EMPTY_FILTERS).forEach(k => {
        if (k !== 'sort_by' && k !== 'sort_dir') n.delete(k)
      })
      n.set('page', '1')
      return n
    })
  }

  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false)
  const [activeCampaign, setActiveCampaign] = useState(null)

  const handleShowVolunteers = (campaign) => {
    setActiveCampaign(campaign)
    setVolunteersModalOpen(true)
  }

  // ── الربط الحقيقي بالباك — /campaignsfilter بيرجع كل الحقول ويدعم كل الفلاتر ──
  const { data, isLoading } = useCampaignsFilterQuery({
    page,
    per_page: LIMIT,
    search:              filters.search || undefined,
    type:                filters.type || undefined,
    participation_type:  filters.participation_type || undefined,
    status:              filters.status || undefined,
    min_amount_needed:   filters.min_amount_needed || undefined,
    max_amount_needed:   filters.max_amount_needed || undefined,
    start_date_from:     filters.start_date_from || undefined,
    start_date_to:       filters.start_date_to || undefined,
    end_date_from:       filters.end_date_from || undefined,
    end_date_to:         filters.end_date_to || undefined,
    sort_by:             filters.sort_by,
    sort_dir:            filters.sort_dir,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const createMut = useCreateCampaign()
  const updateMut = useUpdateCampaign()
  const deleteMut = useDeleteCampaign()
  const closeMut  = useCloseCampaign()

  const handleSave = async (form) => {
    const formData = buildCampaignFormData({
      title:               form.title,
      description:         form.description,
      type:                form.type,
      participation_type:  form.participationType,
      amount_needed:       form.amountNeeded,
      volunteers_needed:   form.volunteersNeeded,
      status:              form.status,
      start_date:          form.startDate,
      end_date:            form.endDate,
      media:               form.media,
    })

    if (editingId) {
      await updateMut.mutateAsync({ id: editingId, formData })
    } else {
      await createMut.mutateAsync(formData)
    }
    setEditingId(null)
  }

  const handleEdit = (c) => { setEditingId(c.id); setModalOpen(true) }

  // ── حذف: بيفتح Confirm Modal بدل window.confirm ──
  const handleDelete = (id) => setDeleteTargetId(id)
  const confirmDelete = () => {
    deleteMut.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
  }

  // ── إغلاق: بيفتح Confirm Modal بدل window.confirm ──
  const handleClose = (id) => setCloseTargetId(id)
  const confirmCloseCampaign = () => {
    closeMut.mutate(closeTargetId, { onSuccess: () => setCloseTargetId(null) })
  }

  const deleteTargetCampaign = items.find(c => c.id === deleteTargetId)
  const closeTargetCampaign  = items.find(c => c.id === closeTargetId)

  // إجماليات المتطوعين من الصفحة الحالية فقط (الباك ما بيرجع إجمالي شامل)
  const totalVolunteersNeeded = items.reduce((s, c) => s + (c.volunteersNeeded || 0), 0)
  const totalVolunteersFilled = items.reduce((s, c) => s + Math.min(c.volunteersJoined || 0, c.volunteersNeeded || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

      <PageHeader
        title={t('campaigns.title')}
        subtitle={t('campaigns.subtitle', { count: total })}
      >
        <PermissionButton
          permission="campaigns.create"
          onClick={() => { setEditingId(null); setModalOpen(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: 'var(--color-secondary-500)', color: '#111',
            border: 'none', padding: '10px 18px', borderRadius: 12,
            cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-family-sans)',
          }}
        >
          <Plus size={18} /> {t('campaigns.addBtn')}
        </PermissionButton>
      </PageHeader>

      <Card style={{
        padding: '1.5rem', borderRadius: 24,
        background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#eab308', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{t('campaigns.title')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
              {t('campaigns.subtitle', { count: total })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t('campaigns.total')}</div>
              <div style={{ color: '#eab308', fontWeight: 800, fontSize: '1.3rem' }}>{total}</div>
            </div>

            {totalVolunteersNeeded > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>المتطوعون (بهذه الصفحة)</div>
                <div style={{ color: '#eab308', fontWeight: 800, fontSize: '1.3rem' }}>
                  {totalVolunteersFilled}
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>/{totalVolunteersNeeded}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <CampaignFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <SpinnerPage />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {items.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
              <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <EmptyState icon={Megaphone} title={t('campaigns.empty')} />
              </Card>
            </div>
          ) : (
            items.map(c => (
              <CampaignCard
                key={c.id}
                c={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={handleClose}
                onShowVolunteers={handleShowVolunteers}
              />
            ))
          )}
        </div>
      )}

      {total > LIMIT && (
        <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '1rem', borderRadius: 16 }}>
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={next => setParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(next)); return n })}
          />
        </Card>
      )}

      <CampaignModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null) }}
        onSave={handleSave}
        campaignId={editingId}
      />

      {/* ── تأكيد الحذف ── */}
      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        loading={deleteMut.isLoading}
        title="حذف الحملة"
        danger
        confirmLabel="حذف"
        message={
          <>
            {t('campaigns.deleteConfirm')}<br />
            <strong style={{ color: 'var(--text-primary)' }}>{deleteTargetCampaign?.title}</strong>؟<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>هذا الإجراء لا يمكن التراجع عنه.</span>
          </>
        }
      />

      {/* ── تأكيد الإغلاق ── */}
      <ConfirmModal
        open={!!closeTargetId}
        onClose={() => setCloseTargetId(null)}
        onConfirm={confirmCloseCampaign}
        loading={closeMut.isLoading}
        title="إغلاق الحملة"
        danger={false}
        confirmLabel="إغلاق"
        message={
          <>
            هل أنت متأكد من إغلاق حملة<br />
            <strong style={{ color: 'var(--text-primary)' }}>{closeTargetCampaign?.title}</strong>؟<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>لن يقدر أحد يتبرع أو يتطوع فيها بعد الإغلاق.</span>
          </>
        }
      />

      {/* ⚠️ لسا مربوطة بسيرفس محلي (mock) — الباك تبع المتطوعين لسا ما جاهز */}
      <CampaignVolunteersModal
        open={volunteersModalOpen}
        onClose={() => setVolunteersModalOpen(false)}
        campaign={activeCampaign}
      />
    </div>
  )
}