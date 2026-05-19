/**
 * BeneficiaryMap — خريطة المستفيدين السورية
 * تعتمد على حقلَي governorate + region من كائن المستفيد
 *
 * npm install leaflet react-leaflet
 * import 'leaflet/dist/leaflet.css'  ← في main.jsx
 */

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
import { Users, Filter, AlertCircle, MapPin } from 'lucide-react'

// ─── إحداثيات المحافظات السورية ───────────────────────────────────────────────
const GOVERNORATES = {
  'دمشق':         [33.5102, 36.2913],
  'ريف دمشق':     [33.5569, 36.5199],
  'حلب':          [36.2021, 37.1343],
  'حمص':          [34.7326, 36.7234],
  'حماة':         [35.1318, 36.7580],
  'اللاذقية':     [35.5317, 35.7914],
  'طرطوس':        [34.8919, 35.8866],
  'إدلب':         [35.9306, 36.6339],
  'الحسكة':       [36.5012, 40.7425],
  'دير الزور':    [35.3357, 40.1410],
  'الرقة':        [35.9520, 39.0100],
  'السويداء':     [32.7086, 36.5662],
  'درعا':         [32.6187, 36.1025],
  'القنيطرة':     [33.1260, 35.8249],
}

// ─── أحياء ومناطق تفصيلية لكل محافظة ────────────────────────────────────────
const REGIONS = {
  // دمشق
  'المزة':          [33.4986, 36.2534],
  'كفرسوسة':        [33.4923, 36.2789],
  'المالكية':       [33.5134, 36.2901],
  'الميدان':        [33.4998, 36.3123],
  'القابون':        [33.5401, 36.3312],
  'برزة':           [33.5534, 36.3056],
  'المرجة':         [33.5098, 36.3041],
  'باب توما':       [33.5112, 36.3189],
  'جرمانا':         [33.4789, 36.3601],
  'عدرا':           [33.6012, 36.5134],
  'الزبداني':       [33.7234, 36.0956],
  'دوما':           [33.5723, 36.4012],
  'حرستا':          [33.5601, 36.3789],
  'معضمية الشام':   [33.4523, 36.2234],
  'داريا':          [33.4601, 36.2456],
  'قدسيا':          [33.5423, 36.2345],

  // حلب
  'الجميلية':       [36.2234, 37.1567],
  'الشهباء':        [36.2345, 37.1234],
  'العزيزية':       [36.2012, 37.1678],
  'الحمدانية':      [36.1923, 37.0956],
  'السليمانية':     [36.2156, 37.1345],
  'الراشدين':       [36.1789, 37.0712],
  'حندرات':         [36.2789, 37.1923],
  'الفرقان':        [36.2567, 37.1456],
  'صلاح الدين':     [36.1934, 37.1234],
  'الكلاسة':        [36.2178, 37.1589],
  'باب الحديد':     [36.2289, 37.1623],
  'باب النصر':      [36.2234, 37.1712],
  'الأنصاري':       [36.1856, 37.1389],
  'الشيخ مقصود':   [36.2512, 37.1234],
  'عين التل':       [36.3123, 37.1789],

  // حمص
  'الوعر':          [34.7412, 36.6912],
  'الحمرا':         [34.7234, 36.7045],
  'الزهراء':        [34.7156, 36.7234],
  'البياضة':        [34.7456, 36.7412],
  'الخالدية':       [34.7312, 36.7123],
  'الرستن':         [34.9234, 36.7301],
  'تلبيسة':         [34.8345, 36.7134],
  'قارة':           [34.1789, 36.7523],
  'تدمر':           [34.5601, 38.2789],

  // حماة
  'طيبة الإمام':    [35.3234, 36.8012],
  'مضايا':          [33.7012, 36.0834],
  'اللطامنة':       [35.2456, 36.6789],
  'صوران':          [35.1834, 36.8234],
  'مورك':           [35.2789, 36.7345],

  // اللاذقية
  'جبلة':           [35.3623, 35.9234],
  'القرداحة':       [35.6823, 36.1123],
  'الحفة':          [35.6234, 36.0345],
  'صلنفة':          [35.5823, 36.1789],

  // طرطوس
  'بانياس':         [35.1823, 35.9345],
  'صافيتا':         [34.8234, 36.1123],
  'الشيخ بدر':      [34.9512, 36.1056],
  'الدريكيش':       [34.8901, 36.1678],

  // إدلب
  'معرة النعمان':   [35.6423, 36.6745],
  'سراقب':          [35.8623, 36.8034],
  'أريحا':          [35.8234, 36.6012],
  'جسر الشغور':     [35.8178, 36.3234],
  'حارم':           [36.1789, 36.5123],
  'كفرنبل':         [35.6134, 36.5623],

  // الحسكة
  'القامشلي':       [37.0523, 41.2312],
  'رأس العين':      [36.8623, 40.0712],
  'المالكية':       [37.1823, 42.1234],
  'الشدادي':        [36.0534, 40.7123],

  // دير الزور
  'البوكمال':       [34.4534, 40.9423],
  'الميادين':       [35.0123, 40.4523],
  'الأشارة':        [35.5234, 39.9123],

  // الرقة
  'تل أبيض':        [36.6923, 38.9612],
  'الثورة':         [35.9823, 38.5412],

  // درعا
  'نوى':            [32.9012, 36.0534],
  'الصنمين':        [33.0623, 36.1834],
  'إنخل':           [32.7456, 36.0323],
  'بصرى الشام':     [32.5134, 36.4856],

  // السويداء
  'شهبا':           [32.8623, 36.6934],
  'صلخد':           [32.4923, 36.7123],

  // القنيطرة
  'فيق':            [32.9234, 35.8623],
  'البعث':          [33.1734, 35.9534],
}

/**
 * يحل الإحداثيات من governorate + region + address
 */
function resolveCoords(b) {
  // 1. البحث في المناطق التفصيلية أولاً
  if (b.region) {
    for (const [name, coords] of Object.entries(REGIONS)) {
      if (b.region.includes(name) || name.includes(b.region)) return { coords, level: 'region' }
    }
  }

  // 2. البحث في المحافظات
  if (b.governorate) {
    for (const [name, coords] of Object.entries(GOVERNORATES)) {
      if (b.governorate.includes(name) || name.includes(b.governorate)) return { coords, level: 'governorate' }
    }
  }

  // 3. البحث في العنوان النصي
  if (b.address) {
    for (const [name, coords] of Object.entries({ ...GOVERNORATES, ...REGIONS })) {
      if (b.address.includes(name)) return { coords, level: 'address' }
    }
  }

  return null
}

// ─── إعداد الألوان ────────────────────────────────────────────────────────────
const CAT_CFG = {
  orphan:      { color:'#1d4ed8', bg:'#dbeafe', ar:'كفالة يتيم',       en:'Orphan'     },
  educational: { color:'#7c3aed', bg:'#f3e8ff', ar:'دعم تعليمي',       en:'Education'  },
  medical:     { color:'#dc2626', bg:'#fee2e2', ar:'دعم طبي',          en:'Medical'    },
  widow:       { color:'#be185d', bg:'#fce7f3', ar:'دعم أرملة',        en:'Widow'      },
  poor:        { color:'#a16207', bg:'#fef9c3', ar:'محدود الدخل',       en:'Low-income' },
}

const PRI_RADIUS = { high: 14, medium: 10, low: 7 }

const PRI_CFG = {
  high:   { ar:'عالية',   en:'High',   color:'#dc2626' },
  medium: { ar:'متوسطة', en:'Medium', color:'#d97706' },
  low:    { ar:'منخفضة', en:'Low',    color:'#94a3b8' },
}

// ─── مكوّن Legend ──────────────────────────────────────────────────────────────
function Legend({ isAr, catCounts }) {
  return (
    <div style={{
      position: 'absolute', top: 10, [isAr ? 'right' : 'left']: 10, zIndex: 1000,
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: '10px', padding: '10px 12px', minWidth: '152px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
    }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isAr ? 'الفئة' : 'Category'}
      </p>
      {catCounts.map(([key, count]) => {
        const c = CAT_CFG[key]
        return c ? (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{isAr ? c.ar : c.en}</span>
            </div>
            <span style={{ fontSize: '0.71rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
          </div>
        ) : null
      })}

      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8 }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 5 }}>
          {isAr ? '● حجم الدائرة = الأولوية' : '● Size = Priority'}
        </p>
        {Object.entries(PRI_CFG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ width: PRI_RADIUS[key], height: PRI_RADIUS[key], borderRadius: '50%', background: cfg.color, display: 'block', flexShrink: 0, opacity: 0.7 }} />
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{isAr ? cfg.ar : cfg.en}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function BeneficiaryMap() {
  const { i18n } = useTranslation()
  const isAr     = i18n.language?.startsWith('ar')

  const [filterGov, setFilterGov] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterPri, setFilterPri] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries-map'],
    queryFn:  () => beneficiariesService.getList({ page: 1, limit: 500 }),
  })

  const allBeneficiaries = data?.data ?? []

  // تحليل المواقع
  const { mapped, unmapped } = useMemo(() => {
    const m = [], u = []
    allBeneficiaries.forEach(b => {
      const result = resolveCoords(b)
      if (result) {
        // إضافة jitter طفيف لمنع التداخل في نفس النقطة
        const [lat, lng] = result.coords
        const jLat = lat + (Math.random() - 0.5) * 0.008
        const jLng = lng + (Math.random() - 0.5) * 0.008
        m.push({ ...b, _coords: [jLat, jLng], _level: result.level })
      } else {
        u.push(b)
      }
    })
    return { mapped: m, unmapped: u }
  }, [allBeneficiaries])

  // قائمة المحافظات الموجودة
  const govList = useMemo(() => {
    const s = new Set()
    allBeneficiaries.forEach(b => { if (b.governorate) s.add(b.governorate) })
    return [...s].sort()
  }, [allBeneficiaries])

  // إحصائيات الفئات
  const catCounts = useMemo(() => {
    const c = {}
    allBeneficiaries.forEach(b => { c[b.category] = (c[b.category] ?? 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [allBeneficiaries])

  // فلترة البطاقات
  const filtered = useMemo(() =>
    mapped.filter(b =>
      (!filterGov || b.governorate === filterGov) &&
      (!filterCat || b.category    === filterCat) &&
      (!filterPri || b.priority    === filterPri)
    ), [mapped, filterGov, filterCat, filterPri])

  // مركز الخريطة — سوريا
  const CENTER = [34.802, 38.996]
  const ZOOM   = 7

  if (isLoading) return <SpinnerPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ── شريط الإحصائيات والفلاتر ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>

        {/* إحصائية */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: '99px', background: '#e6f0ee', border: '1px solid #0D524730' }}>
          <Users size={13} color="#0D5247" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247' }}>
            {filtered.length}
            <span style={{ fontWeight: 400, color: '#6b8a83' }}> / {allBeneficiaries.length} {isAr ? 'مستفيد' : 'beneficiaries'}</span>
          </span>
        </div>

        {/* فلتر المحافظة */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={13} color="var(--text-muted)" />
          <select value={filterGov} onChange={e => setFilterGov(e.target.value)} className="input"
            style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
            <option value="">{isAr ? 'كل المحافظات' : 'All governorates'}</option>
            {govList.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* فلتر الفئة */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Filter size={13} color="var(--text-muted)" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input"
            style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
            <option value="">{isAr ? 'كل الفئات' : 'All categories'}</option>
            {catCounts.map(([key]) => CAT_CFG[key] ? (
              <option key={key} value={key}>{isAr ? CAT_CFG[key].ar : CAT_CFG[key].en}</option>
            ) : null)}
          </select>
        </div>

        {/* فلتر الأولوية */}
        <select value={filterPri} onChange={e => setFilterPri(e.target.value)} className="input"
          style={{ width: 'auto', fontSize: '0.82rem', padding: '6px 10px' }}>
          <option value="">{isAr ? 'كل الأولويات' : 'All priorities'}</option>
          {Object.entries(PRI_CFG).map(([key, cfg]) => (
            <option key={key} value={key}>{isAr ? cfg.ar : cfg.en}</option>
          ))}
        </select>

        {(filterGov || filterCat || filterPri) && (
          <button onClick={() => { setFilterGov(''); setFilterCat(''); setFilterPri('') }}
            style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
            ✕ {isAr ? 'مسح الفلاتر' : 'Clear'}
          </button>
        )}
      </div>

      {/* ── الخريطة ───────────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-default)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'relative', height: '480px' }}>
        <MapContainer center={CENTER} zoom={ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ZoomControl position="bottomright" />

          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.78,
                    weight: b._level === 'governorate' ? 2 : 1.5,
                    dashArray: b._level === 'governorate' ? '4,3' : undefined,
                  }}
                >
                  {/* Tooltip عند hover */}
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.96}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: '140px' }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', marginBottom: 2, fontSize: '0.88rem' }}>{b.name}</p>
                      {b.governorate && (
                        <p style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: 1 }}>
                          📍 {[b.governorate, b.region].filter(Boolean).join(' — ')}
                        </p>
                      )}
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{b.phone}</p>
                    </div>
                  </Tooltip>

                  {/* Popup عند الضغط */}
                  <Popup maxWidth={240}>
                    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', minWidth: '200px' }}>
                      <p style={{ fontWeight: 700, color: '#0D5247', fontSize: '0.95rem', marginBottom: 4 }}>{b.name}</p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, direction: 'ltr' }}>{b.phone}</p>

                      {/* الموقع */}
                      <div style={{ background: '#e6f0ee', borderRadius: 7, padding: '6px 9px', marginBottom: 8 }}>
                        {b.governorate && (
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0D5247', marginBottom: 1 }}>
                            🏛 {b.governorate}
                          </p>
                        )}
                        {b.region && (
                          <p style={{ fontSize: '0.73rem', color: '#0D5247', marginBottom: 1 }}>
                            🏘 {b.region}
                          </p>
                        )}
                        {b.address && (
                          <p style={{ fontSize: '0.7rem', color: '#6b8a83' }}>📍 {b.address}</p>
                        )}
                      </div>

                      {/* الفئة والأولوية والحالة */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                        {cat && (
                          <span style={{ fontSize: '0.69rem', padding: '2px 8px', borderRadius: '99px', background: cat.bg, color: cat.color, fontWeight: 600 }}>
                            {isAr ? cat.ar : cat.en}
                          </span>
                        )}
                        {b.priority && (
                          <span style={{ fontSize: '0.69rem', padding: '2px 8px', borderRadius: '99px', background: '#f1f5f9', color: PRI_CFG[b.priority]?.color ?? '#64748b', fontWeight: 600 }}>
                            {isAr ? PRI_CFG[b.priority]?.ar : PRI_CFG[b.priority]?.en}
                          </span>
                        )}
                        <Badge status={b.status} />
                      </div>

                      {/* الدعم الشهري */}
                      {b.monthlySupport > 0 && (
                        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D5247' }}>
                          {b.monthlySupport.toLocaleString('ar-SY')} ل.س / شهر
                        </p>
                      )}

                      {/* تفاصيل إضافية */}
                      {b.academicYear && <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>📚 {b.academicYear}</p>}
                      {b.membersCount  && <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>👨‍👩‍👧 {b.membersCount} {isAr ? 'فرد' : 'members'}</p>}

                      {/* مستوى الدقة */}
                      {b._level === 'governorate' && (
                        <p style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: 5, borderTop: '1px dashed #e5e7eb', paddingTop: 4 }}>
                          ⚠ {isAr ? 'موضوع على مستوى المحافظة' : 'Placed at governorate level'}
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </LayerGroup>

          {/* Legend */}
          <Legend isAr={isAr} catCounts={catCounts} />
        </MapContainer>
      </div>

      {/* ── المستفيدون غير المحددين ────────────────────────────────────────────── */}
      {unmapped.length > 0 && (
        <div style={{ background: 'var(--bg-muted)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <AlertCircle size={14} color="#a16207" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {unmapped.length} {isAr ? 'مستفيد لم يُحدَّد موقعهم' : 'beneficiaries without resolved location'}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {unmapped.slice(0, 10).map(b => (
              <span key={b.id} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '99px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                {b.name}
                {(b.governorate || b.region) && (
                  <span style={{ color: 'var(--text-muted)' }}> ({[b.governorate, b.region].filter(Boolean).join(' / ')})</span>
                )}
              </span>
            ))}
            {unmapped.length > 10 && (
              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '99px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                +{unmapped.length - 10} {isAr ? 'آخرين' : 'more'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
            💡 {isAr
              ? 'تأكد من وجود حقل governorate (المحافظة) أو region (المنطقة/الحي) في بيانات المستفيد'
              : 'Make sure each beneficiary has a governorate or region field matching Syria\'s map data'}
          </p>
        </div>
      )}
    </div>
  )
}