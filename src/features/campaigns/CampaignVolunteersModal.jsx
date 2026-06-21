// ── CampaignVolunteersModal.jsx ─────────────────────────────────────────────
// مودال يُفتح من بطاقة الحملة: يعرض المتطوعين المشاركين بهاي الحملة
// ويسمح بتحديد/تعديل عدد ساعات تطوع كل واحد منهم لهذه الحملة بالتحديد

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Save, Clock, Smartphone } from 'lucide-react'
import Modal from '../../ui/Modal'
import { Avatar } from '../../ui/Avatar'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import PermissionButton from '../../ui/PermissionButton'
import { volunteersService } from '../../service/ServiceLayer'

export default function CampaignVolunteersModal({ open, onClose, campaign }) {
  const qc = useQueryClient()
  const [hoursMap, setHoursMap] = useState({}) // { volunteerId: hours }

  // جلب المتطوعين المشاركين بهذه الحملة فقط
  const { data, isLoading } = useQuery({
    queryKey: ['campaign-volunteers', campaign?.id],
    queryFn: () => volunteersService.getByCampaign(campaign.id),
    enabled: open && !!campaign?.id,
  })

  // تهيئة hoursMap عند فتح المودال (الساعات المعتمدة - hours)
  useEffect(() => {
    if (data?.data) {
      const map = {}
      data.data.forEach((v) => {
        const entry = (v.campaignHours || []).find((c) => c.campaignId === campaign.id)
        map[v.id] = entry?.hours ?? 0
      })
      setHoursMap(map)
    }
  }, [data, campaign?.id])

  const saveMut = useMutation({
    mutationFn: ({ volunteerId, hours }) =>
      volunteersService.setCampaignHours(volunteerId, campaign.id, campaign.name, hours),
    onSuccess: () => {
      qc.invalidateQueries(['campaign-volunteers', campaign?.id])
      qc.invalidateQueries(['volunteers'])
    },
  })

  const handleHoursChange = (volunteerId, value) => {
    setHoursMap((m) => ({ ...m, [volunteerId]: value }))
  }

  const handleSaveRow = (volunteerId) => {
    const hours = Number(hoursMap[volunteerId]) || 0
    saveMut.mutate({ volunteerId, hours })
  }

  const totalHours = useMemo(
    () => Object.values(hoursMap).reduce((s, h) => s + (Number(h) || 0), 0),
    [hoursMap]
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`متطوعو حملة: ${campaign?.name || ''}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* ملخص */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: 'var(--color-primary-700)' }} />
            <span style={{ fontWeight: 700, color: 'var(--color-primary-700)', fontSize: '0.88rem' }}>
              {data?.data?.length ?? 0} متطوع مشارك
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} style={{ color: 'var(--color-primary-700)' }} />
            <span style={{ fontWeight: 800, color: 'var(--color-primary-700)', fontSize: '0.9rem' }}>
              {totalHours} ساعة إجمالي
            </span>
          </div>
        </div>

        {/* قائمة المتطوعين */}
        {isLoading ? (
          <SpinnerPage />
        ) : !data?.data?.length ? (
          <EmptyState title="لا يوجد متطوعون مسجلون بهذه الحملة" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* رؤوس الأعمدة */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 14px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
              }}
            >
              <div style={{ width: '32px' }} />
              <div style={{ flex: 1 }}>المتطوع</div>
              <div style={{ width: '110px', textAlign: 'center' }}>من التطبيق</div>
              <div style={{ width: '90px', textAlign: 'center' }}>المعتمدة</div>
              <div style={{ width: '40px' }} />
              <div style={{ width: '78px' }} />
            </div>

            {data.data.map((v) => {
              const entry = (v.campaignHours || []).find((c) => c.campaignId === campaign.id)
              const reportedHours = entry?.appReportedHours ?? 0

              return (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface)',
                }}
              >
                <Avatar name={v.name} size="sm" />

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.phone}</div>
                </div>

                {/* ✅ الساعات المُدخلة من تطبيق الموبايل - عرض فقط */}
                <div
                  title="الساعات التي أدخلها المتطوع بنفسه من تطبيق الموبايل"
                  style={{
                    width: '110px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    height: '40px', borderRadius: '10px',
                    background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)',
                  }}
                >
                  <Smartphone size={12} />
                  {reportedHours}
                </div>

                {/* الساعات المعتمدة - قابلة للتعديل */}
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursMap[v.id] ?? 0}
                  onChange={(e) => handleHoursChange(v.id, e.target.value)}
                  style={{ width: '90px', textAlign: 'center', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', width: '40px' }}>ساعة</span>

                <PermissionButton
                  onClick={() => handleSaveRow(v.id)}
                  disabled={saveMut.isLoading}
                  style={{
                    width: '78px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 0',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    fontFamily: 'Cairo, sans-serif',
                    background: 'var(--color-secondary-500)',
                    color: '#111',
                  }}
                >
                  <Save size={14} />
                  حفظ
                </PermissionButton>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}