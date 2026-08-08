import Modal from '../../ui/Modal'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { volunteersService, getSkillLabel, SKILLS_LABELS_AR } from '../../hooks/volunteersService'

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  )
}

const GENDER_LABELS = { male: 'ذكر', female: 'أنثى' }

export default function VolunteerDetailsModal({ open, onClose, volunteer }) {
  if (!volunteer) return null

  return (
    <Modal open={open} onClose={onClose} title="تفاصيل طلب التطوع">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        <div>
          <InfoRow label="البريد الإلكتروني" value={volunteer.email} />
          <InfoRow label="الجنس" value={GENDER_LABELS[volunteer.gender]} />
          <InfoRow label="المهنة" value={volunteer.occupation} />
          <InfoRow label="المحافظة" value={volunteer.governorate} />
          <InfoRow label="التوفر" value={volunteer.availability} />
        </div>

        {!!(volunteer.skills || []).length && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              المهارات
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {volunteer.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-700)',
                    background: 'var(--color-primary-50)', padding: '4px 10px', borderRadius: 99,
                  }}
                >
                  {getSkillLabel(s)}
                </span>
              ))}
            </div>
          </div>
        )}

        {volunteer.description && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
              نبذة
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {volunteer.description}
            </p>
          </div>
        )}

        {/* ملاحظة: ساعات التطوع الإجمالية غير متوفرة هون لأنو هاد طلب عام
            وليس مرتبط بحملة. لعرض الساعات لازم صفحة "متطوعي الجمعية المعتمدين"
            (approved-general-volunteers) أو تفاصيل حسب كل حملة على حدة. */}
      </div>
    </Modal>
  )
}