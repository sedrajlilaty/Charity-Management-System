/**
 * VolunteersKanban v2 — لوحة Kanban محسّنة مع:
 *  - مودال تفاصيل عند الضغط على البطاقة
 *  - أزرار سريعة (قبول/رفض) تظهر عند hover
 *  - سحب وإفلات بين الأعمدة
 *  - عدّاد البطاقات في رأس كل عمود
 */
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Calendar, Phone, Mail, Star, Clock, CheckCircle, XCircle,
  Loader2, X, User, Briefcase, AlarmClock, Award, FileText,
  ChevronRight, Check, Ban
} from 'lucide-react'
import { volunteersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { SpinnerPage } from '../../ui/Spinner'
import PermissionButton from '../../ui/PermissionButton'
// ─── Config ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key:'pending',   icon:Clock,       color:'#92400e', bg:'#fff8e6', border:'#f59e0b', label_ar:'قيد الانتظار', label_en:'Pending'   },
  { key:'approved',  icon:CheckCircle, color:'#0D5247', bg:'#e6f0ee', border:'#0D5247', label_ar:'مقبولة',       label_en:'Approved'  },
  { key:'completed', icon:Star,        color:'#1d4ed8', bg:'#eff6ff', border:'#3b82f6', label_ar:'مكتملة',       label_en:'Completed' },
  { key:'rejected',  icon:XCircle,     color:'#b91c1c', bg:'#fef2f2', border:'#ef4444', label_ar:'مرفوضة',       label_en:'Rejected'  },
]

const ACTION_MAP = { approved:'approve', rejected:'reject', completed:'complete', pending:'restore' }

const SKILL_STYLE = {
  medical:   { bg:'#fee2e2', color:'#991b1b' },
  teaching:  { bg:'#dbeafe', color:'#1e40af' },
  logistics: { bg:'#fef9c3', color:'#92400e' },
  social:    { bg:'#f3e8ff', color:'#6b21a8' },
  technical: { bg:'#dcfce7', color:'#166534' },
  other:     { bg:'#f1f5f9', color:'#475569' },
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ volunteer, onClose, onAction, isAr }) {
  const { t } = useTranslation()
  if (!volunteer) return null

  const sk = SKILL_STYLE[volunteer.skill] ?? SKILL_STYLE.other

  const ACTIONS = [
    { key:'approve',  label: isAr?'قبول':'Approve',   style:{ background:'#0D5247', color:'#fff' }, show: volunteer.status !== 'approved'  },
    { key:'reject',   label: isAr?'رفض':'Reject',     style:{ background:'#b91c1c', color:'#fff' }, show: volunteer.status !== 'rejected'  },
    { key:'complete', label: isAr?'اكتمال':'Complete', style:{ background:'#1d4ed8', color:'#fff' }, show: volunteer.status === 'approved'  },
  ].filter(a => a.show)

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'var(--bg-surface)', borderRadius:'16px', width:'100%', maxWidth:'440px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div style={{ background:'#094037', padding:'20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <Avatar name={volunteer.name} size={44} />
            <div>
              <p style={{ fontWeight:700, fontSize:'1rem', color:'#fff', lineHeight:1.2 }}>{volunteer.name}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:'4px' }}>
                <Phone size={11} color="#9fb4b0" />
                <span style={{ fontSize:'0.78rem', color:'#9fb4b0', direction:'ltr' }}>{volunteer.phone}</span>
              </div>
            </div>
          </div>
          <PermissionButton  onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', flexShrink:0 }}>
            <X size={15} />
          </PermissionButton >
        </div>

        {/* Body */}
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'14px' }}>
          {/* Status */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>{isAr ? 'الحالة الحالية' : 'Current Status'}</span>
            <Badge status={volunteer.status} />
          </div>

          {/* Campaign */}
          <InfoRow icon={Calendar} label={isAr?'الحملة':'Campaign'} value={volunteer.campaignName} highlight />

          {/* Skill */}
          {volunteer.skill && (
            <InfoRow icon={Briefcase} label={isAr?'التخصص':'Skill'}>
              <span style={{ fontSize:'0.8rem', fontWeight:600, padding:'3px 10px', borderRadius:'99px', background:sk.bg, color:sk.color }}>
                {t(`volunteers.modal.skills.${volunteer.skill}`, { defaultValue:volunteer.skill })}
              </span>
            </InfoRow>
          )}

          {/* Availability */}
          {volunteer.availability && (
            <InfoRow icon={AlarmClock} label={isAr?'وقت الإتاحة':'Availability'}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                {t(`volunteers.modal.availability_options.${volunteer.availability}`, { defaultValue:volunteer.availability })}
              </span>
            </InfoRow>
          )}

          {/* Experience */}
          {volunteer.experience && (
            <InfoRow icon={Award} label={isAr?'الخبرة':'Experience'}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                {t(`volunteers.modal.experience_options.${volunteer.experience}`, { defaultValue:volunteer.experience })}
              </span>
            </InfoRow>
          )}

          {/* Email */}
          {volunteer.email && (
            <InfoRow icon={Mail} label={isAr?'البريد':'Email'}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', direction:'ltr' }}>{volunteer.email}</span>
            </InfoRow>
          )}

          {/* Notes */}
          {volunteer.notes && (
            <div style={{ background:'var(--bg-muted)', borderRadius:'10px', padding:'10px 12px', border:'1px solid var(--border-default)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                <FileText size={13} color="var(--text-muted)" />
                <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-muted)' }}>{isAr?'ملاحظات':'Notes'}</span>
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{volunteer.notes}</p>
            </div>
          )}

          {/* Applied date */}
          {volunteer.appliedAt && (
            <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', textAlign:'center' }}>
              {isAr ? 'تاريخ التقديم:' : 'Applied:'} {volunteer.appliedAt}
            </p>
          )}
        </div>

        {/* Footer actions */}
        {ACTIONS.length > 0 && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border-default)', display:'flex', gap:'8px', justifyContent:'flex-end' }}>
            {ACTIONS.map(a => (
              <PermissionButton  key={a.key} onClick={() => { onAction(a.key, volunteer); onClose() }}
                style={{ ...a.style, padding:'7px 16px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'Cairo,sans-serif', display:'flex', alignItems:'center', gap:'5px' }}>
                {a.key === 'approve' && <Check size={13} />}
                {a.key === 'reject'  && <Ban   size={13} />}
                {a.key === 'complete'&& <Star  size={13} />}
                {a.label}
              </PermissionButton >
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, highlight, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
        <Icon size={13} color="var(--text-muted)" />
        <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>{label}</span>
      </div>
      {children ?? (
        <span style={{ fontSize:'0.82rem', fontWeight: highlight ? 700 : 400, color: highlight ? '#094037' : 'var(--text-secondary)', textAlign:'end' }}>
          {value ?? '—'}
        </span>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function VolunteerCard({ volunteer, onDragStart, isDragging, onOpenDetail, onQuickAction, isAr }) {
  const [hovered, setHovered] = useState(false)
  const { t }                 = useTranslation()
  const sk                    = SKILL_STYLE[volunteer.skill] ?? SKILL_STYLE.other

  const quickActions = [
    { key:'approve',  icon:Check, color:'#0D5247', bg:'#e6f0ee', show: volunteer.status === 'pending'  },
    { key:'reject',   icon:Ban,   color:'#b91c1c', bg:'#fef2f2', show: volunteer.status === 'pending'  },
    { key:'complete', icon:Star,  color:'#1d4ed8', bg:'#eff6ff', show: volunteer.status === 'approved' },
  ].filter(a => a.show)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(volunteer)}
      onClick={() => onOpenDetail(volunteer)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:'var(--bg-surface)', border:'1px solid var(--border-default)',
        borderRadius:'12px', padding:'11px', cursor:'pointer',
        opacity: isDragging ? 0.35 : 1,
        boxShadow: hovered ? '0 6px 18px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition:'all 0.15s', userSelect:'none',
        position:'relative',
      }}
    >
      {/* Quick actions on hover */}
      {hovered && quickActions.length > 0 && (
        <div style={{ position:'absolute', top:'8px', insetInlineEnd:'8px', display:'flex', gap:'4px', zIndex:10 }}
          onClick={e => e.stopPropagation()}>
          {quickActions.map(a => (
            <PermissionButton  key={a.key}
              onClick={() => onQuickAction(a.key, volunteer)}
              style={{ width:'24px', height:'24px', borderRadius:'6px', border:'none', cursor:'pointer', background:a.bg, color:a.color, display:'flex', alignItems:'center', justifyContent:'center' }}
              title={a.key}>
              <a.icon size={12} />
            </PermissionButton >
          ))}
        </div>
      )}

      {/* Name + phone */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px', paddingInlineEnd: quickActions.length && hovered ? '70px' : '0' }}>
        <Avatar name={volunteer.name} size={30} />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:700, fontSize:'0.83rem', color:'var(--text-primary)', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{volunteer.name}</p>
          <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', direction:'ltr' }}>{volunteer.phone}</p>
        </div>
        <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink:0, opacity: hovered ? 1 : 0, transition:'opacity 0.15s' }} />
      </div>

      {/* Campaign badge */}
      {volunteer.campaignName && (
        <div style={{ background:'#e6f0ee', borderRadius:'7px', padding:'4px 8px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'5px' }}>
          <Calendar size={10} color="#0D5247" />
          <span style={{ fontSize:'0.73rem', fontWeight:600, color:'#0D5247', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{volunteer.campaignName}</span>
        </div>
      )}

      {/* Skill */}
      {volunteer.skill && (
        <span style={{ fontSize:'0.67rem', fontWeight:600, padding:'2px 8px', borderRadius:'99px', background:sk.bg, color:sk.color }}>
          {t(`volunteers.modal.skills.${volunteer.skill}`, { defaultValue:volunteer.skill })}
        </span>
      )}
    </div>
  )
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({ col, cards, onDragStart, onDrop, draggingId, onOpenDetail, onQuickAction, isAr }) {
  const [isOver, setIsOver] = useState(false)
  const Icon                = col.icon
  const label               = isAr ? col.label_ar : col.label_en

  return (
    <div style={{ flex:'1 1 210px', minWidth:'200px', maxWidth:'280px', display:'flex', flexDirection:'column', gap:'8px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 11px', borderRadius:'10px', background:col.bg, border:`1px solid ${col.border}35` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
          <Icon size={14} color={col.color} />
          <span style={{ fontSize:'0.83rem', fontWeight:700, color:col.color }}>{label}</span>
        </div>
        <span style={{ minWidth:'22px', height:'22px', borderRadius:'50%', background:col.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700, padding:'0 5px' }}>
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsOver(true) }}
        onDragLeave={() => setIsOver(false)}
        onDrop={() => { onDrop(col.key); setIsOver(false) }}
        style={{
          flex:1, minHeight:'180px', display:'flex', flexDirection:'column', gap:'7px', padding:'4px',
          borderRadius:'10px',
          border: isOver ? `2px dashed ${col.border}` : '2px dashed transparent',
          background: isOver ? `${col.bg}` : 'transparent',
          transition:'all 0.15s',
        }}
      >
        {cards.map(v => (
          <VolunteerCard
            key={v.id}
            volunteer={v}
            onDragStart={onDragStart}
            isDragging={draggingId === v.id}
            onOpenDetail={onOpenDetail}
            onQuickAction={onQuickAction}
            isAr={isAr}
          />
        ))}
        {cards.length === 0 && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'0.875rem', opacity:0.4, minHeight:'80px', flexDirection:'column', gap:'4px' }}>
            <Icon size={20} color={col.border} style={{ opacity:0.3 }} />
            {isOver ? '⬇' : isAr ? 'اسحب هنا' : 'Drop here'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VolunteersKanban() {
  const { t, i18n } = useTranslation()
  const qc          = useQueryClient()
  const isAr        = i18n.language?.startsWith('ar')

  const [dragging,    setDragging]    = useState(null)
  const [changingId,  setChangingId]  = useState(null)
  const [detailItem,  setDetailItem]  = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['volunteers', 'kanban'],
    queryFn:  () => volunteersService.getList({ page:1, limit:300 }),
  })

  const changeMut = useMutation({
    mutationFn: ({ id, action }) => volunteersService.changeStatus(id, action),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  })

  const handleDragStart = useCallback((v) => setDragging({ id:v.id, from:v.status }), [])

  const handleDrop = useCallback((toStatus) => {
    if (!dragging || dragging.from === toStatus) { setDragging(null); return }
    const action = ACTION_MAP[toStatus]
    if (!action) { setDragging(null); return }
    setChangingId(dragging.id)
    changeMut.mutate({ id:dragging.id, action }, { onSettled:() => { setDragging(null); setChangingId(null) } })
  }, [dragging, changeMut])

  const handleQuickAction = useCallback((action, volunteer) => {
    setChangingId(volunteer.id)
    changeMut.mutate({ id:volunteer.id, action }, { onSettled:() => setChangingId(null) })
  }, [changeMut])

  const handleDetailAction = useCallback((action, volunteer) => {
    setChangingId(volunteer.id)
    changeMut.mutate({ id:volunteer.id, action }, { onSettled:() => setChangingId(null) })
  }, [changeMut])

  if (isLoading) return <SpinnerPage />

  const volunteers = data?.data ?? []
  const byStatus   = COLUMNS.reduce((a,c) => ({ ...a, [c.key]: volunteers.filter(v => v.status === c.key) }), {})

  return (
    <>
      {/* Summary pills */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center', marginBottom:'4px' }}>
        {COLUMNS.map(col => (
          <div key={col.key} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'99px', background:col.bg, border:`1px solid ${col.border}30` }}>
            <col.icon size={11} color={col.color} />
            <span style={{ fontSize:'0.73rem', fontWeight:700, color:col.color }}>
              {isAr ? col.label_ar : col.label_en}
            </span>
            <span style={{ fontSize:'0.7rem', fontWeight:700, color:col.color, background:`${col.border}20`, padding:'0 5px', borderRadius:'99px' }}>
              {byStatus[col.key]?.length ?? 0}
            </span>
          </div>
        ))}
        <span style={{ marginInlineStart:'auto', fontSize:'0.72rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}>
          ✋ {isAr ? 'اسحب للتغيير • اضغط للتفاصيل' : 'Drag to move • Tap for details'}
        </span>
      </div>

      {/* Board */}
      <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', overflowX:'auto', paddingBottom:'8px' }}>
        {COLUMNS.map(col => (
          <Column
            key={col.key}
            col={col}
            cards={byStatus[col.key] ?? []}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            draggingId={dragging?.id}
            onOpenDetail={setDetailItem}
            onQuickAction={handleQuickAction}
            isAr={isAr}
          />
        ))}
      </div>

      {/* Detail modal */}
      {detailItem && (
        <DetailModal
          volunteer={detailItem}
          onClose={() => setDetailItem(null)}
          onAction={handleDetailAction}
          isAr={isAr}
        />
      )}

      {/* Loading overlay */}
      {changingId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.04)', zIndex:100, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--bg-surface)', borderRadius:'12px', padding:'12px 20px', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
            <Loader2 size={16} color="#094037" style={{ animation:'spin 1s linear infinite' }} />
            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>
              {isAr ? 'جاري التحديث...' : 'Updating...'}
            </span>
          </div>
        </div>
      )}
    </>
  )
}