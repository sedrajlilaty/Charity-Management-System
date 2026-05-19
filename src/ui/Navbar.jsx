import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Globe, Sun, Moon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '../service/ServiceLayer'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext' // استيراد السياق الخاص بالمستخدم

export default function Navbar({ onMenuClick }) {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth() // جلب بيانات المستخدم (الاسم والصورة)
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'background 0.15s ease',
    position: 'relative',
  }

  return (
    <header style={navStyle}>
      {/* Left section: Menu & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onMenuClick}
          style={{ ...iconBtn, display: 'flex' }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-muted)', borderRadius: '10px',
          padding: '7px 12px', border: '1px solid transparent',
          minWidth: '180px',
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: '0.85rem', color: 'var(--text-primary)', width: '100%',
              fontFamily: 'Cairo, sans-serif',
            }}
            placeholder={t('common.search')}
          />
        </div>
      </div>

      {/* Right section: Toggles & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          style={{ ...iconBtn, width: 'auto', padding: '0 10px', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}
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
              position: 'absolute', top: '4px', right: '4px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: '#ef4444', color: '#fff',
              fontSize: '9px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* فاصل بسيط */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-default)', margin: '0 4px' }} />

        {/* ── صورة البروفايل ── */}
        <div 
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '12px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ textAlign: isRtl ? 'left' : 'right', display: 'none', md: 'block' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </p>
          </div>

          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid #094037', // لون تطبيقك الأخضر
            background: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 'bold', color: '#094037', fontSize: '0.9rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}