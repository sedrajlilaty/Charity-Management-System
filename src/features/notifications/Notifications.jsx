import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CheckCheck,
  Heart,
  UserCheck,
  Megaphone,
  Settings,
  Clock,
} from 'lucide-react'

import { notificationsService } from '../../service/ServiceLayer'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { formatDateTime } from '../../utlis/helper'
import { useTheme } from '../../context/ThemeContext'

export default function Notifications() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { isDark } = useTheme()

  const TYPE_CONFIG = {
    donation: {
      icon: Heart,
      bg: 'rgba(34,197,94,0.12)',
      color: '#22c55e',
      label: t('notifications.types.donation'),
    },

    case: {
      icon: UserCheck,
      bg: 'rgba(59,130,246,0.12)',
      color: '#3b82f6',
      label: t('notifications.types.case'),
    },

    campaign: {
      icon: Megaphone,
      bg: 'rgba(234,179,8,0.12)',
      color: '#eab308',
      label: t('notifications.types.campaign'),
    },

    system: {
      icon: Settings,
      bg: 'var(--bg-muted)',
      color: 'var(--text-secondary)',
      label: t('notifications.types.system'),
    },
  }

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getList,
  })

  const markRead = useMutation({
    mutationFn: notificationsService.markRead,

    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
      qc.invalidateQueries([
        'notifications',
        'unread',
      ])
    },
  })

  const markAll = useMutation({
    mutationFn:
      notificationsService.markAllRead,

    onSuccess: () => {
      qc.invalidateQueries(['notifications'])
      qc.invalidateQueries([
        'notifications',
        'unread',
      ])
    },
  })

  const unread = list.filter((n) => !n.read)
  const read = list.filter((n) => n.read)

  if (isLoading) return <SpinnerPage />

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <PageHeader
        title={t('notifications.title')}
        subtitle={
          unread.length > 0
            ? t('notifications.unread', {
                count: unread.length,
              })
            : t('notifications.allRead')
        }
      >
        {unread.length > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="btn-primary"
            style={{
              background: '#094037',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 18px',
              boxShadow: isDark
                ? '0 4px 14px rgba(0,0,0,0.3)'
                : '0 4px 14px rgba(9,64,55,0.18)',
            }}
          >
            <CheckCheck size={15} />
            {t('notifications.markAllRead')}
          </button>
        )}
      </PageHeader>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap: '16px',
        }}
      >
        {/* Total */}
        <Card
          style={{
            padding: '22px',
            borderRadius: '24px',
            background: 'var(--surface)',
            border:
              '1px solid var(--border-default)',
            boxShadow: isDark
              ? '0 4px 18px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(9,64,55,0.08)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color:
                'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {t('notifications.total')}
          </p>

          <h2
            style={{
              margin: '10px 0 0',
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#094037',
            }}
          >
            {list.length}
          </h2>
        </Card>

        {/* Unread */}
        <Card
          style={{
            padding: '22px',
            borderRadius: '24px',
            background: 'var(--surface)',
            border:
              '1px solid var(--border-default)',
            boxShadow: isDark
              ? '0 4px 18px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(9,64,55,0.08)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color:
                'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {t(
              'notifications.unreadOnly'
            )}
          </p>

          <h2
            style={{
              margin: '10px 0 0',
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#eab308',
            }}
          >
            {unread.length}
          </h2>
        </Card>

        {/* Read */}
        <Card
          style={{
            padding: '22px',
            borderRadius: '24px',
            background: 'var(--surface)',
            border:
              '1px solid var(--border-default)',
            boxShadow: isDark
              ? '0 4px 18px rgba(0,0,0,0.25)'
              : '0 4px 16px rgba(9,64,55,0.08)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color:
                'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {t('notifications.read')}
          </p>

          <h2
            style={{
              margin: '10px 0 0',
              fontSize: '1.9rem',
              fontWeight: 800,
              color:
                'var(--text-primary)',
            }}
          >
            {read.length}
          </h2>
        </Card>
      </div>

      {/* Notifications */}
      <Card
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 0,
          background: 'var(--surface)',
          border:
            '1px solid var(--border-default)',
          boxShadow: isDark
            ? '0 4px 18px rgba(0,0,0,0.25)'
            : '0 4px 16px rgba(9,64,55,0.08)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom:
              '1px solid var(--border-subtle)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {t(
              'notifications.latestNotifications'
            )}
          </h3>

          <p
            style={{
              marginTop: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            متابعة آخر التنبيهات والإشعارات
          </p>
        </div>

        {/* List */}
        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {list.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color:
                  'var(--text-muted)',
              }}
            >
              <Bell
                size={42}
                style={{
                  margin:
                    '0 auto 12px',
                  opacity: 0.3,
                }}
              />

              <p>
                {t(
                  'notifications.empty'
                )}
              </p>
            </div>
          )}

          {/* Unread */}
          {unread.length > 0 && (
            <>
              <SectionTitle
                title={t(
                  'notifications.unreadLabel',
                  {
                    count:
                      unread.length,
                  }
                )}
                color="#094037"
              />

              {unread.map((n) => (
                <NotifCard
                  key={n.id}
                  notif={n}
                  onMarkRead={(id) =>
                    markRead.mutate(id)
                  }
                  typeConfig={
                    TYPE_CONFIG
                  }
                  t={t}
                  isDark={isDark}
                />
              ))}
            </>
          )}

          {/* Read */}
          {read.length > 0 && (
            <>
              <SectionTitle
                title={t(
                  'notifications.readLabel',
                  {
                    count:
                      read.length,
                  }
                )}
                color="var(--text-muted)"
              />

              {read.map((n) => (
                <NotifCard
                  key={n.id}
                  notif={n}
                  onMarkRead={(id) =>
                    markRead.mutate(id)
                  }
                  typeConfig={
                    TYPE_CONFIG
                  }
                  t={t}
                  isDark={isDark}
                />
              ))}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

function SectionTitle({
  title,
  color,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color,
        }}
      />

      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color:
            'var(--text-primary)',
        }}
      >
        {title}
      </span>
    </div>
  )
}

function NotifCard({
  notif,
  onMarkRead,
  typeConfig,
  t,
  isDark,
}) {
  const cfg =
    typeConfig[notif.type] ??
    typeConfig.system

  const Icon = cfg.icon

  return (
    <div
      style={{
        background: notif.read
          ? 'var(--surface)'
          : isDark
          ? 'rgba(9,64,55,0.18)'
          : 'rgba(9,64,55,0.06)',

        border: notif.read
          ? '1px solid var(--border-default)'
          : '1px solid rgba(9,64,55,0.15)',

        borderInlineStart:
          notif.read
            ? '1px solid var(--border-default)'
            : '4px solid #094037',

        borderRadius: '20px',
        padding: '18px',

        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',

        transition: '0.2s',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: cfg.bg,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          flexShrink: 0,
        }}
      >
        <Icon
          size={18}
          color={cfg.color}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',

            alignItems: 'center',

            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontWeight: notif.read
                  ? 600
                  : 700,

                color:
                  'var(--text-primary)',

                fontSize: '0.92rem',
              }}
            >
              {notif.title}
            </span>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '99px',
                background: cfg.bg,
                color: cfg.color,
              }}
            >
              {cfg.label}
            </span>
          </div>

          {!notif.read && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background:
                  '#094037',

                flexShrink: 0,
              }}
            />
          )}
        </div>

        <p
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.7,
            color:
              'var(--text-secondary)',

            marginBottom: '14px',
          }}
        >
          {notif.message}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',

            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color:
                'var(--text-muted)',
            }}
          >
            <Clock size={12} />

            <span
              style={{
                fontSize: '0.72rem',
              }}
            >
              {formatDateTime(
                notif.createdAt
              )}
            </span>
          </div>

          {!notif.read && (
            <button
              onClick={() =>
                onMarkRead(notif.id)
              }
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: 'none',

                background:
                  '#094037',

                color: '#fff',

                fontSize: '0.75rem',
                fontWeight: 700,

                cursor: 'pointer',

                fontFamily:
                  'Cairo,sans-serif',
              }}
            >
              {t(
                'notifications.markRead'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}