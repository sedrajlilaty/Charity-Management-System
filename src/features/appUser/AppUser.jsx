import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Wallet, PlusCircle } from 'lucide-react'
import { useAppUsers, useAddBalanceToUser } from '../../hooks/useUsers'
import { Avatar } from '../../ui/Avatar'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import DataTable from '../../ui/DataTable'
import TopUpModal from './TopUpModal'
import Pagination from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000/storage'
const LIMIT = 10

// بيبني URL الصورة الكامل
const avatarSrc = (user) => {
  if (!user.profile_image) return null
  if (user.profile_image.startsWith('http')) return user.profile_image
  return `${STORAGE_URL}/${user.profile_image}`
}

// اسم كامل
const fullName = (user) =>
  `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.name || '—'

export default function AppUsers() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const search = params.get('search') || ''
  const page   = Number(params.get('page') || 1)

  const [topUpOpen,   setTopUpOpen]   = useState(false)
  const [topUpTarget, setTopUpTarget] = useState(null)

  const topUpMut = useAddBalanceToUser()

  const handleTopUp = (amount, currency) => {
    topUpMut.mutate(
      { userId: topUpTarget?.id, amount, currency },
      { onSuccess: () => setTopUpOpen(false) }
    )
  }

  const { data: users = [], isLoading } = useAppUsers()

  // فلتر السيرش من الفرونت
  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      fullName(u).toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    )
  }, [users, search])

  const total    = filtered.length
  const pageData = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  const columns = useMemo(() => [
    {
      title: t('appUsers.table.user'),
      key: 'first_name',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar
            src={avatarSrc(user)}
            name={fullName(user)}
            size="sm"
          />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {fullName(user)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user.email || user.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t('appUsers.table.contact'),
      key: 'phone',
      align: 'center',
      render: (val, user) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
          {user.phone && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', direction: 'ltr', fontWeight: 'bold' }}>
              {user.phone}
            </span>
          )}
          {user.email && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {user.email}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('appUsers.table.balance'),
      key: 'balances',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wallet size={14} style={{ color: '#094037' }} />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: user.balances?.USD > 0 ? '#094037' : 'var(--text-muted)',
          }}>
            {Number(user.balances?.USD || 0).toLocaleString('en-US')} $
          </span>
        </div>
      ),
    },
    {
      title: t('appUsers.table.status'),
      key: 'status',
      align: 'center',
      render: (val) => <Badge status={val} />,
    },
    {
      title: t('appUsers.table.joinedAt'),
      key: 'created_at',
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: t('appUsers.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, user) => (
        <PermissionButton
          style={{
            padding: '6px 14px', borderRadius: '8px',
            backgroundColor: '#094037', color: '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif',
          }}
          onClick={() => { setTopUpTarget(user); setTopUpOpen(true) }}
        >
          <PlusCircle size={14} />
          {t('appUsers.actions.topUp')}
        </PermissionButton>
      ),
    },
  ], [t])

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1')
    return n
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <PageHeader
        title={t('appUsers.title')}
        subtitle={t('appUsers.subtitle', { count: total })}
      />

      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '260px', height: '46px', borderRadius: '14px', border: '1px solid var(--border-default)', background: 'var(--bg-muted)', paddingInline: '14px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder={t('appUsers.searchPlaceholder')}
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif' }}
            />
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--surface)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('appUsers.tableTitle')}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('appUsers.tableSubtitle')}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={pageData}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={
            <EmptyState
              icon={Wallet}
              title={t('appUsers.empty.title')}
              description={t('appUsers.empty.description')}
            />
          }
        />

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={(next) => setParams(prev => {
              const n = new URLSearchParams(prev)
              n.set('page', String(next))
              return n
            })}
          />
        </div>
      </Card>

      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        user={topUpTarget}
        onConfirm={handleTopUp}
        loading={topUpMut.isPending}
      />
    </div>
  )
}