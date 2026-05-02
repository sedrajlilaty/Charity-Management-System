import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Check, X, Heart, Plus } from 'lucide-react'
import { donationsService } from '../../service/ServiceLayer'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { EmptyState } from '../../ui/EmptyState'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import DonationModal from './DonationModal'
import Pagination from '../../ui/Pagination'

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]
const TYPE_LABEL = { cash: 'Cash', inkind: 'In-kind', transfer: 'Transfer' }
const LIMIT = 10

export default function Donations() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || ''
  const page = Number(searchParams.get('page') || 1)
  const [openModal, setOpenModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['donations', status, page],
    queryFn: () => donationsService.getList({ status, page, limit: LIMIT }),
    keepPreviousData: true,
  })

  const approve = useMutation({
    mutationFn: donationsService.approve,
    onSuccess: () => qc.invalidateQueries(['donations']),
  })
  const reject = useMutation({
    mutationFn: donationsService.reject,
    onSuccess: () => qc.invalidateQueries(['donations']),
  })
  const createMut = useMutation({
    mutationFn: donationsService.create,
    onSuccess: () => qc.invalidateQueries(['donations']),
  })

  const setStatusParam = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('status', value)
      else next.delete('status')
      next.set('page', '1')
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader title={t('nav.donations')} subtitle={`${data?.total ?? 0} donations`}>
        <button className="btn-primary" onClick={() => setOpenModal(true)}>
          <Plus size={15} />New donation
        </button>
      </PageHeader>

      <Card>
        <div className="card-body" style={{ padding: '10px 16px', display: 'flex', gap: '4px' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusParam(tab.key)}
              style={{
                padding: '6px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Cairo,sans-serif',
                background: status === tab.key ? '#0D5247' : 'transparent',
                color: status === tab.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className='bg-[#e6f0ee]' style={{ backgroundColor: '#e6f0ee' }}>
        {isLoading ? <SpinnerPage /> : data?.data.length === 0 ? (
          <EmptyState icon={Heart} title="No donations found" description="No records in this filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table ">
              <thead>
                <tr>
                  <th className='text-[#0D5247] font-bold text-base'>#</th>
                  <th className='text-[#0D5247] font-bold text-base'>Donor</th>
                  <th className='text-[#0D5247] font-bold text-base'>Amount</th>
                  <th className='text-[#0D5247] font-bold text-base'>Type</th>
                  <th className='text-[#0D5247] font-bold text-base'>Campaign</th>
                  <th className='text-[#0D5247] font-bold text-base'>Recurring</th>
                  <th className='text-[#0D5247] font-bold text-base'>Date</th>
                  <th className='text-[#0D5247] font-bold text-base'>Status</th>
                  <th className='text-[#0D5247] font-bold text-base'>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#fff' }}>
                {data?.data.map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' ,backgroundColor: '#fff' }}>#{d.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', backgroundColor: '#fff' }}>{d.donorName}</td>
                    <td style={{ fontWeight: 800, color: '#0D5247', backgroundColor: '#fff' }}>{formatCurrency(d.amount)}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {TYPE_LABEL[d.type] ?? d.type}
                      </span>
                    </td>
                    <td style={{ backgroundColor: '#fff' }}>{d.campaignName}</td>
                    <td>{d.recurring ? 'Yes' : 'No'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(d.date)}</td>
                    <td><Badge status={d.status} /></td>
                    <td>
                      {d.status === 'pending' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw' }}>
                          <button onClick={() => approve.mutate(d.id)} disabled={approve.isPending} style={{ padding: '6px 12px', borderRadius: '7px', background: '#0D5247', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Approve">
                           Reject   <X size={14} style={{ margin: '6px', display: 'inline-flex' }} />
                          </button>
                          <button onClick={() => reject.mutate(d.id)} disabled={reject.isPending} style={{ padding: '5px', borderRadius: '7px', background: '#835500', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Reject">
                            Approve  <Check size={14}  style={{ margin: '6px', display: 'inline-flex' }}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <Pagination
          page={page}
          total={data?.total ?? 0}
          limit={LIMIT}
          onPageChange={(next) => {
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev)
              p.set('page', String(next))
              return p
            })
          }}
        />
      </Card>

      <DonationModal open={openModal} onClose={() => setOpenModal(false)} onSave={(payload) => createMut.mutate(payload)} />
    </div>
  )
}

