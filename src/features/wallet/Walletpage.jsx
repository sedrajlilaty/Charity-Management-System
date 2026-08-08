import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Wallet, ArrowUpCircle,
  Send, TrendingUp, TrendingDown, Search,
  CheckCircle, AlertCircle, X, ChevronDown,
} from 'lucide-react'
import { Card }        from '../../ui/Card'
import { PageHeader }  from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState }  from '../../ui/EmptyState'
import DataTable       from '../../ui/DataTable'
import Pagination      from '../../ui/Pagination'
import PermissionButton from '../../ui/PermissionButton'
import { useAuth } from '../../context/AuthContext'
import { useCampaignsFilterQuery } from '../../hooks/Usecampaigns ' // ⚠️ تأكدي من المسار والمسافة بآخر الاسم متل باقي الصفحات

const LIMIT = 8
const fmt   = (n) => 'ر.س ' + Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 0 })

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, change = null }) {
  const up = change >= 0
  return (
    <div
      style={{
        background: 'var(--color-primary-500)', borderRadius: 16,
        padding: '1.1rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 2px 12px rgba(9,64,55,0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,64,55,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none';              e.currentTarget.style.boxShadow = '0 2px 12px rgba(9,64,55,0.2)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="#eab308" />
        </div>
        {change !== null && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.68rem', fontWeight: 700,
            color: up ? '#4ade80' : '#f87171',
            background: up ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            padding: '3px 9px', borderRadius: 99,
          }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── Disburse Item Card (حملة) ─────────────────────────────────
function DisburseCard({ item }) {
  const { t }     = useTranslation()
  const raised    = item.raised    ?? 0
  const disbursed = item.disbursed ?? 0
  const target    = item.target    ?? raised
  const remaining = raised - disbursed
  const pct       = Math.min(100, Math.round((raised / (target || 1)) * 100))
  const isCompleted = item.status === 'completed' || item.status === 'closed'

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
        <span style={{
          background: isCompleted ? 'var(--color-primary-50)' : '#fef3c7',
          color: isCompleted ? 'var(--color-primary-500)' : '#92400e',
          padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
        }}>
          {isCompleted ? t('wallet.status.completed') : t('wallet.status.active')}
        </span>
      </div>

      {target > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>{t('wallet.raised')}</span><span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: isCompleted ? '#eab308' : 'var(--color-primary-500)', borderRadius: 10, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
        {[
          { label: t('wallet.totalRaised'), val: fmt(raised),    color: 'var(--text-primary)' },
          { label: t('wallet.disbursed'),   val: fmt(disbursed), color: '#BA7517'             },
          { label: t('wallet.remaining'),   val: fmt(remaining), color: 'var(--color-primary-500)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '6px 8px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* ⚠️ زر الصرف معطل مؤقتاً — الباك لسا ما جهز endpoint الصرف */}
      <button
        disabled
        title="قريباً — بانتظار جاهزية الباك اند"
        style={{
          width: '100%', padding: '8px', borderRadius: 10, fontSize: '0.82rem',
          border: 'none', cursor: 'not-allowed',
          fontFamily: 'Cairo, sans-serif', fontWeight: 700,
          background: 'var(--bg-muted)', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          opacity: 0.6,
        }}
      >
        <Send size={14} /> {t('wallet.disburse')} (قريباً)
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function WalletPage() {
  const { t }    = useTranslation()
  const { user } = useAuth()

  const [txFilter, setTxFilter] = useState('all')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)

  // ✅ البالانس — من اليوزر المسجل دخول (الأدمن) مباشرة عبر AuthContext
  const balance = Number(user?.balances?.USD || 0)

  // ✅ الحملات — نفس الـ hook المستخدم بصفحة Campaigns.jsx
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaignsFilterQuery({
    per_page: 100,
  })

  const campaigns = useMemo(() => {
    return (campaignsData?.items ?? []).map(c => ({
      id:        c.id,
      name:      c.title,
      raised:    c.amountCollected ?? 0,
      disbursed: 0, // ⚠️ الباك لسا ما عندو حقل disbursed بالحملة — مؤقتاً 0
      target:    c.amountNeeded ?? 0,
      status:    c.status,
    }))
  }, [campaignsData])

  // ⚠️ لسا ما ربطنا المستفيدين (الحالات) بهاد القسم
  const cases = []

  // ⚠️ لسا ما في endpoint لسجل المعاملات
  const allTx = []

  const filteredTx = useMemo(() => {
    return allTx.filter(tx => {
      const matchType = txFilter === 'all' || tx.targetType === txFilter
      const matchSrch = !search.trim() || tx.target?.includes(search) || (tx.note ?? '').includes(search)
      return matchType && matchSrch
    })
  }, [allTx, txFilter, search])

  const paged = filteredTx.slice((page - 1) * LIMIT, page * LIMIT)

  const TYPE_META = {
    campaign: { bg: 'var(--color-primary-50)', text: 'var(--color-primary-500)', label: t('wallet.type.campaign') },
    case:     { bg: '#fef3c7',                 text: '#92400e',                  label: t('wallet.type.case')     },
  }

  const columns = useMemo(() => [
    {
      title: t('wallet.table.id'), key: 'id', align: 'center',
      render: v => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>#{v}</span>,
    },
    {
      title: t('wallet.table.target'), key: 'target', align: 'center',
      render: v => <span style={{ fontWeight: 700 }}>{v}</span>,
    },
    {
      title: t('wallet.table.type'), key: 'targetType', align: 'center',
      render: v => {
        const m = TYPE_META[v] ?? TYPE_META.campaign
        return <span style={{ background: m.bg, color: m.text, padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>{m.label}</span>
      },
    },
    {
      title: t('wallet.table.amount'), key: 'amount', align: 'center',
      render: v => <span style={{ fontWeight: 800, color: '#BA7517' }}>−{fmt(v)}</span>,
    },
    {
      title: t('wallet.table.note'), key: 'note', align: 'center',
      render: v => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{v || '—'}</span>,
    },
    {
      title: t('wallet.table.date'), key: 'date', align: 'center',
      render: v => <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{v}</span>,
    },
  ], [t])

  const tabStyle = (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '9px 18px', borderRadius: 14,
    border: active ? '1px solid var(--color-primary-100)' : '1px solid var(--border-subtle)',
    background: active ? 'var(--color-primary-50)' : 'transparent',
    color: active ? 'var(--color-primary-700)' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 500, fontSize: '0.88rem',
    cursor: 'pointer', transition: '0.2s', fontFamily: 'Cairo, sans-serif',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'var(--bg-base)' }}>

      {/* Header */}
      <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')}>
        {/* ⚠️ زر الصرف العام معطل مؤقتاً لحد ما يجهز الباك */}
        <button
          disabled
          title="قريباً — بانتظار جاهزية الباك اند"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 14, border: 'none',
            background: 'var(--bg-muted)', color: 'var(--text-muted)',
            cursor: 'not-allowed', fontSize: '0.9rem', fontWeight: 700,
            fontFamily: 'Cairo, sans-serif', opacity: 0.6,
          }}
        >
          <Send size={15} /> {t('wallet.disburseBtn')} (قريباً)
        </button>
      </PageHeader>

      {/* KPI Cards — بس البالانس حالياً، totalOut محذوف مؤقتاً */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard label={t('wallet.kpi.balance')} value={fmt(balance)} icon={Wallet} />
      </div>

      {/* Disbursements Table — فاضي مؤقتاً لحد ما يجهز endpoint المعاملات */}
      <Card style={{ borderRadius: 24, overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('wallet.txTitle')}</h3>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t('wallet.txSubtitle')}</p>
        </div>

        <Card style={{ margin: 16, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['all', t('common.all')], ['campaign', t('wallet.type.campaign')], ['case', t('wallet.type.case')]].map(([v, l]) => (
                <button key={v} style={tabStyle(txFilter === v)} onClick={() => { setTxFilter(v); setPage(1) }}>{l}</button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text" placeholder={t('wallet.searchPlaceholder')} value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ padding: '9px 36px 9px 14px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif', outline: 'none', width: 260 }}
              />
            </div>
          </div>
        </Card>

        <DataTable
          columns={columns}
          data={paged}
          isLoading={false}
          EmptyComponent={<EmptyState title={t('wallet.empty')} />}
        />

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination page={page} total={filteredTx.length} limit={LIMIT} onPageChange={setPage} />
        </div>
      </Card>

      {/* Disbursement Cards — الحملات الحقيقية */}
      <div>
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('wallet.campaigns')}
        </p>
        {campaignsLoading ? (
          <SpinnerPage />
        ) : campaigns.length === 0 ? (
          <EmptyState title={t('wallet.empty')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
            {campaigns.map(c => <DisburseCard key={c.id} item={c} />)}
          </div>
        )}

        {/* الحالات — لسا ما ربطناها */}
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('wallet.cases')}
        </p>
        {cases.length === 0 ? (
          <EmptyState title={t('wallet.empty')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {cases.map(c => <DisburseCard key={c.id} item={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}