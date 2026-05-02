import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Heart, UserCheck,
  Megaphone, Handshake, Settings, Bell, LogOut, X,
  HeartHandshake,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../utlis/helper'

const SIDEBAR_W = 260

const NAV_ITEMS = [
  { key:'dashboard',     path:'/',              icon:LayoutDashboard },
  { key:'donations',     path:'/donations',     icon:Heart           },
  { key:'beneficiaries', path:'/beneficiaries', icon:UserCheck       },
  { key:'campaigns',     path:'/campaigns',     icon:Megaphone       },
  { key:'services',      path:'/services',      icon:Handshake       },
  { key:'users',         path:'/users',         icon:Users           },
  { key:'notifications', path:'/notifications', icon:Bell            },
  { key:'settings',      path:'/settings',      icon:Settings        },
  {key :'volunteer' , path :'/volunteers' , icon:Users }
]

const AV = ['#e6f0ee:#0D5247','#ffecc8:#835500','#dbeafe:#1d4ed8','#f3e8ff:#7c3aed','#fce7f3:#be185d']

export default function Sidebar({ open, onClose, isDesktop }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const isRtl = document.documentElement.dir === 'rtl'

  const avIdx = (user?.name?.charCodeAt(0) ?? 0) % AV.length
  const [avBg, avColor] = AV[avIdx].split(':')

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && open && (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:39, backdropFilter:'blur(2px)' }} />
      )}

      <div style={{
        position:'fixed', top:0, [isRtl ? 'right' : 'left']:0,
        width:`${SIDEBAR_W}px`, height:'100vh',
        zIndex:40, display:'flex', flexDirection:'column',
        background:'var(--bg-surface)',
        borderLeft: isRtl ? '1px solid var(--border-default)' : 'none',
        borderRight: isRtl ? 'none' : '1px solid var(--border-default)',
        transform: open ? 'translateX(0)' : `translateX(${isRtl ? SIDEBAR_W : -SIDEBAR_W}px)`,
        transition:'transform 0.22s ease',
        boxShadow: open && !isDesktop ? (isRtl ? '-8px 0 32px rgba(0,0,0,0.15)' : '8px 0 32px rgba(0,0,0,0.15)') : 'none',
      }}>

        {/* Logo */}
        <div style={{ height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', borderBottom:'1px solid var(--border-default)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', background:'#0D5247', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <HeartHandshake size={18} color="white" />
            </div>
            <div>
              <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1.3 }}>Charity System</p>
              <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', lineHeight:1.3 }}>Admin Dashboard</p>
            </div>
          </div>
          {!isDesktop && (
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'6px', borderRadius:'8px', display:'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--text-hint)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 8px 10px' }}>
            Main Navigation
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
            {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
                end={path === '/'}
                onClick={!isDesktop ? onClose : undefined}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'9px 10px', borderRadius:'10px',
                  fontSize:'0.875rem', fontWeight:500,
                  textDecoration:'none',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? '#0D5247' : 'transparent',
                  transition:'all 0.15s',
                })}
                onMouseEnter={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background='var(--bg-muted)'; e.currentTarget.style.color='var(--text-primary)' }}}
                onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)' }}}
              >
                {({ isActive }) => (
                  <>
                    {/* أيقونة بخلفية — active: أبيض شفاف / inactive: #835500 */}
                    <span style={{
                      width:'30px', height:'30px',
                      borderRadius:'8px',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                      background: isActive ? 'rgba(255,255,255,0.18)' : '#83550015',
                      transition:'background 0.15s',
                    }}>
                      <Icon size={16} color={isActive ? '#fff' : '#835500'} />
                    </span>
                    <span>{t(`nav.${key}`)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        {user && (
          <div style={{ padding:'12px', borderTop:'1px solid var(--border-default)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'var(--bg-muted)', borderRadius:'12px', padding:'10px 12px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:avBg, color:avColor, fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {user.avatar ?? user.name?.slice(0,2)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</p>
                <p style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{ROLE_LABEL[user.role]}</p>
              </div>
              <button onClick={logout}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px', borderRadius:'6px', display:'flex', transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
