// features/campaigns/Campaigns.jsx  (النسخة المحدّثة)
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Megaphone, Plus, Trash2, Edit2, Users, CheckCircle2, ImageOff } from 'lucide-react'
import { campaignsService }  from '../../service/ServiceLayer'
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
import { Users2 } from 'lucide-react' // أيقونة إضافية للزر
import CampaignVolunteersModal from './CampaignVolunteersModal'
const LIMIT = 9

// ── مكوّن شريط تقدم المتطوعين ──────────────────────────────
function VolunteerProgress({ needed, count = 0 }) {
  if (!needed || needed === 0) return null

  const isFull = count >= needed
  const pct    = Math.min(100, Math.round((count / needed) * 100))

  return (
    <div style={{
      marginTop: '0.875rem',
      padding: '10px 12px',
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

      {/* شريط التقدم */}
      <div style={{ height: 5, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: isFull ? '#16a34a' : '#094037',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ── بطاقة حملة واحدة ────────────────────────────────────────
function CampaignCard({ c, onEdit, onDelete,onShowVolunteers  }) {
  const { t } = useTranslation()
  const pct   = c.targetAmount > 0
    ? Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100))
    : 0
  const color = pct >= 100 ? 'success' : pct >= 60 ? 'primary' : 'warning'

  return (
    <Card style={{
      borderRadius: 24, background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', padding: 0,
    }}>
      {/* ✅ صورة الغلاف */}
      <div style={{ position: 'relative', height: 140, flexShrink: 0 }}>
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.name}
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
        {/* Badge على الصورة */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge status={c.status} />
        </div>
        {/* أيقونة الحملة على الصورة */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Megaphone size={17} color="#fff" />
        </div>
      </div>

      {/* المحتوى */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.125rem' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {c.name}
        </h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: 40 }}>
          {c.description}
        </p>

        {/* تفاصيل التبرعات */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>{t('campaigns.raised')}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{pct}%</span>
          </div>
          <ProgressBar value={c.collectedAmount} max={c.targetAmount} color={color} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>{formatCurrency(c.collectedAmount)}</span>
            <span>{formatCurrency(c.targetAmount)}</span>
          </div>

          {/* ✅ شريط المتطوعين */}
          <VolunteerProgress
            needed={c.volunteersNeeded}
            count={c.volunteersCount || 0}
          />

          {/* إجراءات */}
          {/* إجراءات */}
<div
  style={{
    display: 'flex',
    gap: 10,
    marginTop: '1rem',
    paddingTop: '0.875rem',
    borderTop: '1px solid var(--border-subtle)',
  }}
>
  {/* زر التعديل */}
  <PermissionButton
    permission="campaigns.edit"
    onClick={() => onEdit(c)}
    style={{
      flex: 1,
      height: 42,
      background:
        'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
      color: '#fff',
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontFamily: 'Cairo, sans-serif',
      fontWeight: 700,
      fontSize: '0.82rem',
      transition: 'all 0.25s ease',
      boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
    }}
  >
    <Edit2 size={15} />
    {t('campaigns.actions.edit')}
  </PermissionButton>

  {/* زر الحذف */}
  <PermissionButton
    permission="campaigns.delete"
    onClick={() => onDelete(c.id)}
    style={{
      width: 42,
      height: 42,
      background: 'rgba(220,38,38,0.08)',
      color: '#dc2626',
      border: '1px solid rgba(220,38,38,0.15)',
      borderRadius: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.25s ease',
      boxShadow: '0 4px 12px rgba(220,38,38,0.08)',
    }}
  >
    <Trash2 size={16} />
  </PermissionButton>
</div>
        </div>
        {/* ✅ صف جديد: زر "متطوعو الحملة" */}
        <PermissionButton
          onClick={() => onShowVolunteers(c)}
          style={{
            width: '100%',
            marginTop: '8px',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--bg-muted)',
            color: 'var(--color-primary-700)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 700,
            fontSize: '0.82rem',
          }}
        >
          <Users2 size={15} />
          متطوعو الحملة وساعاتهم
        </PermissionButton>
      </div>
    </Card>
  )
}

// ── الصفحة الرئيسية ─────────────────────────────────────────
export default function Campaigns() {
  const { t }  = useTranslation()
  const qc     = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [params, setParams]       = useSearchParams()

  const page   = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const status = params.get('status') || ''

  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false)
  const [activeCampaign, setActiveCampaign] = useState(null)
 
  const handleShowVolunteers = (campaign) => {
    setActiveCampaign(campaign)
    setVolunteersModalOpen(true)
  }
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, search, status],
    queryFn:  () => campaignsService.getList({ page, limit: LIMIT, search, status }),
  })

  const remove = useMutation({
    mutationFn: campaignsService.remove,
    onSuccess:  () => qc.invalidateQueries(['campaigns']),
  })

  const saveMut = useMutation({
    mutationFn: (form) => editItem
      ? campaignsService.update(editItem.id, form)
      : campaignsService.create(form),
    onSuccess: () => { qc.invalidateQueries(['campaigns']); setModalOpen(false); setEditItem(null) },
  })

  const handleSave  = (form) => saveMut.mutate(form)
  const handleEdit  = (c)    => { setEditItem(c); setModalOpen(true) }
  const handleDelete = (id)  => {
    if (window.confirm(t('campaigns.deleteConfirm'))) remove.mutate(id)
  }

  // إجماليات من البيانات الحالية
  const totalVolunteersNeeded = data?.data?.reduce((s, c) => s + (c.volunteersNeeded || 0), 0) ?? 0
  const totalVolunteersFilled = data?.data?.reduce((s, c) => s + Math.min(c.volunteersCount || 0, c.volunteersNeeded || 0), 0) ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

      {/* Header */}
      <PageHeader
        title={t('campaigns.title')}
        subtitle={t('campaigns.subtitle', { count: data?.total ?? 0 })}
      >
        <PermissionButton
          permission="campaigns.create"
          onClick={() => { setEditItem(null); setModalOpen(true) }}
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

      {/* Stats Card */}
      <Card style={{
        padding: '1.5rem', borderRadius: 24,
        background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#eab308', fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{t('campaigns.title')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
              {t('campaigns.subtitle', { count: data?.total ?? 0 })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* إجمالي الحملات */}
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t('campaigns.total')}</div>
              <div style={{ color: '#eab308', fontWeight: 800, fontSize: '1.3rem' }}>{data?.total ?? 0}</div>
            </div>

            {/* ✅ إجمالي المتطوعين */}
            {totalVolunteersNeeded > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>المتطوعون</div>
                <div style={{ color: '#eab308', fontWeight: 800, fontSize: '1.3rem' }}>
                  {totalVolunteersFilled}
                  <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>/{totalVolunteersNeeded}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <SpinnerPage />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {data?.data?.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
              <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <EmptyState icon={Megaphone} title={t('campaigns.empty')} />
              </Card>
            </div>
          ) : (
            data?.data?.map(c => (
              <CampaignCard
                key={c.id}
                c={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowVolunteers={handleShowVolunteers} 
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {(data?.total ?? 0) > LIMIT && (
        <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '1rem', borderRadius: 16 }}>
          <Pagination
            page={page}
            total={data?.total ?? 0}
            limit={LIMIT}
            onPageChange={next => setParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(next)); return n })}
          />
        </Card>
      )}

      {/* Modal */}
      <CampaignModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        onSave={handleSave}
        editItem={editItem}
      />
       <CampaignVolunteersModal
        open={volunteersModalOpen}
        onClose={() => setVolunteersModalOpen(false)}
        campaign={activeCampaign}
      />
    </div>
  )
}