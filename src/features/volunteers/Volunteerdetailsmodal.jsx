// ── VolunteerDetailsModal.jsx ───────────────────────────────────────────────
// مودال عرض تفاصيل المتطوع للقراءة فقط (بدون أي إمكانية تعديل/إضافة)
// يحل محل VolunteerModal كزر بالهيدر

import { useTranslation } from 'react-i18next'
import { Smartphone, Clock, Award } from 'lucide-react'
import Modal from '../../ui/Modal'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { getTotalHours } from '../certificates/mockVolunteers'

const REQUIRED_HOURS = 50

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.88rem',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  )
}

export default function VolunteerDetailsModal({ open, onClose, volunteer }) {
  const { t } = useTranslation()

  if (!volunteer) return null

  const totalHours = getTotalHours(volunteer)
  const isEligible = totalHours >= REQUIRED_HOURS

  return (
    <Modal open={open} onClose={onClose} title="تفاصيل المتطوع">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* رأس البطاقة: الاسم والحالة */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar name={volunteer.name} size="md" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {volunteer.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{volunteer.phone}</div>
          </div>
          <Badge status={volunteer.status} />
        </div>

        {/* معلومات أساسية */}
        <div>
          <InfoRow label={t('volunteers.modal.email')} value={volunteer.email} />
          <InfoRow label={t('volunteers.modal.skill')} value={volunteer.skill && t(`volunteers.modal.skills.${volunteer.skill}`)} />
          <InfoRow label={t('volunteers.modal.availability')} value={volunteer.availability && t(`volunteers.modal.availability_options.${volunteer.availability}`)} />
          <InfoRow label={t('volunteers.modal.experience')} value={volunteer.experience && t(`volunteers.modal.experience_options.${volunteer.experience}`)} />
          {volunteer.notes && <InfoRow label={t('volunteers.modal.notes')} value={volunteer.notes} />}
        </div>

        {/* ساعات التطوع حسب الحملة - عرض فقط */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: 'var(--color-primary-600)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                ساعات التطوع حسب الحملة
              </span>
            </div>

            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.8rem', fontWeight: 700,
                color: 'var(--color-primary-700)',
                background: 'var(--color-primary-50)',
                padding: '4px 12px', borderRadius: 99,
              }}
            >
              {isEligible && <Award size={12} />}
              الإجمالي: {totalHours} ساعة
            </span>
          </div>

          {(!volunteer.campaignHours || volunteer.campaignHours.length === 0) ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              لا توجد ساعات مسجلة بعد.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* رأس الجدول */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                <div style={{ flex: 2 }}>الحملة</div>
                <div style={{ width: '90px', textAlign: 'center' }}>
                  <Smartphone size={11} style={{ verticalAlign: 'middle', marginInlineEnd: 4 }} />
                  من التطبيق
                </div>
                <div style={{ width: '90px', textAlign: 'center' }}>المعتمدة</div>
              </div>

              {volunteer.campaignHours.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ flex: 2, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.campaignName}
                  </div>
                  <div style={{ width: '90px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {c.appReportedHours ?? 0}
                  </div>
                  <div style={{ width: '90px', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                    {c.hours ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}