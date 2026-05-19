import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import {
  Handshake,
  Plus,
  Edit2,
  GraduationCap,
  Heart,
  Baby,
  Home,
  ShoppingBasket,
  Trash2,
} from 'lucide-react'
import ServiceModal from './ServiceModal'

// ألوان التصنيفات بنمط الـ Dark Emerald
const CATEGORY_STYLES = {
  education: { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' },
  orphan: { bg: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' },
  medical: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171' },
  food: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399' },
  housing: { bg: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24' },
}

const CATEGORY_ICONS = {
  education: GraduationCap,
  orphan: Baby,
  medical: Heart,
  food: ShoppingBasket,
  housing: Home,
}

const INITIAL_SERVICES = [
  { id: 1, name: 'كفالة اليتيم الشهرية', category: 'orphan', description: 'دعم شهري ثابت للأيتام وأسرهم', amount: 500, beneficiaries: 45, active: true },
  { id: 2, name: 'السلة الغذائية', category: 'food', description: 'توزيع مواد غذائية أساسية', amount: 350, beneficiaries: 200, active: true },
  { id: 3, name: 'مساعدة الإيجار', category: 'housing', description: 'دعم الأسر في سداد إيجار المسكن', amount: 1200, beneficiaries: 30, active: true },
  { id: 4, name: 'الرعاية الطبية', category: 'medical', description: 'تغطية التكاليف الطبية والأدوية', amount: 800, beneficiaries: 18, active: false },
  { id: 5, name: 'المنحة الدراسية', category: 'education', description: 'منح للطلاب المتفوقين', amount: 600, beneficiaries: 55, active: true },
]

export default function Services() {
  const { t } = useTranslation()
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [activeCat, setActiveCat] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const CATEGORIES = [
    { key: 'all', label: t('services.categories.all'), icon: Handshake },
    { key: 'education', label: t('services.categories.education'), icon: GraduationCap },
    { key: 'orphan', label: t('services.categories.orphan'), icon: Baby },
    { key: 'medical', label: t('services.categories.medical'), icon: Heart },
    { key: 'food', label: t('services.categories.food'), icon: ShoppingBasket },
    { key: 'housing', label: t('services.categories.housing'), icon: Home },
  ]

  // دالة الحفظ (إضافة أو تعديل)
  const handleSave = (form) => {
    if (editItem) {
      // حالة التعديل
      setServices((prev) =>
        prev.map((s) => (s.id === editItem.id ? { ...s, ...form } : s))
      )
    } else {
      // حالة الإضافة
      const newService = {
        ...form,
        id: Date.now(),
        beneficiaries: 0,
        active: true,
      }
      setServices((prev) => [...prev, newService])
    }
    setModalOpen(false) // إغلاق المودال بعد الحفظ
  }

  const handleDelete = (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const filtered = activeCat === 'all' 
    ? services 
    : services.filter((s) => s.category === activeCat)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle', { count: services.length })}>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          style={{
            background: 'var(--color-secondary-500)', color: '#111', border: 'none',
            padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
          }}
        >
          <Plus size={18} /> {t('services.addBtn')}
        </button>
      </PageHeader>

      {/* Stats Hero - نمط الداشبورد */}
      <Card style={{
        padding: '1.5rem', borderRadius: '24px',
  background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)', 
  color:'#fff',       border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'var(--text-accent)', fontSize: '1.2rem', fontWeight: 800 }}>{t('services.title')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>إدارة البرامج والخدمات المجتمعية</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', display: 'block' }}>إجمالي المستفيدين</span>
                <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>{services.reduce((a, b) => a + b.beneficiaries, 0)}</span>
             </div>
          </div>
        </div>
      </Card>

      {/* Categories Filter */}
      <div style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '8px',
        background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-subtle)'
      }}>
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const active = activeCat === c.key
          return (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                borderRadius: '10px', border: 'none', cursor: 'pointer', transition: '0.3s',
                background: active ? 'var(--color-primary-500)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)', fontWeight: 600
              }}
            >
              <Icon size={16} /> {c.label}
            </button>
          )
        })}
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((s) => {
          const style = CATEGORY_STYLES[s.category] || CATEGORY_STYLES.food
          const Icon = CATEGORY_ICONS[s.category] || Handshake
          return (
            <Card key={s.id} style={{
              borderRadius: '20px', background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)', padding: '1.5rem',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={style.color} />
                </div>
                <Badge status={s.active ? 'active' : 'inactive'} />
              </div>

              <h3 style={{ color: 'var(--text-accent)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{s.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem', minHeight: '45px' }}>{s.description}</p>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block' }}>{t('services.amount')}</span>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.amount} ريال</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditItem(s); setModalOpen(true); }} style={actionButtonStyle}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{ ...actionButtonStyle, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
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

const actionButtonStyle = {
  width: '34px', height: '34px', borderRadius: '8px', border: 'none',
  background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}