// features/services/Services.jsx  (نسخة مبسطة)
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Handshake, Plus, Edit2, GraduationCap, Heart,
  Baby, Home, ShoppingBasket, Trash2, CheckCircle2, Clock,
} from 'lucide-react'
import { beneficiariesService } from '../../service/ServiceLayer'
import { PageHeader }    from '../../ui/PageHeader'
import { Card }          from '../../ui/Card'
import { Badge }         from '../../ui/Badge'
import PermissionButton  from '../../ui/PermissionButton'
import ServiceModal      from './ServiceModal'
import { formatCurrency } from '../../utlis/helper'

// ── تعريف التصنيفات ─────────────────────────────────────────
const CATEGORY_STYLES = {
  education: { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa' },
  orphan:    { bg: 'rgba(236,72,153,0.1)',  color: '#f472b6' },
  medical:   { bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
  food:      { bg: 'rgba(16,185,129,0.1)',  color: '#34d399' },
  housing:   { bg: 'rgba(234,179,8,0.1)',   color: '#fbbf24' },
}

const CATEGORY_ICONS = {
  education: GraduationCap,
  orphan:    Baby,
  medical:   Heart,
  food:      ShoppingBasket,
  housing:   Home,
}

// ✅ ربط تصنيفات الخدمات بتصنيفات المستفيدين
const SERVICE_TO_BENEFICIARY = {
  education: ['educational'],
  orphan:    ['orphan'],
  medical:   ['medical'],
  food:      ['poor'],
  housing:   ['widow', 'poor'],
}

const INITIAL_SERVICES = [
  { id: 1, name: 'كفالة اليتيم الشهرية',  category: 'orphan',    description: 'دعم شهري ثابت للأيتام وأسرهم',           amount: 500,  active: true  },
  { id: 2, name: 'السلة الغذائية',         category: 'food',      description: 'توزيع مواد غذائية أساسية',               amount: 350,  active: true  },
  { id: 3, name: 'مساعدة الإيجار',         category: 'housing',   description: 'دعم الأسر في سداد إيجار المسكن',          amount: 1200, active: true  },
  { id: 4, name: 'الرعاية الطبية',         category: 'medical',   description: 'تغطية التكاليف الطبية والأدوية',           amount: 800,  active: false },
  { id: 5, name: 'المنحة الدراسية',        category: 'education', description: 'منح للطلاب المتفوقين المحتاجين',          amount: 600,  active: true  },
]

const actionBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px', borderRadius: 10, cursor: 'pointer',
  fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.82rem', border: 'none',
}

// ── بطاقة الخدمة ────────────────────────────────────────────
function ServiceCard({ s, allBeneficiaries, isLoading, onEdit, onDelete }) {
  const style = CATEGORY_STYLES[s.category] || CATEGORY_STYLES.food
  const Icon  = CATEGORY_ICONS[s.category]  || Handshake

  const relatedCategories = SERVICE_TO_BENEFICIARY[s.category] || []
  const related = (allBeneficiaries || []).filter(b => relatedCategories.includes(b.category))

  const benefited     = related.filter(b => b.status === 'active')
  const benefitedCount = benefited.length
  const pendingCount   = related.filter(b => b.status === 'pending').length

  // ✅ في كل الخدمات عدا كفالة اليتيم، القيمة المعروضة = إجمالي الدعم الفعلي للحالات المستفيدة
  const totalSupport = benefited.reduce((sum, b) => sum + (b.monthlySupport || 0), 0)
  const displayAmount = s.category === 'orphan' ? s.amount : totalSupport

  return (
    <Card style={{
      borderRadius: 20, background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      padding: '1.25rem', display: 'flex', flexDirection: 'column',
    }}>
      {/* رأس البطاقة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={style.color} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</h3>
          </div>
        </div>
        <Badge status={s.active ? 'active' : 'inactive'} />
      </div>

      {/* الوصف */}
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {s.description}
      </p>

      {/* المبلغ - يظهر اسمه "قيمة الكفالة الشهرية" لخدمة كفالة اليتيم فقط */}
      <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--bg-muted)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {s.category === 'orphan' ? 'قيمة الكفالة الشهرية' : 'إجمالي الدعم الحالي'}
        </span>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {formatCurrency(displayAmount)}
        </span>
      </div>

      {/* إحصائيات الحالات */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
        <div style={{
          flex: 1, padding: '10px 12px', borderRadius: 10,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>حالات مستفيدة</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {isLoading ? '...' : benefitedCount}
          </span>
        </div>

        <div style={{
          flex: 1, padding: '10px 12px', borderRadius: 10,
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="#eab308" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>قيد الانتظار</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {isLoading ? '...' : pendingCount}
          </span>
        </div>
      </div>

      {/* إجراءات */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <PermissionButton
          permission="services.edit"
          onClick={() => onEdit(s)}
          style={{ ...actionBtn, flex: 1, background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
        >
          <Edit2 size={14} /> تعديل
        </PermissionButton>
        <PermissionButton
          permission="services.delete"
          onClick={() => onDelete(s.id)}
          style={{ ...actionBtn, width: 38, background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          <Trash2 size={15} />
        </PermissionButton>
      </div>
    </Card>
  )
}

// ── الصفحة الرئيسية ─────────────────────────────────────────
export default function Services() {
  const { t }  = useTranslation()
  const [services,   setServices]  = useState(INITIAL_SERVICES)
  const [activeCat,  setActiveCat] = useState('all')
  const [modalOpen,  setModalOpen] = useState(false)
  const [editItem,   setEditItem]  = useState(null)

  const CATEGORIES = [
    { key: 'all',       label: t('services.categories.all'),       icon: Handshake    },
    { key: 'education', label: t('services.categories.education'), icon: GraduationCap },
    { key: 'orphan',    label: t('services.categories.orphan'),    icon: Baby          },
    { key: 'medical',   label: t('services.categories.medical'),   icon: Heart         },
    { key: 'food',      label: t('services.categories.food'),      icon: ShoppingBasket},
    { key: 'housing',   label: t('services.categories.housing'),   icon: Home          },
  ]

  // ✅ جلب جميع المستفيدين (نشطين + قيد الانتظار) لحساب الإحصائيات
  const { data: beneficiariesData, isLoading } = useQuery({
    queryKey: ['beneficiaries-all-statuses'],
    queryFn:  () => beneficiariesService.getList({ limit: 1000 }),
    staleTime: 1000 * 60 * 2,
  })
  const allBeneficiaries = beneficiariesData?.data ?? []

  const handleSave = (form) => {
    if (editItem) setServices(p => p.map(s => s.id === editItem.id ? { ...s, ...form } : s))
    else          setServices(p => [...p, { ...form, id: Date.now(), active: true }])
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm(t('common.confirmDelete'))) setServices(p => p.filter(s => s.id !== id))
  }

  const filtered = activeCat === 'all' ? services : services.filter(s => s.category === activeCat)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* Header */}
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle', { count: services.length })}>
        <PermissionButton
          permission="services.add"
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          style={{ background: 'var(--color-secondary-500)', color: '#111', border: 'none', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold', fontFamily: 'Cairo, sans-serif' }}
        >
          <Plus size={18} /> {t('services.addBtn')}
        </PermissionButton>
      </PageHeader>

      {/* Stats Hero */}
      <Card style={{
        padding: '1.5rem', borderRadius: 24,
        background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
        color: '#fff', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#eab308', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px' }}>{t('services.title')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0 }}>إدارة البرامج والخدمات المجتمعية</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', display: 'block' }}>الخدمات</span>
            <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>{services.length}</span>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 8, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const active = activeCat === key
          return (
            <button
              key={key}
              onClick={() => setActiveCat(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 10, border: 'none', cursor: 'pointer', transition: '0.2s',
                background: active ? 'var(--color-primary-500)' : 'transparent',
                color:      active ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif',
              }}
            >
              <Icon size={15} /> {label}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.map(s => (
          <ServiceCard
            key={s.id}
            s={s}
            allBeneficiaries={allBeneficiaries}
            isLoading={isLoading}
            onEdit={(item) => { setEditItem(item); setModalOpen(true) }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ServiceModal
        key={editItem?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editItem={editItem}
        categories={CATEGORIES.filter(c => c.key !== 'all')}
      />
    </div>
  )
}