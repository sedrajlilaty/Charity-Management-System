// features/services/Services.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Baby, HeartPulse, BookOpen, GraduationCap, Edit2, Users, Clock, CheckCircle2 } from 'lucide-react'
import { beneficiariesService } from '../../service/ServiceLayer'
import { PageHeader }   from '../../ui/PageHeader'
import { Card }         from '../../ui/Card'
import PermissionButton from '../../ui/PermissionButton'
import ServiceModal     from './ServiceModal'
import { formatCurrency } from '../../utlis/helper'

// ✏️ عدّلي أسماء/مسارات الملفات حسب شو حاطة الصور عندك بمجلد assets
import orphanImg      from '../../assets/services/orphan.jpg'
import medicalImg     from '../../assets/services/medical.jpg'
import schoolImg      from '../../assets/services/school.jpg'
import universityImg  from '../../assets/services/university.jpg'

// ── تعريف الخدمات الأربع الثابتة ──────────────────────────
// ⚠️ category هون لازم تطابق بالضبط القيمة يلي راجعة من الباك اند لحقل فئة المستفيد
// (تأكدي من beneficiariesService.getList response — عدّلي القيم تحت إذا لزم)
const SERVICE_TYPES = [
  {
    key: 'orphan',
    category: 'orphan',            // ⚠️ تأكدي من القيمة الفعلية بالباك
    icon: Baby,
    image: orphanImg,
  },
  {
    key: 'medical',
    category: 'medical',           // ⚠️ تأكدي (يمكن 'patient')
    icon: HeartPulse,
    image: medicalImg,
  },
  {
    key: 'schoolStudent',
    category: 'school_student',    // ⚠️ تأكدي من القيمة الفعلية
    icon: BookOpen,
    image: schoolImg,
  },
  {
    key: 'universityStudent',
    category: 'university_student',// ⚠️ تأكدي من القيمة الفعلية
    icon: GraduationCap,
    image: universityImg,
  },
]

// ── كارد خدمة واحدة (نفس شكل CampaignCard) ──────────────────
function ServiceCard({ type, beneficiaries, isLoading, onEdit }) {
  const { t } = useTranslation()
  const Icon = type.icon

  const related      = beneficiaries.filter(b => b.category === type.category)
  const activeCount  = related.filter(b => b.status === 'active').length
  const pendingCount = related.filter(b => b.status === 'pending').length
  const totalSupport = related
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + (b.monthlySupport || 0), 0)

  return (
    <Card style={{
      borderRadius: 24, background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', padding: 0,
    }}>
      {/* ── غلاف الصورة ── */}
      <div style={{ position: 'relative', height: 170, flexShrink: 0 }}>
        {type.image ? (
          <img
            src={type.image}
            alt={t(`services.types.${type.key}.title`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={32} color="rgba(255,255,255,0.5)" />
          </div>
        )}

        {/* عدد المستفيدين الفعليين — بادج أعلى يسار */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'var(--color-secondary-500)', color: '#111',
          padding: '4px 12px', borderRadius: 99,
          fontSize: '0.72rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Users size={12} />
          {isLoading ? '...' : activeCount}
        </div>

        {/* أيقونة الخدمة — أعلى يمين */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color="#fff" />
        </div>
      </div>

      {/* ── محتوى الكارد ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.875rem 1rem' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t(`services.types.${type.key}.title`)}
        </h3>
        <p style={{
          margin: '0 0 0.875rem', fontSize: '0.8rem', color: 'var(--text-secondary)',
          lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {t(`services.types.${type.key}.description`)}
        </p>

        {/* إجمالي الدعم الحالي */}
        <div style={{
          padding: '8px 12px', borderRadius: 10, background: 'var(--bg-muted)',
          marginBottom: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {t('services.currentSupport')}
          </span>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary-600)' }}>
            {isLoading ? '...' : formatCurrency(totalSupport)}
          </span>
        </div>

        {/* حالات مستفيدة / قيد الانتظار */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <div style={{
            flex: 1, padding: '8px 10px', borderRadius: 10,
            background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={12} color="var(--color-primary-500)" />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('services.stats.active')}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {isLoading ? '...' : activeCount}
            </span>
          </div>

          <div style={{
            flex: 1, padding: '8px 10px', borderRadius: 10,
            background: 'rgba(242,192,85,0.12)', border: '1px solid rgba(242,192,85,0.3)',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} color="var(--color-secondary-600)" />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('services.stats.pending')}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {isLoading ? '...' : pendingCount}
            </span>
          </div>
        </div>

        {/* تعديل */}
        <PermissionButton
          permission="services.edit"
          onClick={() => onEdit(type)}
          style={{
            width: '100%', marginTop: '0.75rem', height: 38,
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'var(--font-family-sans)', fontWeight: 700, fontSize: '0.8rem',
          }}
        >
          <Edit2 size={14} />
          {t('services.actions.edit')}
        </PermissionButton>
      </div>
    </Card>
  )
}

// ── الصفحة الرئيسية ─────────────────────────────────────────
export default function Services() {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editType,  setEditType]  = useState(null)

  const { data: beneficiariesData, isLoading } = useQuery({
    queryKey: ['beneficiaries-all-statuses'],
    queryFn:  () => beneficiariesService.getList({ limit: 1000 }),
    staleTime: 1000 * 60 * 2,
  })
  const allBeneficiaries = beneficiariesData?.data ?? []

  const totalActive = allBeneficiaries.filter(b => b.status === 'active').length

  const handleSave = (form) => {
    // ✏️ اربطيها بالـ mutation الفعلي لتعديل بيانات الخدمة (وصف/مبلغ) بالباك اند
    console.log('save service', editType?.key, form)
    setModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

      <PageHeader
        title={t('services.title')}
        subtitle={t('services.subtitle', { count: totalActive })}
      />

      {/* Hero بلون البراند */}
      <Card style={{
        padding: '1.5rem', borderRadius: 24,
        background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--color-secondary-500)', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px' }}>
              {t('services.title')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
              {t('services.heroSubtitle')}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 14, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t('services.stats.totalActive')}</div>
            <div style={{ color: 'var(--color-secondary-500)', fontWeight: 800, fontSize: '1.3rem' }}>{totalActive}</div>
          </div>
        </div>
      </Card>

      {/* كاردات الأربع خدمات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {SERVICE_TYPES.map(type => (
          <ServiceCard
            key={type.key}
            type={type}
            beneficiaries={allBeneficiaries}
            isLoading={isLoading}
            onEdit={(t) => { setEditType(t); setModalOpen(true) }}
          />
        ))}
      </div>

      <ServiceModal
  key={editType?.key || 'none'}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSave={handleSave}
  editItem={editType}
  categories={SERVICE_TYPES.map(t => ({ key: t.key, label: t.key }))}
/>
    </div>
  )
}