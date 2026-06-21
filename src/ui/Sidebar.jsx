// layout/Sidebar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Heart, UserCheck,
  Megaphone, Handshake, Settings, Bell, LogOut,
  HeartHandshake, Sparkles, HandHeart, X,Wallet,Smartphone  
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../utlis/helper'
import { Award } from 'lucide-react'
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
{ key: 'appUsers',  path: '/app-users',  icon: Smartphone,  routeKey: 'appUsers'  }, // ← جديد
  // { key: 'certificates',  path: '/certificates',  icon: Award,           routeKey: 'certificates'  },
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
  const isAIPage = location.pathname.includes('ai-assistant')

  const avIdx = (user?.name?.charCodeAt(0) ?? 0) % AV_COLORS.length
  const av = AV_COLORS[avIdx]

  const visibleItems = NAV_ITEMS.filter(item => canAccessRoute(item.routeKey))

  return (
    <>
      {!isDesktop && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(3px)',
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
          borderLeft: isRtl ? '1px solid #e5ece9' : 'none',
          borderRight: !isRtl ? '1px solid #e5ece9' : 'none',
          transform: open
            ? 'translateX(0)'
            : `translateX(${isRtl ? SIDEBAR_W : -SIDEBAR_W}px)`,

          transition: 'transform 0.22s ease',
          fontFamily: 'Cairo, sans-serif',
          overflow: 'hidden',
        }}
      >

        {/* Logo */}
        <div
          style={{
            padding: '28px 18px 22px',
            borderBottom: '1px solid #edf2f0',
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
                width: 32,
                height: 32,
                borderRadius: 10,
                border: '1px solid #e5ece9',
                 background: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#5b6b67',
              }}
            >
              <X size={16} />
            </button>
          )}

          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 24,
              background: 'var(--bg-surface)',
              border: '1px solid #d7e6df',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartHandshake size={34} color="#0a4a3e" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0a4a3e',
              }}
            >
              {t('brand.name')}
            </p>

            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}
            >
              {t('brand.subtitle')}
            </p>
          </div>

          <div
            style={{
              width: 46,
              height: 2,
              borderRadius: 999,
              background: '#c8ecdd',
            }}
          />
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1px 6px',
            scrollbarWidth: 'none',
          }}
        >
          <p
            style={{
              margin: '0 0 4px',
              padding: '0 6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94a3b8',
            }}
          >
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 16,
                  textDecoration: 'none',
                  transition: '0.2s',

                  background: isActive
                    ? '#0a4a3e'
                    : 'transparent',

                  color: isActive
                    ? '#ffffff'
                    : '#64748b',

                  border: isActive
                    ? '1px solid transparent'
                    : '1px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        flexShrink: 0,

                        background: isActive
                          ? 'rgba(255,255,255,0.14)'
                          : '#edf5f2',

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={18}
                        color={isActive ? '#ffffff' : '#0a4a3e'}
                        strokeWidth={2.2}
                      />
                    </span>

                    <span
                      style={{
                        flex: 1,
                        fontSize: '1rem',
                        fontWeight: isActive ? 700 : 600,
                      }}
                    >
                      {t(`nav.${key}`)}
                    </span>

                    {isActive && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#ffffff',
                        }}
                      />
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
            onClick={() => {
              navigate('/ai-assistant')
              if (!isDesktop) onClose?.()
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 16,
              border: '1px solid #dce8e3',
              background: '#f3f8f6',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#e8f4ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#0a4a3e" />
            </div>

            <div style={{ flex: 1, textAlign: 'start' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#0a4a3e',
                }}
              >
                {t('nav.ai')}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                }}
              >
                Gemini AI
              </p>
            </div>

            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
              }}
            />
          </button>
        </div>

        {/* User */}
        {user && (
          <div
            style={{
              padding: '10px',
              borderTop: '1px solid #edf2f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                border: '1px solid #e5ece9',
                borderRadius: 18,
                padding: '10px',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: av.bg,
                  color: av.text,
                  border: `1px solid ${av.border}`,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.avatar ?? user.name?.slice(0, 2)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                  }}
                >
                  {ROLE_LABEL[user.role]}
                </p>
              </div>

              <button
                onClick={logout}
                title={t('auth.logout')}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '1px solid #fee2e2',
                  background: '#fff5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ef4444',
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