import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Megaphone, Plus, Trash2, Edit2, Target } from 'lucide-react'
import { campaignsService } from '../../service/ServiceLayer'
import { ProgressBar } from '../../ui/Progressbar'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import CampaignModal from './CampaignModal'
import Pagination from '../../ui/Pagination'

import {EmptyState} from '../../ui/EmptyState'
const LIMIT = 9
export default function Campaigns() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page],
    queryFn:  () => campaignsService.getList({ page, limit: LIMIT }),
  })

  const remove = useMutation({
    mutationFn: campaignsService.remove,
    onSuccess:  () => qc.invalidateQueries(['campaigns']),
  })
  const createMut = useMutation({
    mutationFn: campaignsService.create,
    onSuccess: () => qc.invalidateQueries(['campaigns']),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...rest }) => campaignsService.update(id, rest),
    onSuccess: () => qc.invalidateQueries(['campaigns']),
  })

  const handleSave = (form) => {
    if (editItem) updateMut.mutate({ id: editItem.id, ...form })
    else createMut.mutate(form)
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Campaigns" subtitle={`${data?.total ?? 0} campaigns`}>
        <button className="btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
          <Plus size={15} />New campaign
        </button>
      </PageHeader>

      {isLoading ? <SpinnerPage /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.data.length === 0 && (
            <div className="col-span-3">
              <Card><EmptyState icon={Megaphone} title="No campaigns yet" /></Card>
            </div>
          )}
          {data?.data.map(c => {
            const pct = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100))
            const color = pct >= 100 ? 'success' : pct >= 60 ? 'primary' : 'warning'
            return (
                    <Card key={c.id} className="animate-fade-in" style={{ background: '#e6f0ee' }}>
                      <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Megaphone size={18} className="text-primary-500 color-[#835500]" style={{ color: '#835500' }} />
                    </div>
                    <Badge status={c.status} />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1" style={{ fontSize: '1.05rem', fontWeight: 800 }}>{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{c.description}</p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 text-[#835500]">Raised</span>
                      <span className="font-bold text-primary-600 text-[#835500]">{pct}%</span>
                    </div>
                    <ProgressBar value={c.collectedAmount} max={c.targetAmount} color={color} />
                    <div className="flex justify-between text-xs mt-1.5 text-gray-400">
                      <span>{formatCurrency(c.collectedAmount)}</span>
                      <span>Goal: {formatCurrency(c.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Target size={12} />
                      <span>{c.beneficiariesCount} beneficiaries</span>
                    </div>
                    <span>{formatDate(c.endDate)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      className="btn-outline flex-1 text-xs py-1.5 bg-[#0D5247] text-white"
                      onClick={() => { setEditItem(c); setModalOpen(true) }}
                    >
                      <Edit2 size={13} />Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this campaign?')) remove.mutate(c.id)
                      }}
                      className="btn-ghost p-2 text-red-400 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Card>
        <Pagination page={page} total={data?.total ?? 0} limit={LIMIT} onPageChange={(next) => {
          setParams(prev => {
            const n = new URLSearchParams(prev)
            n.set('page', String(next))
            return n
          })
        }} />
      </Card>

      <CampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editItem={editItem}
      />
    </div>
  )
}
