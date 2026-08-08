// ── CampaignVolunteersModal.jsx ─────────────────────────────────────────────
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Clock, Check, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import Modal from '../../ui/Modal'
import { Avatar } from '../../ui/Avatar'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import PermissionButton from '../../ui/PermissionButton'
import { volunteersService, getSkillLabel, SKILLS_LABELS_AR } from '../../hooks/volunteersService'
import { useAuth } from '../../context/AuthContext'

const STATUS_TABS = [
  { key: 'pending', label: 'قيد المراجعة' },
  { key: 'approved', label: 'مقبولين' },
  { key: 'rejected', label: 'مرفوضين' },
]

export default function CampaignVolunteersModal({ open, onClose, campaign }) {
  const qc = useQueryClient()
  const { user } = useAuth()
const isFieldWorker = user?.role === 'fieldWorker' // ✅
  const [tab, setTab] = useState('approved')
  const [expandedId, setExpandedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-volunteers', campaign?.id, tab],
    queryFn: () => volunteersService.getCampaignVolunteersByStatus(campaign.id, tab),
    enabled: open && !!campaign?.id,
  })

  const statusMut = useMutation({
    mutationFn: ({ volunteerId, status }) =>
      volunteersService.updateCampaignVolunteerStatus(campaign.id, volunteerId, status),
    onSuccess: () => {
      qc.invalidateQueries(['campaign-volunteers', campaign?.id])
    },
  })

  const volunteers = data?.volunteers ?? []

  return (
    <Modal open={open} onClose={onClose} title={`متطوعو حملة: ${campaign?.name || campaign?.title || ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* ملخص */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '12px',
            background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--color-primary-700)' }} />
            <span style={{ fontWeight: 700, color: 'var(--color-primary-700)', fontSize: '0.88rem' }}>
              {data?.count ?? volunteers.length} متطوع
            </span>
          </div>
        </div>

        {/* تابات الحالة */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: tab === t.key ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
                background: tab === t.key ? 'var(--color-primary-50)' : 'transparent',
                color: tab === t.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                fontWeight: tab === t.key ? 700 : 500, fontSize: '0.84rem', cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SpinnerPage />
        ) : !volunteers.length ? (
          <EmptyState title="لا يوجد متطوعون بهذه الحالة" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {volunteers.map((v) => (
              <VolunteerRow
                key={v.volunteer_id}
                volunteer={v}
                campaignId={campaign.id}
                isFieldWorker={isFieldWorker}
                isApproved={tab === 'approved'}
                isPending={tab === 'pending'}
                expanded={expandedId === v.volunteer_id}
                onToggleExpand={() =>
                  setExpandedId((id) => (id === v.volunteer_id ? null : v.volunteer_id))
                }
                onApprove={() => statusMut.mutate({ volunteerId: v.volunteer_id, status: 'approved' })}
                onReject={() => statusMut.mutate({ volunteerId: v.volunteer_id, status: 'rejected' })}
                mutLoading={statusMut.isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

function VolunteerRow({
  volunteer: v,
  campaignId,
  isFieldWorker,
  isApproved,
  isPending,
  expanded,
  onToggleExpand,
  onApprove,
  onReject,
  mutLoading,
}) {
  return (
    <div
      style={{
        borderRadius: '12px', border: '1px solid var(--border-subtle)',
        background: 'var(--surface)', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
        <Avatar name={v.name} size="sm" />

        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{v.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.phone}</div>
        </div>

        {isPending && (
          <>
            <PermissionButton
            permission="volunteers.approve"
              onClick={onApprove}
              disabled={mutLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                fontWeight: 700, fontFamily: 'Cairo, sans-serif', background: '#dcfce7', color: '#16a34a',
              }}
            >
              <Check size={13} /> قبول
            </PermissionButton>
            <PermissionButton
             permission="volunteers.reject"
              onClick={onReject}
              disabled={mutLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                fontWeight: 700, fontFamily: 'Cairo, sans-serif', background: '#fee2e2', color: '#dc2626',
              }}
            >
              <X size={13} /> رفض
            </PermissionButton>
          </>
        )}

        {isApproved && (
          <button
            onClick={onToggleExpand}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, border: '1px solid var(--border-subtle)', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
              background: 'var(--bg-muted)', color: 'var(--text-secondary)',
            }}
          >
            <Clock size={13} />
            الساعات
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {isApproved && expanded && (
        <VolunteerHoursPanel
          campaignId={campaignId}
          volunteerId={v.volunteer_id}
          isFieldWorker={isFieldWorker}
        />
      )}
    </div>
  )
}

function VolunteerHoursPanel({ campaignId, volunteerId, isFieldWorker }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ date: '', hours: '', activity_description: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['volunteer-hours', campaignId, volunteerId],
    queryFn: () => volunteersService.getVolunteerHoursInCampaign(campaignId, volunteerId),
  })

  const addMut = useMutation({
    mutationFn: (payload) => volunteersService.addVolunteerHours(campaignId, volunteerId, payload),
    onSuccess: () => {
      qc.invalidateQueries(['volunteer-hours', campaignId, volunteerId])
      setForm({ date: '', hours: '', activity_description: '' })
    },
  })

  const handleAdd = () => {
    if (!form.date || !form.hours) return
    addMut.mutate(form)
  }

  return (
    <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted)' }}>
      {isLoading ? (
        <SpinnerPage />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              سجل الساعات
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
              الإجمالي: {data?.total_hours ?? 0} ساعة
            </span>
          </div>

          {!data?.entries?.length ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
              لا توجد ساعات مسجلة بعد.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {data.entries.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: 8, background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)', fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{e.date}</span>
                  <span style={{ flex: 1, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {e.activity_description || '—'}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>{e.hours} س</span>
                </div>
              ))}
            </div>
          )}

          {/* ✅ إضافة سجل ساعات جديد — محصور بدور field_worker فقط بالباك اند */}
          {isFieldWorker ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ flex: '1 1 130px' }}
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="عدد الساعات"
                className="input"
                value={form.hours}
                onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                style={{ width: '110px' }}
              />
              <input
                type="text"
                placeholder="وصف النشاط (اختياري)"
                className="input"
                value={form.activity_description}
                onChange={(e) => setForm((f) => ({ ...f, activity_description: e.target.value }))}
                style={{ flex: '2 1 160px' }}
              />
              <PermissionButton
              permission="volunteers.setHours"
                onClick={handleAdd}
                disabled={addMut.isLoading || !form.date || !form.hours}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px',
                  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                  fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                  background: 'var(--color-secondary-500)', color: '#111',
                }}
              >
                <Plus size={14} /> إضافة
              </PermissionButton>
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              تسجيل الساعات متاح فقط لحساب "مسؤول ميداني" (field_worker).
            </p>
          )}
        </>
      )}
    </div>
  )
}