/**
 * ui/shared.jsx
 * ─────────────────────────────────────────────────────────────
 * مكوّنات مشتركة موحّدة تُستخدم في جميع صفحات نظام عطاء.
 * استوردي ما تحتاجينه من هنا بدلاً من إعادة كتابة الـ styles.
 */

import { Search } from 'lucide-react'

/* ══════════════════════════════════════════
   PAGE HEADER
══════════════════════════════════════════ */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   CARD
══════════════════════════════════════════ */
export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

export function CardHeader({ title, children }) {
  return (
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════
   FILTER BAR  (tabs + optional search)
══════════════════════════════════════════ */
export function FilterBar({ tabs, activeTab, onTabChange, searchValue, onSearchChange, searchPlaceholder, extraFilters }) {
  return (
    <div className="filter-card">
      <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%' }}>

        {/* الصف الأول: التبويبات + البحث */}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {tabs && (
            <div className="tab-group">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {onSearchChange !== undefined && (
            <div className="search-box">
              <Search size={15} color="var(--text-muted)" style={{ flexShrink:0 }} />
              <input
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'بحث...'}
              />
            </div>
          )}
        </div>

        {/* الصف الثاني: فلاتر إضافية */}
        {extraFilters && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {extraFilters}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TABLE WRAPPER  (card + header + table + pagination)
══════════════════════════════════════════ */
export function TableCard({ title, subtitle, headerRight, children, paginationSlot }) {
  return (
    <div className="card" style={{ borderRadius:'var(--radius)', overflow:'hidden', padding:0 }}>
      {/* رأس الكارد */}
      <div style={{
        padding:'1.1rem 1.5rem',
        borderBottom:'1px solid var(--border-subtle)',
        display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
      }}>
        <div>
          <h3 style={{ margin:0, fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>{title}</h3>
          {subtitle && <p style={{ margin:'4px 0 0', fontSize:'.83rem', color:'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        {headerRight}
      </div>

      {/* الجدول */}
      <div style={{ overflowX:'auto' }}>
        {children}
      </div>

      {/* ترقيم الصفحات */}
      {paginationSlot && (
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border-subtle)' }}>
          {paginationSlot}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   UNIFIED TABLE
══════════════════════════════════════════ */
export function AtaaTable({ columns=[], data=[], isLoading, loadingSlot, emptySlot }) {
  if (isLoading) return loadingSlot || <LoadingRows />
  if (!data?.length) return emptySlot || <EmptyRows />

  return (
    <table className="ataa-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} style={{ textAlign: col.align || 'right' }}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id ?? i}>
            {columns.map(col => (
              <td key={col.key} style={{ textAlign: col.align || 'right' }}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LoadingRows() {
  return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)', fontSize:'.9rem' }}>
      جاري التحميل...
    </div>
  )
}

function EmptyRows() {
  return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)', fontSize:'.9rem' }}>
      لا توجد بيانات للعرض
    </div>
  )
}

/* ══════════════════════════════════════════
   BADGE — الشارة
══════════════════════════════════════════ */
const BADGE_MAP = {
  active:    'badge-active',
  approved:  'badge-active',
  pending:   'badge-pending',
  rejected:  'badge-rejected',
  archived:  'badge-archived',
  draft:     'badge-draft',
  completed: 'badge-completed',
  inactive:  'badge-inactive',
}

const BADGE_AR = {
  active:'نشط', approved:'مقبول', pending:'معلق',
  rejected:'مرفوض', archived:'مؤرشف', draft:'مسودة',
  completed:'مكتمل', inactive:'غير نشط',
}

export function Badge({ status }) {
  return (
    <span className={`badge ${BADGE_MAP[status] ?? 'badge-archived'}`}>
      {BADGE_AR[status] ?? status}
    </span>
  )
}

/* ══════════════════════════════════════════
   AVATAR
══════════════════════════════════════════ */
export function Avatar({ name, src, size = 36 }) {
  const initials = name?.slice(0, 2) ?? '؟؟'
  return (
    <div className="avatar" style={{ width:size, height:size, fontSize: size * 0.28 }}>
      {src
        ? <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
        : initials
      }
    </div>
  )
}

/* ══════════════════════════════════════════
   HERO STATS CARD (للحملات والخدمات)
══════════════════════════════════════════ */
export function HeroCard({ title, subtitle, stats = [] }) {
  return (
    <div className="hero-card">
      <div style={{ position:'relative', zIndex:2, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h3 style={{ color:'var(--amber)', fontSize:'1.2rem', fontWeight:900, margin:'0 0 4px' }}>{title}</h3>
          {subtitle && <p style={{ color:'rgba(255,255,255,.65)', fontSize:'.85rem', margin:0 }}>{subtitle}</p>}
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} className="hero-stat-box">
              <span className="hero-stat-label">{s.label}</span>
              <span className="hero-stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════ */
export function ProgressBar({ value, max, variant = 'brand' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const colorClass = pct >= 100 ? 'progress-green' : pct >= 60 ? 'progress-brand' : 'progress-amber'
  return (
    <div className="progress-track" style={{ flex:1 }}>
      <div className={`progress-fill ${colorClass}`} style={{ width:`${pct}%` }} />
    </div>
  )
}

/* ══════════════════════════════════════════
   ACTION BUTTONS في الجدول
══════════════════════════════════════════ */
export function ActionButtons({ children }) {
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
      {children}
    </div>
  )
}

export function IconBtn({ onClick, variant = 'muted', title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`btn-icon btn-icon-${variant}`}
    >
      {children}
    </button>
  )
}

/* ══════════════════════════════════════════
   SETTING ROW (للإعدادات)
══════════════════════════════════════════ */
export function SettingRow({ title, description, children, noBorder = false }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      gap:20, padding:'20px 0',
      borderBottom: noBorder ? 'none' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ flex:1 }}>
        <h4 style={{ margin:0, fontSize:'.95rem', fontWeight:700, color:'var(--text-primary)' }}>{title}</h4>
        <p style={{ marginTop:5, fontSize:'.83rem', color:'var(--text-muted)', lineHeight:1.6 }}>{description}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TOGGLE SWITCH (للإعدادات)
══════════════════════════════════════════ */
export function ToggleSwitch({ on, onChange }) {
  return (
    <button
      className={`toggle-switch ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
    />
  )
}