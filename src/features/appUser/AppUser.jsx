import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, Wallet, PlusCircle } from 'lucide-react'
import { appUsersService } from '../../service/ServiceLayer'
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

const LIMIT = 10

export default function AppUsers() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  const search = params.get('search') || ''
  const page   = Number(params.get('page') || 1)

  const [topUpOpen,   setTopUpOpen]   = useState(false)
  const [topUpTarget, setTopUpTarget] = useState(null)

  const columns = useMemo(() => [
    {
      title: t('appUsers.table.user'),
      key: 'name',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar
            src={user.image || (user.avatar?.startsWith('data:image') ? user.avatar : null)}
            name={user.name}
            initials={!user.image ? user.avatar : null}
            size="sm"
          />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{user.name}</p>
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
      key: 'balance',
      align: 'center',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Wallet size={14} style={{ color: '#094037' }} />
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: val > 0 ? '#094037' : 'var(--text-muted)',
          }}>
            {Number(val || 0).toLocaleString('ar-SY')} ل.س
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
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {new Date(val).toLocaleDateString()}
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
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: '#094037',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontFamily: 'Cairo, sans-serif',
          }}
          onClick={() => { setTopUpTarget(user); setTopUpOpen(true) }}
        >
          <PlusCircle size={14} />
          {t('appUsers.actions.topUp')}
        </PermissionButton>
      ),
    },
  ], [t])

  const { data, isLoading } = useQuery({
    queryKey: ['appUsers', search, page],
    queryFn: () => appUsersService.getList({ search, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const topUpMut = useMutation({
    mutationFn: ({ id, amount }) => appUsersService.topUpBalance(id, amount),
    onSuccess: () => {
      qc.invalidateQueries(['appUsers'])
      setTopUpOpen(false)
    },
  })

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1')
    return n
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <PageHeader
        title={t('appUsers.title')}
        subtitle={t('appUsers.subtitle', { count: data?.total ?? 0 })}
      />

      {/* Filter Card */}
      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '260px',
            height: '46px',
            borderRadius: '14px',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-muted)',
            paddingInline: '14px',
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder={t('appUsers.searchPlaceholder')}
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                fontFamily: 'Cairo, sans-serif',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--surface)' }}>

        {/* Card Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('appUsers.tableTitle')}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('appUsers.tableSubtitle')}
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={data?.data}
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

        {/* Pagination */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            total={data?.total ?? 0}
            limit={LIMIT}
            onPageChange={(next) => setParams(prev => {
              const n = new URLSearchParams(prev)
              n.set('page', String(next))
              return n
            })}
          />
        </div>
      </Card>

      {/* TopUp Modal */}
      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        user={topUpTarget}
        onConfirm={(amount) => topUpMut.mutate({ id: topUpTarget?.id, amount })}
        loading={topUpMut.isPending}
      />

    </div>
  )
}