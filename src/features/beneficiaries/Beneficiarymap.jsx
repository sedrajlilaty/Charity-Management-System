// features/beneficiaries/BeneficiaryMap.jsx
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  MapContainer, TileLayer, CircleMarker,
  Popup, Tooltip, ZoomControl, LayerGroup
} from 'react-leaflet'
import { beneficiariesService } from '../../service/ServiceLayer'
import { Badge } from '../../ui/Badge'
import { SpinnerPage } from '../../ui/Spinner'
import { Users, Filter, AlertCircle, MapPin, Heart, User, BookOpen, GraduationCap } from 'lucide-react'
import PermissionButton from '../../ui/PermissionButton'

// ─── إحداثيات المحافظات السورية ──────────────────────────────────────────────
const GOVERNORATES = {
  'دمشق':       [33.5102, 36.2913],
  'ريف دمشق':   [33.5569, 36.5199],
  'حلب':        [36.2021, 37.1343],
  'حمص':        [34.7326, 36.7234],
  'حماة':       [35.1318, 36.7580],
  'اللاذقية':   [35.5317, 35.7914],
  'طرطوس':      [34.8919, 35.8866],
  'إدلب':       [35.9306, 36.6339],
  'الحسكة':     [36.5012, 40.7425],
  'دير الزور':  [35.3357, 40.1410],
  'الرقة':      [35.9520, 39.0100],
  'السويداء':   [32.7086, 36.5662],
  'درعا':       [32.6187, 36.1025],
  'القنيطرة':   [33.1260, 35.8249],
}

const REGIONS = {
  'المزة': [33.4986, 36.2534], 'كفرسوسة': [33.4923, 36.2789], 'المالكية': [33.5134, 36.2901],
  'الميدان': [33.4998, 36.3123], 'القابون': [33.5401, 36.3312], 'برزة': [33.5534, 36.3056],
  'المرجة': [33.5098, 36.3041], 'باب توما': [33.5112, 36.3189], 'جرمانا': [33.4789, 36.3601],
  'عدرا': [33.6012, 36.5134], 'الزبداني': [33.7234, 36.0956], 'دوما': [33.5723, 36.4012],
  'حرستا': [33.5601, 36.3789], 'معضمية الشام': [33.4523, 36.2234], 'داريا': [33.4601, 36.2456],
  'قدسيا': [33.5423, 36.2345],
  'الجميلية': [36.2234, 37.1567], 'الشهباء': [36.2345, 37.1234], 'العزيزية': [36.2012, 37.1678],
  'الحمدانية': [36.1923, 37.0956], 'السليمانية': [36.2156, 37.1345], 'الراشدين': [36.1789, 37.0712],
  'حندرات': [36.2789, 37.1923], 'الفرقان': [36.2567, 37.1456], 'صلاح الدين': [36.1934, 37.1234],
  'الكلاسة': [36.2178, 37.1589], 'باب الحديد': [36.2289, 37.1623], 'باب النصر': [36.2234, 37.1712],
  'الأنصاري': [36.1856, 37.1389], 'الشيخ مقصود': [36.2512, 37.1234], 'عين التل': [36.3123, 37.1789],
  'الوعر': [34.7412, 36.6912], 'الحمرا': [34.7234, 36.7045], 'الزهراء': [34.7156, 36.7234],
  'البياضة': [34.7456, 36.7412], 'الخالدية': [34.7312, 36.7123], 'الرستن': [34.9234, 36.7301],
  'تلبيسة': [34.8345, 36.7134], 'قارة': [34.1789, 36.7523], 'تدمر': [34.5601, 38.2789],
  'طيبة الإمام': [35.3234, 36.8012], 'اللطامنة': [35.2456, 36.6789], 'صوران': [35.1834, 36.8234],
  'مورك': [35.2789, 36.7345],
  'جبلة': [35.3623, 35.9234], 'القرداحة': [35.6823, 36.1123], 'الحفة': [35.6234, 36.0345],
  'صلنفة': [35.5823, 36.1789],
  'بانياس': [35.1823, 35.9345], 'صافيتا': [34.8234, 36.1123], 'الشيخ بدر': [34.9512, 36.1056],
  'الدريكيش': [34.8901, 36.1678],
  'معرة النعمان': [35.6423, 36.6745], 'سراقب': [35.8623, 36.8034], 'أريحا': [35.8234, 36.6012],
  'جسر الشغور': [35.8178, 36.3234], 'حارم': [36.1789, 36.5123], 'كفرنبل': [35.6134, 36.5623],
  'القامشلي': [37.0523, 41.2312], 'رأس العين': [36.8623, 40.0712], 'الشدادي': [36.0534, 40.7123],
  'البوكمال': [34.4534, 40.9423], 'الميادين': [35.0123, 40.4523],
  'تل أبيض': [36.6923, 38.9612], 'الثورة': [35.9823, 38.5412],
  'نوى': [32.9012, 36.0534], 'الصنمين': [33.0623, 36.1834], 'إنخل': [32.7456, 36.0323], 'بصرى الشام': [32.5134, 36.4856],
  'شهبا': [32.8623, 36.6934], 'صلخد': [32.4923, 36.7123],
  'فيق': [32.9234, 35.8623], 'البعث': [33.1734, 35.9534],
}

function resolveCoords(b) {
  if (b.region) {
    for (const [name, coords] of Object.entries(REGIONS)) {
      if (b.region.includes(name) || name.includes(b.region)) return { coords, level: 'region' }
    }
  }
  if (b.governorate) {
    for (const [name, coords] of Object.entries(GOVERNORATES)) {
      if (b.governorate.includes(name) || name.includes(b.governorate)) return { coords, level: 'governorate' }
    }
  }
  if (b.address) {
    for (const [name, coords] of Object.entries({ ...GOVERNORATES, ...REGIONS })) {
      if (b.address.includes(name)) return { coords, level: 'address' }
    }
  }
  return null
}

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CFG = {
  patient:            { color: '#3b82f6', bg: '#dbeafe', ar: 'مريض',        icon: Heart         },
  orphan:             { color: '#10b981', bg: '#d1fae5', ar: 'يتيم',         icon: User          },
  school_student:     { color: '#f59e0b', bg: '#fef3c7', ar: 'طالب مدرسة',  icon: BookOpen      },
  university_student: { color: '#f97316', bg: '#ffedd5', ar: 'طالب جامعة',  icon: GraduationCap },
}

const PRI_RADIUS = { high: 14, medium: 10, low: 7 }
const PRI_CFG = {
  high:   { ar: 'عالية',   color: '#dc2626' },
  medium: { ar: 'متوسطة',  color: '#d97706' },
  low:    { ar: 'منخفضة',  color: '#94a3b8' },
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ catCounts }) {
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 12px', minWidth: 150, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
      <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>الفئة</p>
      {catCounts.map(([key, count]) => {
        const c = CAT_CFG[key]
        if (!c) return null
        const Icon = c.icon
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.71rem', color: 'var(--text-secondary)' }}>{c.ar}</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
          </div>
        )
      })}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8 }}>
        <p style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: 5 }}>● حجم الدائرة = الأولوية</p>
        {Object.entries(PRI_CFG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ width: PRI_RADIUS[key], height: PRI_RADIUS[key], borderRadius: '50%', background: cfg.color, display: 'block', flexShrink: 0, opacity: 0.7 }} />
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{cfg.ar}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BeneficiaryMap() {
  const { i18n } = useTranslation()
  const isAr = i18n.language?.startsWith('ar')

  const [filterGov, setFilterGov] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterPri, setFilterPri] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries-map'],
    queryFn:  () => beneficiariesService.getList({ page: 1, limit: 500 }),
  })

  const all = data?.data ?? []

  const { mapped, unmapped } = useMemo(() => {
    const m = [], u = []
    all.forEach(b => {
      const result = resolveCoords(b)
      if (result) {
        const [lat, lng] = result.coords
        m.push({ ...b, _coords: [lat + (Math.random() - 0.5) * 0.008, lng + (Math.random() - 0.5) * 0.008], _level: result.level })
      } else {
        u.push(b)
      }
    })
    return { mapped: m, unmapped: u }
  }, [all])

  const govList = useMemo(() => {
    const s = new Set()
    all.forEach(b => { if (b.governorate) s.add(b.governorate) })
    return [...s].sort()
  }, [all])

  const catCounts = useMemo(() => {
    const c = {}
    all.forEach(b => { c[b.category] = (c[b.category] ?? 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [all])

  const filtered = useMemo(() =>
    mapped.filter(b =>
      (!filterGov || b.governorate === filterGov) &&
      (!filterCat || b.category    === filterCat) &&
      (!filterPri || b.priority    === filterPri)
    ), [mapped, filterGov, filterCat, filterPri])

  if (isLoading) return <SpinnerPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Filters bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: '#e6f0ee', border: '1px solid #0D524730' }}>
          <Users size={13} color="#0D5247" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247' }}>
            {filtered.length}
            <span style={{ fontWeight: 400, color: '#6b8a83' }}> / {all.length} مستفيد</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={13} color="var(--text-muted)" />
          <select value={filterGov} onChange={e => setFilterGov(e.target.value)} className="input" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
            <option value="">كل المحافظات</option>
            {govList.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Filter size={13} color="var(--text-muted)" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
            <option value="">كل الفئات</option>
            {Object.entries(CAT_CFG).map(([key, c]) => (
              <option key={key} value={key}>{c.ar}</option>
            ))}
          </select>
        </div>

        <select value={filterPri} onChange={e => setFilterPri(e.target.value)} className="input" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
          <option value="">كل الأولويات</option>
          {Object.entries(PRI_CFG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.ar}</option>
          ))}
        </select>

        {(filterGov || filterCat || filterPri) && (
          <PermissionButton onClick={() => { setFilterGov(''); setFilterCat(''); setFilterPri('') }}
            style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fef2f2', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
            ✕ مسح الفلاتر
          </PermissionButton>
        )}
      </div>

      {/* Map */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-default)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'relative', height: 480 }}>
        <MapContainer center={[34.802, 38.996]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ZoomControl position="bottomright" />
          <TileLayer attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <LayerGroup>
            {filtered.map(b => {
              const cat    = CAT_CFG[b.category]
              const color  = cat?.color ?? '#94a3b8'
              const radius = PRI_RADIUS[b.priority] ?? 9

              return (
                <CircleMarker
                  key={b.id}
                  center={b._coords}
                  radius={radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.78, weight: b._level === 'governorate' ? 2 : 1.5, dashArray: b._level === 'governorate' ? '4,3' : undefined }}
                >
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.96}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: 140 }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', marginBottom: 2, fontSize: '0.88rem' }}>{b.full_name}</p>
                      {b.title && <p style={{ fontSize: '0.72rem', color: '#094037', fontWeight: 600, marginBottom: 1 }}>📢 {b.title}</p>}
                      {b.governorate && (
                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 1 }}>
                          📍 {[b.governorate, b.region].filter(Boolean).join(' — ')}
                        </p>
                      )}
                      {cat && <p style={{ fontSize: '0.7rem', color: cat.color, fontWeight: 700 }}>{cat.ar}</p>}
                    </div>
                  </Tooltip>

                  <Popup maxWidth={240}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: 200 }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', fontSize: '0.95rem', marginBottom: 4 }}>{b.full_name}</p>
                      {b.title && <p style={{ fontSize: '0.78rem', color: '#094037', fontWeight: 600, marginBottom: 4 }}>📢 {b.title}</p>}
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, direction: 'ltr' }}>{b.phone}</p>

                      <div style={{ background: '#e6f0ee', borderRadius: 7, padding: '6px 9px', marginBottom: 8 }}>
                        {b.governorate && <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D5247', marginBottom: 1 }}>🏛 {b.governorate}</p>}
                        {b.region      && <p style={{ fontSize: '0.73rem', color: '#0D5247', marginBottom: 1 }}>🏘 {b.region}</p>}
                        {b.address     && <p style={{ fontSize: '0.7rem', color: '#6b8a83' }}>📍 {b.address}</p>}
                      </div>

                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        {cat && (
                          <span style={{ fontSize: '0.69rem', padding: '2px 8px', borderRadius: 99, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.ar}</span>
                        )}
                        {b.priority && (
                          <span style={{ fontSize: '0.69rem', padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: PRI_CFG[b.priority]?.color ?? '#64748b', fontWeight: 600 }}>
                            {PRI_CFG[b.priority]?.ar}
                          </span>
                        )}
                        <Badge status={b.status} />
                      </div>

                      {/* Category-specific info */}
                      {b.category === 'school_student'     && b.academic_grade && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📚 {b.academic_grade} — {b.school_name}</p>}
                      {b.category === 'university_student' && b.academic_year   && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>🎓 {b.academic_year} — {b.support_type === 'laptop_support' ? 'دعم لابتوب' : 'رسوم دراسية'}</p>}
                      {b.required_amount > 0 && (
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247', marginTop: 4 }}>
                          {b.required_amount.toLocaleString('ar-SY')} ل.س مطلوب
                        </p>
                      )}

                      {b._level === 'governorate' && (
                        <p style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: 5, borderTop: '1px dashed #e5e7eb', paddingTop: 4 }}>
                          ⚠ موضوع على مستوى المحافظة
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </LayerGroup>

          <Legend catCounts={catCounts} />
        </MapContainer>
      </div>

      {/* Unmapped */}
      {unmapped.length > 0 && (
        <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <AlertCircle size={14} color="#a16207" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {unmapped.length} مستفيد لم يُحدَّد موقعهم
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {unmapped.slice(0, 10).map(b => (
              <span key={b.id} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                {b.full_name}
                {(b.governorate || b.region) && <span style={{ color: 'var(--text-muted)' }}> ({[b.governorate, b.region].filter(Boolean).join(' / ')})</span>}
              </span>
            ))}
            {unmapped.length > 10 && (
              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                +{unmapped.length - 10} آخرين
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>
            💡 تأكد من وجود حقل governorate (المحافظة) أو region (المنطقة) في بيانات المستفيد
          </p>
        </div>
      )}
    </div>
  )
}