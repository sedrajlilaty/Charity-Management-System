import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { useState } from 'react'
import { Handshake, Plus, Edit2, GraduationCap, Heart, Baby, Home, ShoppingBasket, Trash2 } from 'lucide-react'
import {  Badge } from '../../ui/Badge'
import Modal, { FormRow } from '../../ui/Modal'

const CATEGORIES = [
  { key:'all',       label:'All',        icon:Handshake,     bg:'#f3f4f6', color:'#4b5563' },
  { key:'education', label:'Education',     icon:GraduationCap, bg:'#dbeafe', color:'#1d4ed8' },
  { key:'orphan',    label:'Orphans',  icon:Baby,          bg:'#fce7f3', color:'#be185d' },
  { key:'medical',   label:'Medical',        icon:Heart,         bg:'#fee2e2', color:'#dc2626' },
  { key:'food',      label:'Food',      icon:ShoppingBasket,bg:'#dcfce7', color:'#16a34a' },
  { key:'housing',   label:'Housing',       icon:Home,          bg:'#fef9c3', color:'#a16207' },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.filter(c => c.key !== 'all').map(c => [c.key, c]))

const INITIAL = [
  { id:1, name:'كفالة اليتيم الشهرية',  category:'orphan',    description:'دعم شهري ثابت للأيتام وأسرهم وتأمين احتياجاتهم', amount:500,  beneficiaries:45,  active:true  },
  { id:2, name:'السلة الغذائية',         category:'food',      description:'توزيع مواد غذائية أساسية على الأسر المحتاجة',     amount:350,  beneficiaries:200, active:true  },
  { id:3, name:'مساعدة الإيجار',        category:'housing',   description:'دعم الأسر في سداد إيجار المسكن شهرياً',            amount:1200, beneficiaries:30,  active:true  },
  { id:4, name:'الرعاية الطبية',        category:'medical',   description:'تغطية التكاليف الطبية والأدوية للمحتاجين',         amount:800,  beneficiaries:18,  active:false },
  { id:5, name:'المنحة الدراسية',       category:'education', description:'منح للطلاب المتفوقين وتوفير المستلزمات الدراسية', amount:600,  beneficiaries:55,  active:true  },
  { id:6, name:'الكشف الطبي المجاني',  category:'medical',   description:'جلسات طبية مجانية وتوعية صحية للمستفيدين',        amount:0,    beneficiaries:120, active:true  },
]

const EMPTY_FORM = { name:'', category:'orphan', description:'', amount:'', active:true }

/* ── Service Modal ── */
function ServiceModal({ open, onClose, onSave, editItem }) {
  const [form, setForm] = useState(editItem ? { ...editItem, amount: String(editItem.amount) } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('اسم الخدمة مطلوب'); return }
    setSaving(true)
    await onSave({ ...form, amount: Number(form.amount) || 0 })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
      footer={
        <>
          <button onClick={onClose} className="btn-outline">إلغاء</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ minWidth:'120px' }}>
            {saving && <span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>}
            {editItem ? 'حفظ التغييرات' : 'إضافة الخدمة'}
          </button>
        </>
      }
    >
      <FormRow label="اسم الخدمة" required>
        <input className="input" placeholder="مثال: كفالة اليتيم" value={form.name} onChange={e => set('name', e.target.value)}/>
        {error && <p style={{ fontSize:'0.72rem', color:'#ef4444', marginTop:'4px' }}>{error}</p>}
      </FormRow>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <FormRow label="التصنيف">
          <select className="input" style={{ fontSize:'0.875rem' }} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.filter(c => c.key !== 'all').map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </FormRow>
        <FormRow label="قيمة الخدمة (ر.س)">
          <input className="input" type="number" min={0} placeholder="500"
            value={form.amount} onChange={e => set('amount', e.target.value)} dir="ltr"/>
        </FormRow>
      </div>

      <FormRow label="الوصف">
        <textarea className="input" rows={3} style={{ resize:'vertical' }} placeholder="وصف مختصر للخدمة..."
          value={form.description} onChange={e => set('description', e.target.value)}/>
      </FormRow>

      <FormRow label="الحالة">
        <div style={{ display:'flex', gap:'10px' }}>
          {[{ v:true, l:'نشطة' }, { v:false, l:'موقوفة' }].map(opt => (
            <label key={String(opt.v)} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'0.875rem', color:'var(--text-primary)' }}>
              <input type="radio" checked={form.active === opt.v} onChange={() => set('active', opt.v)} style={{ accentColor:'#0D5247' }}/>
              {opt.l}
            </label>
          ))}
        </div>
      </FormRow>
    </Modal>
  )
}

/* ── Service Card ── */
function ServiceCard({ service, onEdit, onDelete }) {
  const cat = CAT_MAP[service.category]
  const Icon = cat?.icon ?? Handshake

  return (
    <Card style={{ transition:'box-shadow 0.2s', backgroundColor: '#e6f0ee' }}>
      <div style={{ padding:'1.1rem' }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
          <div style={{ padding:'10px', borderRadius:'12px', background: cat?.bg ?? '#f3f4f6' }}>
            <Icon size={20} color={cat?.color ?? '#4b5563'}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <Badge status={service.active ? 'active' : 'inactive'} style={{ backgroundColor: service.active ? '#835500' : '#0D5247', color: '#fff' }} />
            <button onClick={() => onEdit(service)}
              style={{ width:'28px', height:'28px', borderRadius:'7px', border:'1px solid var(--border-default)', background:'#835500', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Edit2 size={13}/>
            </button>
            <button onClick={() => onDelete(service.id)}
              style={{ width:'28px', height:'28px', borderRadius:'7px', border:'1px solid #fecaca', background:'#835500', color:'#fecaca', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Trash2 size={13}/>
            </button>
          </div>
        </div>

        {/* Info */}
        <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'4px' }}>{service.name}</h3>
        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'12px' }}>{service.description}</p>

        {/* Category tag */}
        <span style={{ display:'inline-block', fontSize:'0.7rem', fontWeight:600, padding:'3px 10px', borderRadius:'99px', background: cat?.bg ?? '#f3f4f6', color: cat?.color ?? '#4b5563', marginBottom:'12px' }}>
          {cat?.label ?? service.category}
        </span>

        {/* Stats */}
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid var(--border-default)' }}>
          <div>
            <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:'2px' }}>Service amount</p>
            <p style={{ fontSize:'1rem', fontWeight:800, color:'#0D5247' }}>
              {service.amount > 0 ? `${service.amount.toLocaleString('en-US')} SAR` : 'Free'}
            </p>
          </div>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:'2px' }}>Beneficiaries</p>
            <p style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>{service.beneficiaries}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ── Main Page ── */
export default function Services() {
  const [services,   setServices]   = useState(INITIAL)
  const [activeCat,  setActiveCat]  = useState('all')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)

  const filtered = activeCat === 'all' ? services : services.filter(s => s.category === activeCat)

  /* CRUD حقيقي على الـ state */
  const handleSave = (form) => {
    if (editItem) {
      setServices(prev => prev.map(s => s.id === editItem.id ? { ...s, ...form } : s))
    } else {
      setServices(prev => [...prev, { ...form, id: Date.now(), beneficiaries: 0 }])
    }
  }

  const handleDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const openAdd  = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (s) => { setEditItem(s);   setModalOpen(true) }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <PageHeader title="Services & Programs" subtitle={`${services.length} services`}>
        <button className="btn-primary" onClick={openAdd}><Plus size={15}/>New service</button>
      </PageHeader>

      {/* Category Filter Pills */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {CATEGORIES.map(c => {
          const Icon = c.icon
          const active = activeCat === c.key
          return (
            <button key={c.key} onClick={() => setActiveCat(c.key)}
              style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'6px 14px', borderRadius:'99px', fontSize:'0.8rem', fontWeight:600,
                border: active ? '2px solid #0D5247' : '1px solid var(--border-default)',
                background: active ? '#0D5247' : 'var(--bg-surface)',
                color: active ? '#fff' : 'var(--text-secondary)',
                cursor:'pointer', fontFamily:'Cairo,sans-serif', transition:'all 0.15s',
              }}>
              <Icon size={13}/>
              {c.label}
              <span style={{ fontSize:'0.7rem', fontWeight:700, background: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-muted)', padding:'1px 6px', borderRadius:'99px' }}>
                {c.key === 'all' ? services.length : services.filter(s => s.category === c.key).length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
            <Handshake size={36} style={{ margin:'0 auto 12px', opacity:0.3 }}/>
            <p style={{ fontWeight:500 }}>No services in this category.</p>
            <button className="btn-primary" style={{ marginTop:'16px' }} onClick={openAdd}><Plus size={14}/>Add service</button>
          </div>
        </Card>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
          {filtered.map(s => (
            <ServiceCard key={s.id} service={s} onEdit={openEdit} onDelete={handleDelete}/>
          ))}
        </div>
      )}

      <ServiceModal key={`${editItem?.id ?? 'new'}-${modalOpen}`} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editItem={editItem}/>
    </div>
  )
}
