import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X, CheckCircle, XCircle, AlertTriangle, Phone, Mail,
  MapPin, User, Award, PauseCircle, Calendar, Briefcase, Info,
} from 'lucide-react'
import { Badge } from '../../ui/Badge'
import PermissionButton from '../../ui/PermissionButton'
import { volunteersService, getSkillLabel, parseSkills, getVolunteerCampaignInfo } from '../../hooks/volunteersService'
import { useTranslation } from 'react-i18next'

function InfoCard({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ padding: '10px 14px', background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
      <p style={{ margin: '0 0 3px', fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icon && <Icon size={12} />} {label}
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}

export default function VolunteerDetailsModal({ open, onClose, volunteer }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [confirmAction, setConfirmAction] = useState(null)

  const targetId = volunteer?.volunteer_id || volunteer?.application_id || volunteer?.id
  const { isGeneral, campaignName } = volunteer ? getVolunteerCampaignInfo(volunteer) : {}
  const normalizedSkills = volunteer ? parseSkills(volunteer.skills) : []
  const isApproved = volunteer?.status === 'approved' || volunteer?.status === 'accepted'
  const isRejected = volunteer?.status === 'rejected'

  // القبول/الرفض هون بيصير فقط للمتطوع العام
  const reviewMut = useMutation({
    mutationFn: ({ id, newStatus }) => volunteersService.reviewApplication(id, newStatus),
    onSuccess: () => {
      qc.invalidateQueries(['volunteer-applications'])
      qc.invalidateQueries(['volunteers'])
      setConfirmAction(null)
      onClose()
    },
  })

  if (!open || !volunteer) return null

  const handleConfirm = () => {
    if (confirmAction === 'suspended') {
      alert('سيتم ربطه بـ API إيقاف التطوع عند اكتمال الـ Backend')
      setConfirmAction(null)
      return
    }
    if (confirmAction) {
      reviewMut.mutate({ id: targetId, newStatus: confirmAction })
    }
  }

  const volunteerName = volunteer.name || volunteer.full_name

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 650, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('volunteers.modal.titleDetails', { defaultValue: 'تفاصيل طلب التطوع' })}
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              #{targetId} · {volunteerName}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--bg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-muted)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 62, height: 62, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(135deg, var(--color-primary-500), #0a5244)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#eab308' }}>
              {(volunteerName || 'V').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {volunteerName}
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge status={volunteer.status} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: isGeneral ? 'var(--bg-surface)' : '#e0f2fe', color: isGeneral ? 'var(--text-secondary)' : '#0369a1', border: '1px solid var(--border-subtle)' }}>
                  {isGeneral
                    ? t('volunteers.type.general', { defaultValue: 'تطوع عام' })
                    : `${t('volunteers.modal.campaign', { defaultValue: 'الحملة' })}${campaignName ? `: ${campaignName}` : ''}`}
                </span>
                {volunteer.governorate && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={12} /> {volunteer.governorate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoCard icon={Phone} label={t('volunteers.modal.phone', { defaultValue: 'رقم الهاتف' })} value={volunteer.phone} />
            <InfoCard icon={Mail} label={t('volunteers.modal.email', { defaultValue: 'البريد الإلكتروني' })} value={volunteer.email} />
            <InfoCard icon={User} label={t('volunteers.modal.gender', { defaultValue: 'الجنس' })} value={volunteer.gender} />
            <InfoCard icon={Briefcase} label={t('volunteers.modal.occupation', { defaultValue: 'المهنة' })} value={volunteer.occupation} />
            <InfoCard icon={Calendar} label={t('volunteers.modal.availability', { defaultValue: 'التوفر' })} value={volunteer.availability} />
            <InfoCard icon={MapPin} label={t('volunteers.modal.governorate', { defaultValue: 'المحافظة' })} value={volunteer.governorate} />
          </div>

          {normalizedSkills.length > 0 && (
            <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Award size={14} /> {t('volunteers.modal.skill', { defaultValue: 'المهارات والخبرات' })}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {normalizedSkills.map((s) => (
                  <span key={s} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', padding: '4px 10px', borderRadius: 99 }}>
                    {getSkillLabel(s)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {volunteer.description && (
            <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('volunteers.modal.notes', { defaultValue: 'ملاحظات وتفاصيل إضافية' })}
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{volunteer.description}</p>
            </div>
          )}

          {/* تنويه لمتطوع الحملة — بدون إجراءات هون */}
          {!isGeneral && (
            <div style={{ display: 'flex', gap: 8, padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <Info size={15} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                هذا متطوع ضمن حملة — القبول والرفض بيتم من داخل صفحة الحملة نفسها.
              </p>
            </div>
          )}

          {confirmAction && (
            <div style={{ padding: '1rem', background: '#fefce8', borderRadius: 12, border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
              <AlertTriangle size={24} style={{ color: confirmAction === 'approved' ? '#16a34a' : '#dc2626' }} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#78350f' }}>
                {confirmAction === 'approved' &&
                  t('volunteers.modal.confirm.approveMessage', { name: volunteerName, defaultValue: `هل أنت متأكد من رغبتك في قبول طلب التطوع الخاص بـ ${volunteerName}؟` })}
                {confirmAction === 'rejected' &&
                  t('volunteers.modal.confirm.rejectMessage', { name: volunteerName, defaultValue: `هل أنت متأكد من رغبتك في رفض طلب التطوع الخاص بـ ${volunteerName}؟` })}
                {confirmAction === 'suspended' &&
                  `هل تريد إيقاف تطوع (${volunteerName})؟`}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmAction(null)} style={btnGhost}>
                  {t('volunteers.modal.PermissionButtons.cancel', { defaultValue: 'إلغاء' })}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={reviewMut.isLoading}
                  style={{ ...base, background: confirmAction === 'approved' ? '#16a34a' : confirmAction === 'suspended' ? '#d97706' : '#dc2626', color: '#fff' }}
                >
                  {reviewMut.isLoading
                    ? t('volunteers.modal.confirm.loading', { defaultValue: 'جاري التنفيذ...' })
                    : t('volunteers.modal.confirm.confirmBtn', { defaultValue: 'تأكيد الإجراء' })}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', flexShrink: 0, borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8, justifyContent: 'flex-end', background: 'var(--bg-surface)' }}>
          <button onClick={onClose} style={btnGhost}>
            {t('volunteers.modal.PermissionButtons.cancel', { defaultValue: 'إغلاق' })}
          </button>

          {/* أزرار الإجراءات — بس للمتطوع العام */}
          {isGeneral && !isApproved && !isRejected && (
            <>
              <PermissionButton onClick={() => setConfirmAction('rejected')} permission="volunteers.reject" style={btnDanger}>
                <XCircle size={15} /> {t('volunteers.modal.PermissionButtons.reject', { defaultValue: 'رفض' })}
              </PermissionButton>
              <PermissionButton onClick={() => setConfirmAction('approved')} permission="volunteers.approve" style={btnSuccess}>
                <CheckCircle size={15} /> {t('volunteers.modal.PermissionButtons.approve', { defaultValue: 'قبول المتطوع' })}
              </PermissionButton>
            </>
          )}

          {isGeneral && isApproved && (
            <PermissionButton onClick={() => setConfirmAction('suspended')} permission="volunteers.suspend" style={{ ...btnMuted, color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }}>
              <PauseCircle size={15} /> إيقاف التطوع
            </PermissionButton>
          )}
        </div>

      </div>
    </div>
  )
}

const base       = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' }
const btnSuccess = { ...base, background: '#16a34a', color: '#fff' }
const btnDanger  = { ...base, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }
const btnMuted   = { ...base, background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
const btnGhost   = { ...base, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }