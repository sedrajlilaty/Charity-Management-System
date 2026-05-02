
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Heart, UserCheck, Megaphone, Settings, Clock } from 'lucide-react'
import { notificationsService } from '../../service/ServiceLayer'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { formatDateTime } from '../../utlis/helper'



const TYPE_CONFIG = {
  donation: { icon: Heart,      bg:'#dcfce7', color:'#16a34a', label:'Donation'    },
  case:     { icon: UserCheck,  bg:'#dbeafe', color:'#1d4ed8', label:'Case'    },
  campaign: { icon: Megaphone,  bg:'#fef9c3', color:'#a16207', label:'Campaign'    },
  system:   { icon: Settings,   bg:'var(--bg-muted)', color:'var(--text-secondary)', label:'System' },
}

function NotifCard({ notif, onMarkRead }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system
  const Icon = cfg.icon

  return (
    <div style={{
      background: notif.read ? '#ffffff' : '#ecfdf5',
      border: `1px solid ${notif.read ? 'var(--border-default)' : '#0D524730'}`,
      borderRight: notif.read ? '1px solid var(--border-default)' : '4px solid #0D5247',
      borderRadius:'12px',
      padding:'1rem 1.1rem',
      display:'flex', alignItems:'flex-start', gap:'12px',
      transition:'box-shadow 0.2s',
      position:'relative',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
    >
      {/* Icon */}
      <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={cfg.color}/>
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'0.8rem', fontWeight: notif.read ? 600 : 700, color:'var(--text-primary)' }}>
              {notif.title}
            </span>
            <span style={{ fontSize:'0.65rem', fontWeight:600, padding:'2px 8px', borderRadius:'99px', background:cfg.bg, color:cfg.color }}>
              {cfg.label}
            </span>
          </div>
          {!notif.read && (
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#0D5247', flexShrink:0, marginTop:'4px' }}/>
          )}
        </div>
        <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'8px' }}>{notif.message}</p>
        <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'var(--text-muted)' }}>
          <Clock size={11}/>
          <span style={{ fontSize:'0.7rem' }}>{formatDateTime(notif.createdAt)}</span>
        </div>
      </div>

      {/* Mark read button */}
      {!notif.read && (
        <button onClick={() => onMarkRead(notif.id)}
          style={{ padding:'5px 10px', borderRadius:'7px', border:'1px solid var(--border-default)', background:'#094037', fontSize:'0.72rem', fontWeight:600, color:'var(--text-secondary)',color:'#fff', cursor:'pointer', flexShrink:0, fontFamily:'Cairo,sans-serif', whiteSpace:'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--bg-muted)' }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--bg-surface)' }}
        >
          Mark as read
        </button>
      )}
    </div>
  )
}

export default function Notifications() {
  const qc = useQueryClient()
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  notificationsService.getList,
  })

  const markRead = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess:  () => { qc.invalidateQueries(['notifications']); qc.invalidateQueries(['notifications','unread']) },
  })
  const markAll = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess:  () => { qc.invalidateQueries(['notifications']); qc.invalidateQueries(['notifications','unread']) },
  })

  const unread  = list.filter(n => !n.read)
  const read    = list.filter(n => n.read)

  if (isLoading) return <SpinnerPage/>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', maxWidth:'760px' }}>
      <PageHeader
        title="Notifications"
        subtitle={unread.length > 0 ? `${unread.length} unread notifications` : 'All notifications are read'}
      >
        {unread.length > 0 && (
          <button onClick={() => markAll.mutate()} className="btn-outline" style={{ fontSize:'0.82rem' ,backgroundColor:"#094037" ,color:'#fff'}}>
            <CheckCheck size={14}/>
            Mark all as read
          </button>
        )}
      </PageHeader>

      {/* Unread */}
      {unread.length > 0 && (
        <div>
          <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            Unread ({unread.length})
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {unread.map(n => (
              <NotifCard key={n.id} notif={n} onMarkRead={id => markRead.mutate(id)}/>
            ))}
          </div>
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div>
          <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px', marginTop: unread.length > 0 ? '8px' : '0' }}>
            Read ({read.length})
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {read.map(n => (
              <NotifCard key={n.id} notif={n} onMarkRead={id => markRead.mutate(id)}/>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-muted)' }}>
          <Bell size={40} style={{ margin:'0 auto 12px', opacity:0.25 }}/>
          <p style={{ fontWeight:500 }}>No notifications</p>
        </div>
      )}
    </div>
  )
}
