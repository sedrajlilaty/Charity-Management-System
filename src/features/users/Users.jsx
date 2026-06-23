// src/pages/users/Users.jsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserPlus, Search, Shield, Edit2, Trash2 } from 'lucide-react'
import { Avatar } from '../../ui/Avatar'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import DataTable from '../../ui/DataTable'
import UserModal from './UserModal'
import DeleteConfirm from './DeleteConfirmModal'
import Pagination from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'
import {
  useAllNonUserAccounts,
  useCreateEmployee,
  useApproveUser,
  useSetPending,
  usePromoteUser,
  useDemoteUser,
} from '../../hooks/useUsers'

// ── مساعد لتوحيد الاسم الكامل ──────────────────────────────
const fullName = (user) =>
  `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.name || '—'

// ── رول → label ────────────────────────────────────────────
const ROLE_LABEL = {
  admin:        'Admin',
  sub_admin:    'Supervisor',
  field_worker: 'Field Worker',
}

const LIMIT = 10

export default function Users() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const search    = params.get('search') || ''
  const roleFilter = params.get('role')  || ''
  const page      = Number(params.get('page') || 1)

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editUser,     setEditUser]     = useState(null)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Tabs — بدون user (هم بصفحة منفصلة) ──────────────────
  const ROLE_TABS = [
    { key: '',             label: t('users.tabs.all') },
    { key: 'admin',        label: t('users.tabs.admin') },
    { key: 'sub_admin',    label: t('users.tabs.supervisor',    { defaultValue: 'مشرفين' }) },
    { key: 'field_worker', label: t('users.tabs.fieldWorker') },
  ]

  // ── جلب بيانات الداشبورد فقط (admin + sub_admin + field_worker) ──
  const { data: allData = [], isLoading } = useAllNonUserAccounts()

  // ── فلترة الرول والسيرش من جهة الفرونت ──────────────────
  const filtered = useMemo(() => {
    let result = allData

    // فلتر الرول
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter)
    }

    // فلتر السيرش
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        fullName(u).toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      )
    }

    return result
  }, [allData, roleFilter, search])

  // ── Pagination من جهة الفرونت ─────────────────────────────
  const total    = filtered.length
  const pageData = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  // ── Mutations ─────────────────────────────────────────────
  const createMut  = useCreateEmployee()
  const promoteMut = usePromoteUser()
  const demoteMut  = useDemoteUser()
  const approveMut = useApproveUser()
  const pendingMut = useSetPending()

  // ── إنشاء موظف ───────────────────────────────────────────
  const handleSave = async (form) => {
    if (editUser) {
      // ── تعديل ────────────────────────────────────────────
      let changed = false

      // تغيير الرول
      if (form.role !== editUser.role) {
        try {
          if (form.role === 'user') {
            await demoteMut.mutateAsync(editUser.id)
          } else {
            await promoteMut.mutateAsync({ id: editUser.id, role: form.role })
          }
          changed = true
        } catch (err) {
          toast.error(err?.response?.data?.message ?? t('users.toast.roleError', { defaultValue: 'فشل تغيير الصلاحية' }))
          return
        }
      }

      // تغيير الحالة
      if (form.status !== editUser.status) {
        try {
          if (form.status === 'approved')       await approveMut.mutateAsync(editUser.id)
          else if (form.status === 'rejected')  await pendingMut.mutateAsync(editUser.id) // setPending بديل لـ reject
          else if (form.status === 'pending')   await pendingMut.mutateAsync(editUser.id)
          changed = true
        } catch (err) {
          toast.error(err?.response?.data?.message ?? t('users.toast.statusError', { defaultValue: 'فشل تغيير الحالة' }))
          return
          return
        }
      }

      if (changed) {
        toast.success(t('users.toast.updateSuccess', { defaultValue: 'تم تحديث المستخدم بنجاح ✅' }))
      } else {
        toast(t('users.toast.noChange', { defaultValue: 'لم يتم إجراء أي تغيير' }))
      }

    } else {
      // ── إنشاء ────────────────────────────────────────────
      try {
        await createMut.mutateAsync({
          first_name:            form.first_name,
          last_name:             form.last_name,
          email:                 form.email,
          phone:                 form.phone,
          password:              form.password,
          password_confirmation: form.password,
          role:                  form.role,
          status:                form.status,
          profile_image:         form.profile_image,
        })
        toast.success(t('users.toast.createSuccess', { defaultValue: 'تمت إضافة الموظف بنجاح ✅' }))
      } catch (err) {
        toast.error(err?.response?.data?.message ?? t('users.toast.createError', { defaultValue: 'فشلت إضافة الموظف' }))
        throw err // عشان المودال ما يقفل
      }
    }
  }

  // ── Toggle Status ─────────────────────────────────────────
  const handleToggleStatus = (user) => {
    if (user.status === 'approved') {
      pendingMut.mutate(user.id, {
        onSuccess: () => toast.success(t('users.toast.suspended', { defaultValue: 'تم تعليق الحساب' })),
        onError:   (err) => toast.error(err?.response?.data?.message ?? t('users.toast.error', { defaultValue: 'حدث خطأ' })),
      })
    } else {
      approveMut.mutate(user.id, {
        onSuccess: () => toast.success(t('users.toast.activated', { defaultValue: 'تم تفعيل الحساب' })),
        onError:   (err) => toast.error(err?.response?.data?.message ?? t('users.toast.error', { defaultValue: 'حدث خطأ' })),
      })
    }
  }

  // ── حذف (reject) ──────────────────────────────────────────
  const handleDelete = () => {
    pendingMut.mutate(deleteTarget?.id, {
      onSuccess: () => {
        toast.success(t('users.toast.deleteSuccess', { defaultValue: 'تم تعليق الحساب بنجاح' }))
        setDeleteOpen(false)
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? t('users.toast.deleteError', { defaultValue: 'فشل العملية' }))
      },
    })
  }

  // ── الأعمدة ───────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      title: t('users.table.user'),
      key: 'first_name',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar
            src={user.profile_image ? `${import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000/storage'}/${user.profile_image}` : null}
            name={fullName(user)}
            size="sm"
          />
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {fullName(user)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: t('users.table.role'),
      key: 'role',
      align: 'center',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          <Shield size={13} style={{ color: '#094037' }} />
          {ROLE_LABEL[val] ?? val}
        </div>
      ),
    },
    {
      title: t('users.table.phone'),
      key: 'phone',
      align: 'center',
      render: (val) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', direction: 'ltr', fontWeight: 'bold' }}>
          {val ?? '—'}
        </span>
      ),
    },
    {
      title: t('users.table.status'),
      key: 'status',
      align: 'center',
      render: (val, user) => (
        <PermissionButton
          onClick={() => handleToggleStatus(user)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Badge status={val} />
        </PermissionButton>
      ),
    },
    {
      title: t('users.table.joinedAt'),
      key: 'created_at',
      render: (val) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      title: t('users.table.actions'),
      key: 'actions',
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <PermissionButton
            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#eab308', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setEditUser(user); setModalOpen(true) }}
          >
            {t('users.actions.edit')} <Edit2 size={14} />
          </PermissionButton>
          <PermissionButton
            style={{ padding: '6px 12px', borderRadius: '8px', color: '#ef4444', background: 'transparent', border: '1px solid #ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setDeleteTarget(user); setDeleteOpen(true) }}
          >
            {t('users.actions.delete')} <Trash2 size={14} />
          </PermissionButton>
        </div>
      ),
    },
  ], [t, approveMut, pendingMut])

  const setParam = (key, value) =>
    setParams(prev => {
      const n = new URLSearchParams(prev)
      if (value) n.set(key, value); else n.delete(key)
      n.set('page', '1')
      return n
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle', { count: total })}
      >
        <PermissionButton
          className="btn-primary"
          onClick={() => { setEditUser(null); setModalOpen(true) }}
          style={{ background: 'var(--color-secondary-500)', color: '#111', borderRadius: '14px', padding: '10px 18px' }}
        >
          <UserPlus size={15} />
          {t('users.addBtn')}
        </PermissionButton>
      </PageHeader>

      {/* Filter Card */}
      <Card style={{ padding: '16px', borderRadius: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ROLE_TABS.map(tab => (
              <PermissionButton
                key={tab.key}
                onClick={() => setParam('role', tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 18px', borderRadius: '14px',
                  border: roleFilter === tab.key ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
                  background: roleFilter === tab.key ? 'var(--color-primary-50)' : 'transparent',
                  color: roleFilter === tab.key ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                  fontWeight: roleFilter === tab.key ? 700 : 500,
                  fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', fontFamily: 'Cairo,sans-serif',
                }}
              >
                {tab.label}
              </PermissionButton>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '260px', height: '46px', borderRadius: '14px', border: '1px solid var(--border-default)', background: 'var(--bg-muted)', paddingInline: '14px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder={t('users.searchPlaceholder')}
              value={search}
              onChange={e => setParam('search', e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'Cairo,sans-serif' }}
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card style={{ borderRadius: '24px', overflow: 'hidden', padding: 0, background: 'var(--surface)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('users.tableTitle')}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('users.tableSubtitle', { defaultValue: 'موظفو ومشرفو لوحة التحكم' })}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={pageData}
          isLoading={isLoading}
          loadingComponent={<SpinnerPage />}
          EmptyComponent={
            <EmptyState
              icon={UserPlus}
              title={t('users.empty.title')}
              description={t('users.empty.description')}
            />
          }
        />

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={next =>
              setParams(prev => {
                const n = new URLSearchParams(prev)
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
        onConfirm={handleDelete}
        userName={deleteTarget ? fullName(deleteTarget) : ''}
        loading={pendingMut.isPending}
      />
    </div>
  )
}