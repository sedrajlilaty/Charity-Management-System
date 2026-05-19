import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Heart,
  UserCheck,
  Megaphone,
  Handshake,
  Settings,
  Bell,
  LogOut,
  HeartHandshake,
  Sparkles,
  HandHeart,
  X,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../utlis/helper'

const SIDEBAR_W = 260

const COLORS = {
  sidebarBg: 'var(--bg-surface)',
  cardBg: '#ffffff',

  primary: '#0b4b43',
  primarySoft: '#e7f3ef',
  primaryBorder: '#cfe5de',

  text: '#16332d',
  textSoft: '#5f746f',
  textMuted: '#94a3a0',

  hover: '#eef5f3',
  active: '#0b4b43',

  gold: '#d4a017',
  danger: '#dc2626',

  border: '#e3ece8',
}

const NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'donations', path: '/donations', icon: Heart },
  { key: 'beneficiaries', path: '/beneficiaries', icon: UserCheck },
  { key: 'campaigns', path: '/campaigns', icon: Megaphone },
  { key: 'services', path: '/services', icon: Handshake },
  { key: 'users', path: '/users', icon: Users },
  { key: 'volunteers', path: '/volunteers', icon: HandHeart },
  { key: 'notifications', path: '/notifications', icon: Bell },
  { key: 'settings', path: '/settings', icon: Settings },
]

const AV_COLORS = [
  {
    bg: 'rgba(234,179,8,0.16)',
    text: '#d4a017',
    border: 'rgba(234,179,8,0.28)',
  },
  {
    bg: 'rgba(96,165,250,0.16)',
    text: '#3b82f6',
    border: 'rgba(96,165,250,0.28)',
  },
  {
    bg: 'rgba(52,211,153,0.16)',
    text: '#10b981',
    border: 'rgba(52,211,153,0.28)',
  },
  {
    bg: 'rgba(251,146,60,0.16)',
    text: '#f97316',
    border: 'rgba(251,146,60,0.28)',
  },
  {
    bg: 'rgba(192,132,252,0.16)',
    text: '#a855f7',
    border: 'rgba(192,132,252,0.28)',
  },
]

export default function Sidebar({ open, onClose, isDesktop }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const isRtl = document.documentElement.dir === 'rtl'
  const isAIPage = location.pathname.includes('ai-assistant')

  const avIdx = (user?.name?.charCodeAt(0) ?? 0) % AV_COLORS.length
  const av = AV_COLORS[avIdx]

  return (
    <>
      {/* Mobile Backdrop */}
      {!isDesktop && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            background: 'rgba(0,0,0,0.28)',
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

          background: COLORS.sidebarBg,

          borderLeft: isRtl ? `1px solid ${COLORS.border}` : 'none',
          borderRight: !isRtl ? `1px solid ${COLORS.border}` : 'none',

          transform: open
            ? 'translateX(0)'
            : `translateX(${isRtl ? SIDEBAR_W : -SIDEBAR_W}px)`,

          transition: 'transform 0.22s cubic-bezier(.4,0,.2,1)',

          boxShadow: !isDesktop && open
            ? '0 10px 40px rgba(0,0,0,0.12)'
            : 'none',

          fontFamily: 'Cairo, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* ═════════════════ Logo Section ═════════════════ */}
        <div
          style={{
            background: COLORS.sidebarBg,
            padding: '24px 16px 20px',

            borderBottom: `1px solid ${COLORS.border}`,

            flexShrink: 0,

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',

            position: 'relative',
          }}
        >
          {/* Mobile Close Button */}
          {!isDesktop && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 12,
                [isRtl ? 'left' : 'right']: 12,

                width: 30,
                height: 30,

                borderRadius: 10,

                background: '#ffffff',

                border: `1px solid ${COLORS.border}`,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                cursor: 'pointer',

                color: COLORS.textMuted,
              }}
            >
              <X size={15} />
            </button>
          )}

          {/* Logo */}
          <div
            style={{
              width: 76,
              height: 76,

              borderRadius: 24,

              background: COLORS.primarySoft,

              border: `2px solid ${COLORS.primaryBorder}`,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartHandshake size={34} color={COLORS.primary} />
          </div>

          {/* Brand */}
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                color: COLORS.primary,
                lineHeight: 1.3,
              }}
            >
              {t('brand.name')}
            </p>

            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.75rem',
                color: COLORS.textMuted,
                lineHeight: 1.3,
              }}
            >
              {t('brand.subtitle')}
            </p>
          </div>

          {/* Decorative Divider */}
          <div
            style={{
              width: 46,
              height: 3,

              background: `linear-gradient(
                90deg,
                transparent,
                ${COLORS.primary},
                transparent
              )`,

              borderRadius: 999,
              opacity: 0.25,
            }}
          />
        </div>

        {/* ═════════════════ Navigation ═════════════════ */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',

            padding: '10px 10px',

            scrollbarWidth: 'none',
          }}
        >
          <p
            style={{
              margin: '0 0 6px',
              padding: '0 10px',

              fontSize: '0.75rem',
              fontWeight: 800,

              color: COLORS.textMuted,

              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {t('nav.mainNav')}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
                end={path === '/'}
                onClick={!isDesktop ? onClose : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',

                  padding: '11px 12px',

                  borderRadius: '16px',

                  fontSize: '1rem',

                  fontWeight: isActive ? 700 : 600,

                  textDecoration: 'none',

                  background: isActive
                    ? COLORS.active
                    : 'transparent',

                  color: isActive
                    ? '#ffffff'
                    : COLORS.textSoft,

                  boxShadow: isActive
                    ? '0 10px 24px rgba(11,75,67,0.16)'
                    : 'none',

                  transition: 'all 0.18s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* Icon */}
                    <span
                      style={{
                        width: 36,
                        height: 36,

                        borderRadius: 12,

                        flexShrink: 0,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        background: isActive
                          ? 'rgba(255,255,255,0.14)'
                          : COLORS.primarySoft,

                        transition: '0.2s',
                      }}
                    >
                      <Icon
                        size={17}
                        color={isActive ? '#ffffff' : COLORS.primary}
                        strokeWidth={2.2}
                      />
                    </span>

                    {/* Text */}
                    <span style={{ flex: 1 }}>
                      {t(`nav.${key}`)}
                    </span>

                    {/* Active Dot */}
                    {isActive && (
                      <span
                        style={{
                          width: 7,
                          height: 7,

                          borderRadius: '50%',

                          background: '#ffffff',

                          flexShrink: 0,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ═════════════════ AI Assistant ═════════════════ */}
        <div
          style={{
            padding: '6px 10px 8px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              navigate('/ai-assistant')

              if (!isDesktop) onClose?.()
            }}
            style={{
              width: '100%',

              padding: '12px',

              borderRadius: 16,

              border: `1px solid ${COLORS.border}`,

              cursor: 'pointer',

              display: 'flex',
              alignItems: 'center',
              gap: 12,

              fontFamily: 'Cairo, sans-serif',

              background: isAIPage
                ? COLORS.primarySoft
                : '#ffffff',

              transition: 'all 0.2s',

              boxShadow: '0 3px 12px rgba(0,0,0,0.03)',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 34,
                height: 34,

                borderRadius: 12,

                flexShrink: 0,

                background: COLORS.primarySoft,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={15} color={COLORS.primary} />
            </div>

            {/* Text */}
            <div
              style={{
                flex: 1,
                textAlign: 'start',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: COLORS.primary,
                  lineHeight: 1.3,
                }}
              >
                {t('nav.ai')}
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.64rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.3,
                }}
              >
                Gemini AI
              </p>
            </div>

            {/* Online Dot */}
            <span
              style={{
                width: 8,
                height: 8,

                borderRadius: '50%',

                background: '#22c55e',

                boxShadow: '0 0 8px rgba(34,197,94,0.55)',

                flexShrink: 0,
              }}
            />
          </button>
        </div>

        {/* ═════════════════ User Card ═════════════════ */}
        {user && (
          <div
            style={{
              padding: '10px',
              borderTop: `1px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,

                background: '#ffffff',

                borderRadius: 16,

                padding: '10px 12px',

                border: `1px solid ${COLORS.border}`,

                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,

                  borderRadius: '50%',

                  flexShrink: 0,

                  background: av.bg,
                  color: av.text,

                  border: `1.5px solid ${av.border}`,

                  fontSize: '0.82rem',
                  fontWeight: 800,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.avatar ?? user.name?.slice(0, 2)}
              </div>

              {/* User Info */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,

                    fontSize: '0.82rem',
                    fontWeight: 700,

                    color: COLORS.text,

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
                    fontSize: '0.66rem',
                    color: COLORS.textMuted,
                  }}
                >
                  {ROLE_LABEL[user.role]}
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                title={t('auth.logout')}
                style={{
                  background: 'rgba(239,68,68,0.08)',

                  border: '1px solid rgba(239,68,68,0.14)',

                  borderRadius: 10,

                  cursor: 'pointer',

                  width: 32,
                  height: 32,

                  flexShrink: 0,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  color: '#ef4444',

                  transition: 'all 0.18s',
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