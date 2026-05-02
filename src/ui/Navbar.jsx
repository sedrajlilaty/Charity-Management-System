import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Globe, Sun, Moon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../service/ServiceLayer'
import { useTheme } from '../context/ThemeContext'


export default function Navbar({ onMenuClick }) {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isRtl = i18n.language?.startsWith('ar')

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsService.getUnread,
    refetchInterval: 30_000,
  })

  /* ── تبديل اللغة لكامل التطبيق ── */
  const toggleLang = () => {
    const current = i18n.language?.startsWith('ar') ? 'ar' : 'en'
    const next = current === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    const html = document.documentElement
    html.lang = next
    html.dir  = next === 'ar' ? 'rtl' : 'ltr'
    document.body.dir = next === 'ar' ? 'rtl' : 'ltr'
    // حفظ الاختيار
    localStorage.setItem('charity-lang', next)
  }

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: isRtl ? 0 : 'var(--sidebar-width)',
    right: isRtl ? 'var(--sidebar-width)' : 0,
    height: 'var(--navbar-height)',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.25rem',
    zIndex: 20,
    gap: '12px',
  }

  const iconBtn = {
    display:'flex', alignItems:'center', justifyContent:'center',
    width:'36px', height:'36px', borderRadius:'10px',
    background:'transparent', border:'none', cursor:'pointer',
    color: 'var(--text-secondary)',
    transition:'background 0.15s ease',
    position:'relative',
  }

  return (
    <header style={navStyle}>
      {/* Left section */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <button
          onClick={onMenuClick}
          style={{ ...iconBtn, display:'flex' }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div style={{
          display:'flex', alignItems:'center', gap:'8px',
          background:'var(--bg-muted)', borderRadius:'10px',
          padding:'7px 12px', border:'1px solid transparent',
          minWidth:'180px',
        }}>
          <Search size={14} style={{ color:'var(--text-muted)', flexShrink:0 }} />
          <input
            style={{
              background:'transparent', border:'none', outline:'none',
              fontSize:'0.85rem', color:'var(--text-primary)', width:'100%',
              fontFamily:'Cairo, sans-serif',
            }}
            placeholder={t('common.search')}
          />
        </div>
      </div>

      {/* Right section */}
      <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          style={{ ...iconBtn, width:'auto', padding:'0 10px', gap:'6px', fontSize:'0.8rem', fontWeight:600 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Globe size={15} />
          {i18n.language?.startsWith('ar') ? 'EN' : 'عر'}
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          style={iconBtn}
          title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          style={iconBtn}
          onClick={() => navigate('/notifications')}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position:'absolute', top:'4px', right:'4px',
              width:'16px', height:'16px', borderRadius:'50%',
              background:'#ef4444', color:'#fff',
              fontSize:'9px', fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
