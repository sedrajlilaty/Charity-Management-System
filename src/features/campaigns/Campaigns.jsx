import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Target,
} from 'lucide-react'

import { campaignsService } from '../../service/ServiceLayer'
import { ProgressBar } from '../../ui/Progressbar'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { EmptyState } from '../../ui/EmptyState'
import CampaignModal from './CampaignModal'
import Pagination from '../../ui/Pagination'

const LIMIT = 9

export default function Campaigns() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const status = params.get('status') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, search, status],
    queryFn: () => campaignsService.getList({ page, limit: LIMIT, search, status }),
  })

  const remove = useMutation({
    mutationFn: campaignsService.remove,
    onSuccess: () => qc.invalidateQueries(['campaigns']),
  })

  const handleSave = (form) => {
    const mutation = editItem 
      ? campaignsService.update(editItem.id, form) 
      : campaignsService.create(form);
    
    // ملاحظة: يفضل استخدام mutate مباشرة هنا أو تعريف الموتيشين بالأعلى
    qc.invalidateQueries(['campaigns']);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* 1. Header Section */}
      <PageHeader
        title={t('campaigns.title')}
        subtitle={t('campaigns.subtitle', { count: data?.total ?? 0 })}
      >
        <button
          className="btn-primary"
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-secondary-500)',
            color: '#111',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            fontFamily: 'var(--font-family-sans)'
          }}
        >
          <Plus size={18} />
          {t('campaigns.addBtn')}
        </button>
      </PageHeader>

      {/* 2. Stats Dashboard Card */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>{t('campaigns.title')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{t('campaigns.subtitle', { count: data?.total ?? 0 })}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{t('campaigns.total')}</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>{data?.total ?? 0}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Main Content (Grid) */}
      {isLoading ? (
        <SpinnerPage />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {data?.data.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
               <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <EmptyState icon={Megaphone} title={t('campaigns.empty')} />
              </Card>
            </div>
          ) : (
            data?.data.map((c) => {
              const pct = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100));
              const color = pct >= 100 ? 'success' : pct >= 60 ? 'primary' : 'warning';

              return (
                <Card
                  key={c.id}
                  style={{
                    borderRadius: '24px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Megaphone size={20} color="#fff" />
                    </div>
                    <Badge status={c.status} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{c.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: '48px', marginBottom: '1.25rem' }}>{c.description}</p>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>{t('campaigns.raised')}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{pct}%</span>
                    </div>
                    <ProgressBar value={c.collectedAmount} max={c.targetAmount} color={color} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <button 
                        onClick={() => { setEditItem(c); setModalOpen(true); }}
                        style={{ flex: 1, background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Edit2 size={14} /> {t('campaigns.actions.edit')}
                      </button>
                      <button 
                        onClick={() => window.confirm(t('campaigns.deleteConfirm')) && remove.mutate(c.id)}
                        style={{ marginLeft: '8px', width: '40px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* 4. Pagination Section */}
      {data?.total > LIMIT && (
        <Card style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', padding: '1rem', borderRadius: '16px' }}>
          <Pagination
            page={page}
            total={data?.total ?? 0}
            limit={LIMIT}
            onPageChange={(next) => setParams((prev) => {
              const n = new URLSearchParams(prev);
              n.set('page', String(next));
              return n;
            })}
          />
        </Card>
      )}

      {/* 5. Modals */}
      <CampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editItem={editItem}
      />
    </div>
  )
}