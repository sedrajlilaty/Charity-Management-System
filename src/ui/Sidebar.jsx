// layout/Sidebar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Heart, UserCheck,
  Megaphone, Handshake, Settings, Bell, LogOut,
  Sparkles, HandHeart, X, Wallet, Smartphone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../utlis/helper'
import { Award } from 'lucide-react'
import logoGreen from '../assets/logo-green.png'
import logoYallo from '../assets/logo-yallo.png'

const SIDEBAR_W = 260

const NAV_ITEMS = [
  { key: 'dashboard',     path: '/',              icon: LayoutDashboard, routeKey: 'dashboard'     },
  { key: 'donations',     path: '/donations',     icon: Heart,           routeKey: 'donations'     },
  { key: 'beneficiaries', path: '/beneficiaries', icon: UserCheck,       routeKey: 'beneficiaries' },
  { key: 'campaigns',     path: '/campaigns',     icon: Megaphone,       routeKey: 'campaigns'     },
  { key: 'services',      path: '/services',      icon: Handshake,       routeKey: 'services'      },
  { key: 'users',         path: '/users',         icon: Users,           routeKey: 'users'         },
  { key: 'volunteers',    path: '/volunteers',    icon: HandHeart,     routeKey: 'volunteers'    },
  { key: 'wallet',    path: '/wallet',     icon: Wallet,      routeKey: 'wallet'    },
  { key: 'appUsers',  path: '/app-users',  icon: Smartphone,  routeKey: 'appUsers'  },
  { key: 'notifications', path: '/notifications', icon: Bell,            routeKey: 'notifications' },
  { key: 'settings',      path: '/settings',      icon: Settings,        routeKey: 'settings'      },
]

const AV_COLORS = [
  { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
  { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' },
  { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  { bg: '#ffedd5', text: '#ea580c', border: '#fdba74' },
  { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' },
]

export default function Sidebar({ open, onClose, isDesktop }) {
  const { t } = useTranslation()
  const { user, logout, canAccessRoute } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isRtl = document.documentElement.dir === 'rtl'

  const avIdx = (user?.name?.charCodeAt(0) ?? 0) % AV_COLORS.length
  const av = AV_COLORS[avIdx]

  const visibleItems = NAV_ITEMS.filter(item => canAccessRoute(item.routeKey))

  return (
    <>
      {!isDesktop && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          [isRtl ? 'right' : 'left']: 0,
          width: `${SIDEBAR_W}px`,
          height: '100vh',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderLeft: isRtl ? '1px solid var(--border-default)' : 'none',
          borderRight: !isRtl ? '1px solid var(--border-default)' : 'none',
          transform: open ? 'translateX(0)' : `translateX(${isRtl ? SIDEBAR_W : -SIDEBAR_W}px)`,
          transition: 'transform 0.22s ease',
          fontFamily: 'Cairo, sans-serif',
          overflow: 'hidden',
        }}
      >

        {/* Logo + اسم الجمعية */}
        <div
          style={{
            padding: '28px 18px 22px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface)',
            position: 'relative',
          }}
        >
          {!isDesktop && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 14,
                [isRtl ? 'left' : 'right']: 14,
                width: 32, height: 32, borderRadius: 10,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={16} />
            </button>
          )}

          <div
            style={{
              width: 74, height: 74, borderRadius: 24,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 12,
            }}
          >
            {/* لوغو أخضر بالفاتح، أصفر بالدارك */}
            <img src={logoGreen} alt="عطاء" className="logo-light" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <img src={logoYallo} alt="عطاء" className="logo-dark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-primary-500)' }}>
              {t('brand.name')}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-hint)' }}>
              {t('brand.subtitle')}
            </p>
          </div>

          <div style={{ width: 46, height: 2, borderRadius: 999, background: 'var(--border-default)' }} />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '1px 6px', scrollbarWidth: 'none' }}>
          <p style={{ margin: '0 0 4px', padding: '0 6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-hint)' }}>
            {t('nav.mainNav')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleItems.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
                end={path === '/'}
                onClick={!isDesktop ? onClose : undefined}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 16,
                  textDecoration: 'none', transition: '0.2s',
                  background: isActive ? 'var(--color-primary-500)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                        background: isActive ? 'rgba(255,255,255,0.14)' : 'var(--bg-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={isActive ? '#ffffff' : 'var(--color-primary-500)'} strokeWidth={2.2} />
                    </span>

                    <span style={{ flex: 1, fontSize: '1rem', fontWeight: isActive ? 700 : 600 }}>
                      {t(`nav.${key}`)}
                    </span>

                    {isActive && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* AI */}
        <div style={{ padding: '8px 10px' }}>
          <button
            onClick={() => { navigate('/ai-assistant'); if (!isDesktop) onClose?.() }}
            style={{
              width: '100%', padding: '12px', borderRadius: 16,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-muted)',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="var(--color-primary-500)" />
            </div>
            <div style={{ flex: 1, textAlign: 'start' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-500)' }}>
                {t('nav.ai')}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-hint)' }}>Gemini AI</p>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          </button>
        </div>

        {/* User */}
        {user && (
          <div style={{ padding: '10px', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 18, padding: '10px' }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: av.bg, color: av.text, border: `1px solid ${av.border}`,
                  fontSize: '0.82rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {user.avatar ?? user.name?.slice(0, 2)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-hint)' }}>
                  {ROLE_LABEL[user.role]}
                </p>
              </div>

              <button
                onClick={logout}
                title={t('auth.logout')}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: '1px solid #fee2e2', background: '#fff5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#ef4444',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}