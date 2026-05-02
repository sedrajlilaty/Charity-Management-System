import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Search, MoreVertical } from 'lucide-react'

import { volunteersService } from '../../service/ServiceLayer'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { Card } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'
import Pagination from '../../ui/Pagination'

import VolunteerModal from './Volunteermodal'
import { ActionModal } from '../../ui/ActionModal'

const LIMIT = 10

// تعريف التبويبات مثل Donations و Beneficiaries
const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

export default function Volunteers() {
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const page = Number(params.get('page') || 1)

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [actionOpen, setActionOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['volunteers', search, status, page],
    queryFn: () =>
      volunteersService.getList({ search, status, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const actionMut = useMutation({
    mutationFn: ({ id, action }) =>
      volunteersService.changeStatus(id, action),
    onSuccess: () => qc.invalidateQueries(['volunteers']),
  })

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setSelected(row)
      setModalOpen(true)
    } else {
      actionMut.mutate({ id: row.id, action })
    }
    setActionOpen(false)
  }

  const ActionBtn = ({ row }) => (
    <button
      onClick={() => {
        setSelected(row)
        setActionOpen(true)
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: 'var(--bg-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      <MoreVertical size={16} />
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <PageHeader title="Volunteers" subtitle={`${data?.total ?? 0} volunteers`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <UserPlus size={15} /> Add Volunteer
        </button>
      </PageHeader>

      {/* Filters Card - مثل Beneficiaries */}
      <Card className='bg-[#e6f0ee]' style={{ backgroundColor: '#e6f0ee' }}>
        
        {/* Search Row */}
        <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--bg-muted)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '10px', 
            padding: '8px 12px', 
            minWidth: '220px' 
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input 
              placeholder="Search by name..." 
              value={search} 
              onChange={e => setParams(prev => {
                const n = new URLSearchParams(prev)
                if (e.target.value) n.set('search', e.target.value)
                else n.delete('search')
                n.set('page', '1')
                return n
              })}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                fontSize: '0.85rem', 
                color: 'var(--text-primary)', 
                width: '100%', 
                fontFamily: 'Cairo,sans-serif' 
              }} 
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ padding: '10px 16px', display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-default)' }}>
          {STATUS_TABS.map(tab => (
            <button 
              key={tab.key} 
              onClick={() => setParams(prev => {
                const n = new URLSearchParams(prev)
                if (tab.key) n.set('status', tab.key)
                else n.delete('status')
                n.set('page', '1')
                return n
              })}
              style={{ 
                padding: '6px 16px', 
                borderRadius: '8px', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                border: 'none', 
                cursor: 'pointer', 
                fontFamily: 'Cairo,sans-serif', 
                transition: 'all 0.15s', 
                background: status === tab.key ? '#0D5247' : 'transparent', 
                color: status === tab.key ? '#fff' : 'var(--text-muted)' 
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', backgroundColor: '#fff' }}>
          {isLoading ? (
            <SpinnerPage />
          ) : data?.data.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <table className="data-table" style={{ backgroundColor: '#fff', width: '100%' }}>
              <thead>
                <tr>
                  <th className='text-[#0D5247] font-bold text-base' style={{ padding: '12px 16px' }}>Name</th>
                  <th className='text-[#0D5247] font-bold text-base' style={{ padding: '12px 16px' }}>Campaign</th>
                  <th className='text-[#0D5247] font-bold text-base' style={{ padding: '12px 16px' }}>Status</th>
                  <th className='text-[#0D5247] font-bold text-base' style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              	  </tr>
              </thead>

              <tbody>
                {data.data.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Avatar name={row.name} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{row.name}</div>
                          <div style={{ fontSize: 12, color: 'gray' }}>{row.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{row.campaignName}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge status={row.status} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <ActionBtn row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Pagination */}
      <Card>
        <Pagination
          page={page}
          total={data?.total ?? 0}
          limit={LIMIT}
          onPageChange={(next) => {
            setParams(prev => {
              const n = new URLSearchParams(prev)
              n.set('page', String(next))
              return n
            })
          }}
        />
      </Card>

      {/* Modals */}
      <VolunteerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={selected}
      />

      <ActionModal
        isOpen={actionOpen}
        onClose={() => setActionOpen(false)}
        onAction={handleAction}
        row={selected}
      />
    </div>
  )
}