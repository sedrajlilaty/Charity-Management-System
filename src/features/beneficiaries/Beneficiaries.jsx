import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, MoreVertical } from 'lucide-react'
import { beneficiariesService } from '../../service/ServiceLayer'

import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Avatar } from '../../ui/Avatar'
import Pagination from '../../ui/Pagination'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState } from '../../ui/EmptyState'

import BeneficiaryModal from './BeneficairiesModal'
import { ActionModal } from '../../ui/ActionModal'

import { CATEGORY_LABEL, PRIORITY_LABEL, formatCurrency } from '../../utlis/helper'

const LIMIT = 10

// تبويبات الحالة (مطابقة لتبويبات المتطوعين)
const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'archived', label: 'Archived' },
]

// خيارات الفئات (التعليمي، الصحي، الأيتام، إلخ)
const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'orphan', label: 'Orphan' },
  { value: 'widow', label: 'Widow' },
  { value: 'poor', label: 'Low-income Family' },
  { value: 'elderly', label: 'Elderly' },
  { value: 'educational', label: 'Educational' },  // تعليمي
  { value: 'health', label: 'Health' },            // صحي
]

// خيارات الحملات (يمكن جلبها من API، لكنني وضعت نموذج ثابت)
// يمكنك تعديلها لتناسب نظامك أو جلبها من useQuery
const CAMPAIGN_OPTIONS = [
  { value: '', label: 'All campaigns' },
  { value: 'camp_1', label: 'Winter Clothing' },
  { value: 'camp_2', label: 'Orphan Sponsorship' },
  { value: 'camp_3', label: 'Food Basket' },
  { value: 'camp_4', label: 'Widows Support' },
  { value: 'camp_5', label: 'Back to School' },    // تعليمي
  { value: 'camp_6', label: 'Medical Aid' },        // صحي
]

const PRI_STYLE = {
  high: { bg: '#fee2e2', color: '#dc2626' },
  medium: { bg: '#fef9c3', color: '#a16207' },
  low: { bg: '#f3f4f6', color: '#6b7280' },
}

export default function Beneficiaries() {
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  // حالة الفلاتر
  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const category = params.get('category') || ''
  const campaign = params.get('campaign') || ''  // فلتر الحملات الجديد
  const page = Number(params.get('page') || 1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  // جلب البيانات مع إضافة campaign إلى queryKey و queryFn
  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries', status, category, campaign, search, page],
    queryFn: () =>
      beneficiariesService.getList({
        status,
        category,
        campaign,   // تمرير الحملة للـ API
        search,
        page,
        limit: LIMIT,
      }),
    keepPreviousData: true,
  })

  // متغيرات الـ Mutations (لم تتغير)
  const changeStatus = useMutation({
    mutationFn: ({ id, s }) => beneficiariesService.changeStatus(id, s),
    onSuccess: () => qc.invalidateQueries(['beneficiaries']),
  })
  const archive = useMutation({
    mutationFn: (id) => beneficiariesService.archive(id),
    onSuccess: () => qc.invalidateQueries(['beneficiaries']),
  })
  const createMut = useMutation({
    mutationFn: (payload) =>
      beneficiariesService.create({
        ...payload,
        status: 'pending',
        registrationDate: new Date().toISOString().split('T')[0],
      }),
    onSuccess: () => qc.invalidateQueries(['beneficiaries']),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...rest }) => beneficiariesService.update(id, rest),
    onSuccess: () => qc.invalidateQueries(['beneficiaries']),
  })
  const deleteMut = useMutation({
    mutationFn: (id) => beneficiariesService.archive(id),
    onSuccess: () => qc.invalidateQueries(['beneficiaries']),
  })

  const handleSave = (form) => {
    if (editItem) updateMut.mutate({ ...form, id: editItem.id })
    else createMut.mutate(form)
    setModalOpen(false)
    setEditItem(null)
  }

  const handleAction = (action, row) => {
    switch (action) {
      case 'approve':
        changeStatus.mutate({ id: row.id, s: 'active' })
        break
      case 'reject':
        changeStatus.mutate({ id: row.id, s: 'rejected' })
        break
      case 'archive':
        archive.mutate(row.id)
        break
      case 'edit':
        setEditItem(row)
        setModalOpen(true)
        break
      case 'delete':
        if (window.confirm('Are you sure you want to delete this beneficiary?')) {
          deleteMut.mutate(row.id)
        }
        break
      default:
        break
    }
    setActionModalOpen(false)
  }

  // زر القائمة (ثلاث نقاط) مطابق لصفحة المتطوعين
  const ActionBtn = ({ row }) => (
    <button
      onClick={() => {
        setSelectedRow(row)
        setActionModalOpen(true)
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
      {/* Header */}
      <PageHeader title="Beneficiaries" subtitle={`${data?.total ?? 0} cases`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Add case
        </button>
      </PageHeader>

      {/* Filters Card - بنفس شكل المتطوعين */}
      <Card className="bg-[#e6f0ee]" style={{ backgroundColor: '#e6f0ee' }}>
        {/* الصف الأول: Search + Category + Campaign (نفس أسلوب المتطوعين) */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '8px 12px',
              minWidth: '220px',
              flex: 1,
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) =>
                setParams((prev) => {
                  const n = new URLSearchParams(prev)
                  if (e.target.value) n.set('search', e.target.value)
                  else n.delete('search')
                  n.set('page', '1')
                  return n
                })
              }
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                width: '100%',
                fontFamily: 'Cairo,sans-serif',
              }}
            />
          </div>

          {/* Category Filter */}
          <select
  className="input"
  style={{
    background: 'var(--bg-muted)',
    border: '1px solid var(--border-default)',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    minWidth: '160px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  }}
  value={category}
  onChange={(e) =>
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      if (e.target.value) n.set('category', e.target.value)
      else n.delete('category')
      n.set('page', '1')
      return n
    })
  }
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#0D5247'
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(13, 82, 71, 0.1)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--border-default)'
    e.currentTarget.style.boxShadow = 'none'
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = '#0D5247'
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(13, 82, 71, 0.2)'
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--border-default)'
    e.currentTarget.style.boxShadow = 'none'
  }}
>
  {CATEGORY_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value} style={{ color: 'var(--text-primary)' }}>
      {opt.label}
    </option>
  ))}
</select>

{/* Campaign Filter */}
<select
  className="input"
  style={{
    background: 'var(--bg-muted)',
    border: '1px solid var(--border-default)',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    minWidth: '180px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  }}
  value={campaign}
  onChange={(e) =>
    setParams((prev) => {
      const n = new URLSearchParams(prev)
      if (e.target.value) n.set('campaign', e.target.value)
      else n.delete('campaign')
      n.set('page', '1')
      return n
    })
  }
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#0D5247'
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(13, 82, 71, 0.1)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--border-default)'
    e.currentTarget.style.boxShadow = 'none'
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = '#0D5247'
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(13, 82, 71, 0.2)'
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--border-default)'
    e.currentTarget.style.boxShadow = 'none'
  }}
>
  {CAMPAIGN_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value} style={{ color: 'var(--text-primary)' }}>
      {opt.label}
    </option>
  ))}
</select>س
        </div>

        {/* الصف الثاني: Status Tabs (مطابق تماماً للمتطوعين) */}
        <div style={{ padding: '10px 16px', display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-default)' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setParams((prev) => {
                  const n = new URLSearchParams(prev)
                  if (tab.key) n.set('status', tab.key)
                  else n.delete('status')
                  n.set('page', '1')
                  return n
                })
              }
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
                color: status === tab.key ? '#fff' : 'var(--text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table - بنفس شكل المتطوعين مع أعمدة المستفيدين */}
        <div style={{ overflowX: 'auto', backgroundColor: '#fff' }}>
          {isLoading ? (
            <SpinnerPage />
          ) : data?.data.length === 0 ? (
            <EmptyState title="No data" description="No matching cases found" />
          ) : (
            <table className="data-table" style={{ backgroundColor: '#fff', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#0D5247', fontWeight: 'bold' }}>Beneficiary</th>
                  <th style={{ padding: '12px 16px', color: '#0D5247', fontWeight: 'bold' }}>Category</th>
                  <th style={{ padding: '12px 16px', color: '#0D5247', fontWeight: 'bold' }}>Priority</th>
                  <th style={{ padding: '12px 16px', color: '#0D5247', fontWeight: 'bold' }}>Support</th>
                  <th style={{ padding: '12px 16px', color: '#0D5247', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: '#0D5247', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Avatar name={row.name} size={34} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{row.name}</div>
                          <div style={{ fontSize: 12, color: 'gray' }}>{row.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {CATEGORY_LABEL[row.category] ?? row.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {row.priority ? (
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '99px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: PRI_STYLE[row.priority]?.bg || '#f3f4f6',
                            color: PRI_STYLE[row.priority]?.color || '#6b7280',
                          }}
                        >
                          {PRIORITY_LABEL[row.priority]}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: row.monthlySupport > 0 ? '#0D5247' : 'var(--text-hint)' }}>
                      {row.monthlySupport > 0 ? formatCurrency(row.monthlySupport) : '—'}
                    </td>
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
            setParams((prev) => {
              const n = new URLSearchParams(prev)
              n.set('page', String(next))
              return n
            })
          }}
        />
      </Card>

      {/* Modals */}
      <BeneficiaryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editItem={editItem} />
      <ActionModal isOpen={actionModalOpen} onClose={() => setActionModalOpen(false)} onAction={handleAction} row={selectedRow} />
    </div>
  )
}