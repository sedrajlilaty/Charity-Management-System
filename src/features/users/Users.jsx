
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Search, Shield, Edit2, Trash2 } from 'lucide-react'
import { usersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { ROLE_LABEL } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import DataTable from '../../ui/DataTable' // تأكدي من مسار الاستيراد الصحيح
import UserModal from './UserModal'
import DeleteConfirm from './DeleteConfirmModal'
import Pagination from '../../ui/Pagination'

const LIMIT = 10

export default function Users() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  const search = params.get('search') || ''
  const role   = params.get('role')   || ''
  const page   = Number(params.get('page') || 1)

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editUser,     setEditUser]     = useState(null)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const ROLE_TABS = [
    { key: '',           label: t('users.tabs.all') },
    { key: 'admin',       label: t('users.tabs.admin') },
    { key: 'fieldWorker', label: t('users.tabs.fieldWorker') },
  ]

  // تعريف الأعمدة باستخدام useMemo للأداء المثالي
  const columns = useMemo(() => [
    {
      title: t('users.table.user'),
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
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>
      )
    },
    {
      title: t('users.table.role'),
      key: 'role',
      align: 'center',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          <Shield size={13} style={{ color: '#094037' }} />
          {ROLE_LABEL[val]}
        </div>
      )
    },
    {
      title: t('users.table.phone'),
      key: 'phone',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', direction: 'ltr', fontWeight: 'bold' }}>
          {val}
        </span>
      )
    },
    {
      title: t('users.table.status'),
      key: 'status',
      align: 'center',
      render: (val, user) => (
        <button 
          onClick={() => toggleMut.mutate({ id: user.id, status: user.status })} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Badge status={val} />
        </button>
      )
    },
    {
      title: t('users.table.joinedAt'),
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {new Date(val).toLocaleDateString()}
        </span>
      )
    },
    {
      title: t('users.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button 
            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#eab308', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setEditUser(user); setModalOpen(true) }}>
            {t('users.actions.edit')} <Edit2 size={14} />
          </button>
          <button 
            style={{ padding: '6px', borderRadius: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setDeleteTarget(user); setDeleteOpen(true) }}>
            {t('users.actions.delete')} <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ], [t])

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, role, page],
    queryFn: () => usersService.getList({ search, role, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const createMut = useMutation({ mutationFn: (p) => usersService.create(p), onSuccess: () => qc.invalidateQueries(['users']) })
  const updateMut = useMutation({ mutationFn: (p) => usersService.update(p.id, p), onSuccess: () => qc.invalidateQueries(['users']) })
  const deleteMut = useMutation({ mutationFn: (id) => usersService.remove(id), onSuccess: () => { qc.invalidateQueries(['users']); setDeleteOpen(false) } })
  const toggleMut = useMutation({ mutationFn: ({ id, status }) => usersService.changeStatus(id, status === 'active' ? 'inactive' : 'active'), onSuccess: () => qc.invalidateQueries(['users']) })

  const handleSave = (form) => {
    if (editUser) updateMut.mutate({ ...form, id: editUser.id })
    else createMut.mutate({ ...form, avatar: form.image ? form.image : form.name.slice(0, 2), createdAt: new Date().toISOString().split('T')[0] })
  }

  const setParam = (key, value) => setParams(prev => {
    const n = new URLSearchParams(prev)
    if (value) n.set(key, value); else n.delete(key)
    n.set('page', '1')
    return n
  })


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
      title={t('users.title')}
      subtitle={t('users.subtitle', {
        count: data?.total ?? 0,
      })}
    >
      <button
        className="btn-primary"
        onClick={() => {
          setEditUser(null)
          setModalOpen(true)
        }}
        style={{
          background: 'var(--color-secondary-500)',
color:'#111',
          borderRadius: '14px',
          padding: '10px 18px',
        }}
      >
        <UserPlus size={15} />
        {t('users.addBtn')}
      </button>
    </PageHeader>

    {/* Filter Card */}
    <Card
      style={{
        padding: '16px',
        borderRadius: '24px',
        background: 'var(--surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setParam('role', tab.key)
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: '14px',
                border:
                  role === tab.key
                    ? '1px solid var(--color-primary-100)'
                    : '1px solid var(--border-subtle)',
                background:
                  role === tab.key
                    ? 'var(--color-primary-50)'
                    : 'transparent',
                color:
                  role === tab.key
                    ? 'var(--color-primary-700)'
                    : 'var(--text-secondary)',
                fontWeight:
                  role === tab.key ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: '0.2s',
                fontFamily: 'Cairo,sans-serif',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '260px',
            height: '46px',
            borderRadius: '14px',
            border:
              '1px solid var(--border-default)',
            background: 'var(--bg-muted)',
            paddingInline: '14px',
          }}
        >
          <Search
            size={16}
            style={{
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          />

          <input
            placeholder={t(
              'users.searchPlaceholder'
            )}
            value={search}
            onChange={(e) =>
              setParam('search', e.target.value)
            }
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              fontFamily: 'Cairo,sans-serif',
            }}
          />
        </div>
      </div>
    </Card>

    {/* Table Card */}
    <Card
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 0,
        background: 'var(--surface)',
      }}
    >
      {/* Card Header */}
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
          {t('users.tableTitle')}
        </h3>

        <p
          style={{
            marginTop: '6px',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
          }}
        >
          إدارة وعرض بيانات المستخدمين
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
            icon={UserPlus}
            title={t('users.empty.title')}
            description={t(
              'users.empty.description'
            )}
          />
        }
      />

      {/* Pagination */}
      <div
        style={{
          padding: '20px 24px',
          borderTop:
            '1px solid var(--border-subtle)',
        }}
      >
        <Pagination
          page={page}
          total={data?.total ?? 0}
          limit={LIMIT}
          onPageChange={(next) =>
            setParams((prev) => {
              const n =
                new URLSearchParams(prev)

              n.set('page', String(next))

              return n
            })
          }
        />
      </div>
    </Card>

    {/* Modals */}
    <UserModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      onSave={handleSave}
      editUser={editUser}
    />

    <DeleteConfirm
      open={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={() =>
        deleteMut.mutate(deleteTarget?.id)
      }
      userName={deleteTarget?.name}
      loading={deleteMut.isPending}
    />
  </div>
)


}

