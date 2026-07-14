// features/campaigns/CampaignFilters.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { CAMPAIGN_TYPES, PARTICIPATION_TYPES, FILTERABLE_STATUSES, SORT_OPTIONS } from './campaignConstants'

export const EMPTY_FILTERS = {
  search:             '',
  type:               '',
  participation_type: '',
  status:             '',
  min_amount_needed:  '',
  max_amount_needed:  '',
  start_date_from:    '',
  start_date_to:      '',
  end_date_from:      '',
  end_date_to:        '',
  sort_by:            'created_at',
  sort_dir:           'desc',
}

// المفاتيح يلي بتحسب كـ "فلتر فعّال" (مو الترتيب، هو مو فلتر حقيقي)
const FILTER_KEYS = Object.keys(EMPTY_FILTERS).filter(k => k !== 'sort_by' && k !== 'sort_dir')

export default function CampaignFilters({ filters, onChange, onClear }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const set = (key, value) => onChange(key, value)
  const activeCount = FILTER_KEYS.filter(k => filters[k]).length

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 16, padding: '1rem',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* بحث */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingInlineStart: 36 }}
            placeholder={t('campaigns.filters.searchPlaceholder')}
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>

        {/* نوع الحملة */}
        <select className="input" style={{ flex: '0 0 160px' }} value={filters.type} onChange={e => set('type', e.target.value)}>
          <option value="">{t('campaigns.filters.allTypes')}</option>
          {CAMPAIGN_TYPES.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
        </select>

        {/* حالة الحملة */}
        <select className="input" style={{ flex: '0 0 170px' }} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">{t('campaigns.filters.allStatuses')}</option>
          {FILTERABLE_STATUSES.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
        </select>

        {/* توسيع الفلاتر المتقدمة */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, cursor: 'pointer' }}
        >
          <SlidersHorizontal size={15} />
          {t('campaigns.filters.advanced')}
          {activeCount > 0 && (
            <span style={{
              background: 'var(--color-primary-500)', color: '#fff',
              borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
              width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{activeCount}</span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', borderRadius: 10, color: '#dc2626', cursor: 'pointer' }}
          >
            <X size={14} /> {t('campaigns.filters.clear')}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem',
          paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)',
        }}>
          <select className="input" value={filters.participation_type} onChange={e => set('participation_type', e.target.value)}>
            <option value="">{t('campaigns.filters.allParticipationTypes')}</option>
            {PARTICIPATION_TYPES.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
          </select>

          <input
            className="input" type="number" min={0}
            placeholder={t('campaigns.filters.minAmount')}
            value={filters.min_amount_needed}
            onChange={e => set('min_amount_needed', e.target.value)}
            dir="ltr"
          />
          <input
            className="input" type="number" min={0}
            placeholder={t('campaigns.filters.maxAmount')}
            value={filters.max_amount_needed}
            onChange={e => set('max_amount_needed', e.target.value)}
            dir="ltr"
          />

          <input
            className="input" type="date"
            title={t('campaigns.filters.startDateFrom')}
            value={filters.start_date_from}
            onChange={e => set('start_date_from', e.target.value)}
            dir="ltr"
          />
          <input
            className="input" type="date"
            title={t('campaigns.filters.startDateTo')}
            value={filters.start_date_to}
            onChange={e => set('start_date_to', e.target.value)}
            dir="ltr"
          />
          <input
            className="input" type="date"
            title={t('campaigns.filters.endDateFrom')}
            value={filters.end_date_from}
            onChange={e => set('end_date_from', e.target.value)}
            dir="ltr"
          />
          <input
            className="input" type="date"
            title={t('campaigns.filters.endDateTo')}
            value={filters.end_date_to}
            onChange={e => set('end_date_to', e.target.value)}
            dir="ltr"
          />

          <select className="input" value={filters.sort_by} onChange={e => set('sort_by', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
          </select>
          <select className="input" value={filters.sort_dir} onChange={e => set('sort_dir', e.target.value)}>
            <option value="desc">{t('campaigns.filters.sortDesc')}</option>
            <option value="asc">{t('campaigns.filters.sortAsc')}</option>
          </select>
        </div>
      )}
    </div>
  )
}