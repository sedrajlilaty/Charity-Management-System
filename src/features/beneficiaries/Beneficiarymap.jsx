// src/features/beneficiaries/BeneficiaryMap.jsx
import { useState, useMemo } from 'react'
import {
  MapContainer, TileLayer, CircleMarker,
  Popup, Tooltip, ZoomControl, LayerGroup
} from 'react-leaflet'
import { Badge }       from '../../ui/Badge'
import { SpinnerPage } from '../../ui/Spinner'
import { Users, Filter, AlertCircle, MapPin, Heart, User, BookOpen, GraduationCap } from 'lucide-react'
import PermissionButton from '../../ui/PermissionButton'
import {
  usePendingRequests,
  useOpenAcceptedPatients,
  useOpenAcceptedOrphans,
  useOpenAcceptedSchools,
  useOpenAcceptedUniversities,
} from '../../hooks/useRequests'

// ── إحداثيات المحافظات السورية ────────────────────────────────
const GOVERNORATES = {
  // عربي
  'دمشق':      [33.5102, 36.2913], 'ريف دمشق':  [33.5569, 36.5199],
  'حلب':       [36.2021, 37.1343], 'حمص':        [34.7326, 36.7234],
  'حماة':      [35.1318, 36.7580], 'اللاذقية':   [35.5317, 35.7914],
  'طرطوس':     [34.8919, 35.8866], 'إدلب':       [35.9306, 36.6339],
  'الحسكة':    [36.5012, 40.7425], 'دير الزور':  [35.3357, 40.1410],
  'الرقة':     [35.9520, 39.0100], 'السويداء':   [32.7086, 36.5662],
  'درعا':      [32.6187, 36.1025], 'القنيطرة':   [33.1260, 35.8249],
  // إنجليزي
  'Damascus':       [33.5102, 36.2913], 'Rural Damascus': [33.5569, 36.5199],
  'Aleppo':         [36.2021, 37.1343], 'Homs':           [34.7326, 36.7234],
  'Hama':           [35.1318, 36.7580], 'Latakia':        [35.5317, 35.7914],
  'Tartus':         [34.8919, 35.8866], 'Idlib':          [35.9306, 36.6339],
  'Hasakah':        [36.5012, 40.7425], 'Deir ez-Zor':    [35.3357, 40.1410],
  'Raqqa':          [35.9520, 39.0100], 'Sweida':         [32.7086, 36.5662],
  'Daraa':          [32.6187, 36.1025], 'Quneitra':       [33.1260, 35.8249],
}

function resolveCoords(b) {
  if (!b.governorate) return null
  if (GOVERNORATES[b.governorate]) return { coords: GOVERNORATES[b.governorate], level: 'governorate' }
  for (const [name, coords] of Object.entries(GOVERNORATES)) {
    if (b.governorate.includes(name) || name.includes(b.governorate))
      return { coords, level: 'governorate' }
  }
  return null
}

const CAT_CFG = {
  patient:            { color: '#3b82f6', bg: '#dbeafe', ar: 'مريض',       icon: Heart         },
  orphan:             { color: '#10b981', bg: '#d1fae5', ar: 'يتيم',        icon: User          },
  school_student:     { color: '#f59e0b', bg: '#fef3c7', ar: 'طالب مدرسة', icon: BookOpen      },
  university_student: { color: '#f97316', bg: '#ffedd5', ar: 'طالب جامعة', icon: GraduationCap },
}

function Legend({ catCounts }) {
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 12px', minWidth: 150, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
      <p style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>الفئة</p>
      {catCounts.map(([key, count]) => {
        const c = CAT_CFG[key]
        if (!c) return null
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, display: 'block' }} />
              <span style={{ fontSize: '0.71rem', color: 'var(--text-secondary)' }}>{c.ar}</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function BeneficiaryMap() {
  const [filterGov,    setFilterGov]    = useState('')
  const [filterCat,    setFilterCat]    = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: pending  = [], isLoading: pl  } = usePendingRequests()
  const { data: accPat   = [], isLoading: al1 } = useOpenAcceptedPatients()
  const { data: accOrph  = [], isLoading: al2 } = useOpenAcceptedOrphans()
  const { data: accSch   = [], isLoading: al3 } = useOpenAcceptedSchools()
  const { data: accUni   = [], isLoading: al4 } = useOpenAcceptedUniversities()

  const isLoading = pl || al1 || al2 || al3 || al4

  const all = useMemo(() => {
    const merged = [...pending, ...accPat, ...accOrph, ...accSch, ...accUni]
    return merged.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    )
  }, [pending, accPat, accOrph, accSch, accUni])

  const { mapped, unmapped } = useMemo(() => {
    const m = [], u = []
    all.forEach(b => {
      const result = resolveCoords(b)
      if (result) {
        const [lat, lng] = result.coords
        m.push({
          ...b,
          _coords: [lat + (Math.random() - 0.5) * 0.02, lng + (Math.random() - 0.5) * 0.02],
          _level: result.level,
        })
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
      (!filterGov    || b.governorate === filterGov) &&
      (!filterCat    || b.category    === filterCat) &&
      (!filterStatus || b.status      === filterStatus)
    ), [mapped, filterGov, filterCat, filterStatus])

  if (isLoading) return <SpinnerPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: '#e6f0ee', border: '1px solid #0D524730' }}>
          <Users size={13} color="#0D5247" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247' }}>
            {filtered.length}<span style={{ fontWeight: 400, color: '#6b8a83' }}> / {all.length} مستفيد</span>
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

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input" style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
          <option value="">كل الحالات</option>
          <option value="pending">معلق</option>
          <option value="accepted">مقبول</option>
        </select>

        {(filterGov || filterCat || filterStatus) && (
          <PermissionButton
            onClick={() => { setFilterGov(''); setFilterCat(''); setFilterStatus('') }}
            style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fef2f2', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}
          >
            ✕ مسح الفلاتر
          </PermissionButton>
        )}
      </div>

      {/* Map */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-default)', position: 'relative', height: 480 }}>
        <MapContainer center={[34.802, 38.996]} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ZoomControl position="bottomright" />
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LayerGroup>
            {filtered.map(b => {
              const cat    = CAT_CFG[b.category]
              const color  = cat?.color ?? '#94a3b8'
              const radius = b.status === 'pending' ? 9 : 12
              return (
                <CircleMarker key={b.id} center={b._coords} radius={radius}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.78, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.96}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: 140 }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', marginBottom: 2 }}>{b.full_name}</p>
                      {b.title && <p style={{ fontSize: '0.72rem', color: '#094037', fontWeight: 600, marginBottom: 1 }}>📢 {b.title}</p>}
                      <p style={{ fontSize: '0.72rem', color: '#64748b' }}>📍 {[b.governorate, b.region].filter(Boolean).join(' — ')}</p>
                      {cat && <p style={{ fontSize: '0.7rem', color: cat.color, fontWeight: 700 }}>{cat.ar}</p>}
                    </div>
                  </Tooltip>
                  <Popup maxWidth={240}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: 200 }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', fontSize: '0.95rem', marginBottom: 4 }}>{b.full_name}</p>
                      {b.title && <p style={{ fontSize: '0.78rem', color: '#094037', fontWeight: 600, marginBottom: 4 }}>📢 {b.title}</p>}
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6 }}>{b.phone}</p>
                      <div style={{ background: '#e6f0ee', borderRadius: 7, padding: '6px 9px', marginBottom: 8 }}>
                        {b.governorate && <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D5247', marginBottom: 1 }}>🏛 {b.governorate}</p>}
                        {b.region      && <p style={{ fontSize: '0.73rem', color: '#0D5247' }}>🏘 {b.region}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        {cat && <span style={{ fontSize: '0.69rem', padding: '2px 8px', borderRadius: 99, background: cat.bg, color: cat.color, fontWeight: 600 }}>{cat.ar}</span>}
                        <Badge status={b.status} />
                      </div>
                      {b.category === 'school_student'     && b.academic_grade && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📚 {b.academic_grade} — {b.school_name}</p>}
                      {b.category === 'university_student' && b.academic_year   && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>🎓 {b.academic_year} — {b.support_type === 'laptopsupport' ? 'دعم لابتوب' : 'رسوم دراسية'}</p>}
                      {b.required_amount > 0 && (
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247', marginTop: 4 }}>
                          ${Number(b.required_amount).toLocaleString()} مطلوب
                        </p>
                      )}
                      {b.progress_percentage > 0 && (
                        <p style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                          ✅ {b.progress_percentage}% تم جمعه
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
              {unmapped.length} مستفيد لم يُحدَّد موقعهم على الخريطة
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {unmapped.slice(0, 10).map(b => (
              <span key={b.id} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                {b.full_name}
                {b.governorate && <span style={{ color: 'var(--text-muted)' }}> ({b.governorate})</span>}
              </span>
            ))}
            {unmapped.length > 10 && (
              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 99, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                +{unmapped.length - 10} آخرين
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}