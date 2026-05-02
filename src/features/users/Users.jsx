import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Search, Shield, Edit2, Trash2, Icon } from 'lucide-react'
import { usersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { ROLE_LABEL, STATUS_LABEL } from '../../utlis/helper'
import {EmptyState} from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import UserModal    from './UserModal'
import DeleteConfirm from './DeleteConfirmModal'
import Pagination from '../../ui/Pagination'

const LIMIT = 10

export default function Users() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const role = params.get('role') || ''
  const page = Number(params.get('page') || 1)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editUser,    setEditUser]    = useState(null)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [deleteTarget,setDeleteTarget]= useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, role, page],
    queryFn:  () => usersService.getList({ search, role, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const createMut = useMutation({
    mutationFn: (payload) => usersService.create(payload),
    onSuccess:  () => qc.invalidateQueries(['users']),
  })
  const updateMut = useMutation({
    mutationFn: (payload) => usersService.update(payload.id, payload),
    onSuccess:  () => qc.invalidateQueries(['users']),
  })
  const deleteMut = useMutation({
    mutationFn: (id) => usersService.remove(id),
    onSuccess:  () => { qc.invalidateQueries(['users']); setDeleteOpen(false) },
  })
  const toggleMut = useMutation({
    mutationFn: ({ id, status }) => usersService.changeStatus(id, status === 'active' ? 'inactive' : 'active'),
    onSuccess:  () => qc.invalidateQueries(['users']),
  })

  const openAdd  = () => { setEditUser(null); setModalOpen(true) }
  const openEdit = (u) => { setEditUser(u);   setModalOpen(true) }
  const openDel  = (u) => { setDeleteTarget(u); setDeleteOpen(true) }

  const handleSave = (form) => {
    if (editUser) updateMut.mutate({ ...form, id: editUser.id })
    else          createMut.mutate({ ...form, avatar: form.name.slice(0,2), createdAt: new Date().toISOString().split('T')[0] })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <PageHeader title={t('nav.users')} subtitle={`${data?.total ?? 0} users`}>
        <button className="btn-primary" onClick={openAdd}><UserPlus size={15} />{t('common.add')}</button>
      </PageHeader>

      {/* Filters */}
      <Card className='bg-[#s]' style={{ backgroundColor: '#e6f0ee' }}>
        <div className="card-body" style={{ padding:'12px 20px', display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-muted)', borderRadius:'10px', padding:'8px 12px', flex:'1', minWidth:'200px', maxWidth:'300px' }}>
            <Search size={14} style={{ color:'var(--text-muted)', flexShrink:0 }} />
            <input style={{ background:'transparent', border:'none', outline:'none', fontSize:'0.85rem', color:'var(--text-primary)', width:'100%', fontFamily:'Cairo,sans-serif' }}
              placeholder="Search by name or email..."
              value={search} onChange={e => setParams(prev => {
                const next = new URLSearchParams(prev)
                if (e.target.value) next.set('search', e.target.value)
                else next.delete('search')
                next.set('page', '1')
                return next
              })}
            />
          </div>
          <select className="input" style={{ width:'160px', fontSize:'0.85rem' }}
            value={role} onChange={e => setParams(prev => {
              const next = new URLSearchParams(prev)
              if (e.target.value) next.set('role', e.target.value)
              else next.delete('role')
              next.set('page', '1')
              return next
            })}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="fieldWorker">Field Worker</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className='bg-[#e6f0ee]' style={{ backgroundColor: '#e6f0ee' }}>
        {isLoading ? <SpinnerPage /> : data?.data.length === 0 ? (
          <EmptyState icon={UserPlus} title="No users found" description="Start by adding a new user."
            action={<button className="btn-primary" onClick={openAdd}><UserPlus size={14} />Add user</button>}
          />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table bg-[#fff]" style={{ backgroundColor: '#fff' }}>
              <thead><tr>
                <th className='text-[#0D5247] font-bold text-base'>User</th>
                <th className='text-[#0D5247] font-bold text-base'>Role</th>
                <th className='text-[#0D5247] font-bold text-base'>Phone</th>
                <th className='text-[#0D5247] font-bold text-base'>Status</th>
                <th className='text-[#0D5247] font-bold text-base'>Joined At</th>
                <th style={{ textAlign:'center' }}>{t('common.actions')}</th>
              </tr></thead>
              <tbody>
                {data?.data.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' ,fontWeight:'bold'}}>
                        <Avatar name={user.name} initials={user.avatar} size="sm" />
                        <div>
                          <p style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-primary)' }}>{user.name}</p>
                          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8rem', color:'var(--text-secondary)',fontWeight:'bold' }}>
                        <Shield size={13} style={{ color:'#0D5247' }} />
                        {ROLE_LABEL[user.role]}
                      </div>
                    </td>
                    <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)', direction:'ltr', textAlign:'right',fontWeight:'bold' }}>{user.phone}</td>
                    <td>
                      <button onClick={() => toggleMut.mutate({ id:user.id, status:user.status })} style={{ background:'none', border:'none', cursor:'pointer' }}>
                        <Badge status={user.status} />
                      </button>
                    </td>
                    <td style={{ fontSize:'0.75rem', color:'var(--text-muted)',fontWeight:'bold' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: '1vw' ,fontWeight:'bold'}}>
                        <button className="btn-ghost" style={{ padding:'6px 12px', borderRadius:'8px',backgroundColor:'#835500',  color:'#fff' }}
                          onClick={() => openEdit(user)} title="تعديل">
                          Edit  <Edit2 size={14} />
                        </button>
                        <button className="btn-ghost" style={{ padding:'6px', borderRadius:'8px', color:'#ef4444',backgroundColor:'#fee2e2s' }}
                          onClick={() => openDel(user)} title="حذف">
                          Delete <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card>
        <Pagination page={page} total={data?.total ?? 0} limit={LIMIT} onPageChange={(next) => {
          setParams(prev => {
            const n = new URLSearchParams(prev)
            n.set('page', String(next))
            return n
          })
        }} />
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
        onConfirm={() => deleteMut.mutate(deleteTarget?.id)}
        userName={deleteTarget?.name}
        loading={deleteMut.isPending}
      />
    </div>
  )
}
