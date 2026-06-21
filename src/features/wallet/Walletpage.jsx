import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Wallet, ArrowDownCircle, ArrowUpCircle,
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
// import { walletService } from '../../service/ServiceLayer'

// ─── Mock — احذفيه لما يكون الـ API جاهز ─────────────────────────────────────
const MOCK_SUMMARY = {
  balance: 87500, totalOut: 60500,
  changeBalance: 12.4, changeOut: 5.2,
}

const MOCK_TX = [
  { id: 1, target: 'حملة الملابس الشتوية', targetType: 'campaign', date: '2024-11-24', amount: 8000,  note: 'صرف لشراء الملابس'   },
  { id: 2, target: 'أم أحمد الرشيدي',     targetType: 'case',     date: '2024-11-20', amount: 5000,  note: 'دعم شهري'            },
  { id: 3, target: 'حملة السلة الغذائية', targetType: 'campaign', date: '2024-11-15', amount: 8000,  note: ''                    },
  { id: 4, target: 'عائلة محمود العلي',   targetType: 'case',     date: '2024-11-10', amount: 3000,  note: 'مساعدة طبية'         },
  { id: 5, target: 'كفالة الأيتام',        targetType: 'campaign', date: '2024-11-05', amount: 12000, note: ''                    },
]

const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'حملة السلة الغذائية',   raised: 80000, target: 80000,  disbursed: 8000,  status: 'completed' },
  { id: 'c2', name: 'حملة الملابس الشتوية', raised: 48500, target: 63000,  disbursed: 15000, status: 'active'    },
  { id: 'c3', name: 'كفالة الأيتام',          raised: 90000, target: 120000, disbursed: 37500, status: 'active'    },
  { id: 'c4', name: 'دعم الأرامل',            raised: 22000, target: 10000,  disbursed: 0,     status: 'completed' },
]

const MOCK_CASES = [
  { id: 'b1', name: 'أم أحمد الرشيدي',   category: 'رعاية أيتام',    raised: 10000, disbursed: 5000  },
  { id: 'b2', name: 'عائلة محمود العلي', category: 'مساعدة تعليمية', raised: 5000,  disbursed: 0     },
  { id: 'b3', name: 'أسرة الزهراني',     category: 'مساعدة طبية',    raised: 12000, disbursed: 12000 },
]
// ─────────────────────────────────────────────────────────────────────────────

const LIMIT = 8
const fmt   = (n) => 'ر.س ' + Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 0 })

// ─── KPI Card — نفس نمط الداشبورد ────────────────────────────────────────────
function KpiCard({ label, value, change, icon: Icon }) {
  const up = change >= 0
  return (
    <div
      style={{
        background: '#094037', borderRadius: 16,
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

// ─── Disburse Modal ───────────────────────────────────────────────────────────
function DisburseModal({ walletBalance, campaigns, cases, onClose, onConfirm }) {
  const { t } = useTranslation()
  const [targetType, setTargetType] = useState('campaign')
  const [selectedId, setSelectedId] = useState('')
  const [amount, setAmount]         = useState('')
  const [note, setNote]             = useState('')
  const [error, setError]           = useState('')

  const options   = targetType === 'campaign' ? campaigns : cases
  const selected  = options.find(o => o.id === selectedId)
  const remaining = selected ? (selected.raised ?? 0) - (selected.disbursed ?? 0) : 0

  function handleConfirm() {
    const num = parseFloat(amount)
    if (!selectedId)         { setError(t('wallet.modal.errors.noTarget'));   return }
    if (!num || num <= 0)    { setError(t('wallet.modal.errors.invalidAmt')); return }
    if (num > walletBalance) { setError(t('wallet.modal.errors.noBalance'));  return }
    if (num > remaining)     { setError(t('wallet.modal.errors.overRemain')); return }
    setError('')
    onConfirm({ targetType, targetId: selectedId, targetName: selected.name, amount: num, note })
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1px solid var(--border-default)',
    fontSize: '0.9rem', background: 'var(--bg-muted)',
    color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: '1.5rem', width: 440, border: '1px solid var(--border-subtle)', fontFamily: 'Cairo, sans-serif', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('wallet.modal.title')}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('wallet.modal.subtitle')}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--bg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* رصيد متاح */}
        <div style={{ background: 'rgba(9,64,55,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#094037' }}>
          <span>{t('wallet.modal.available')}</span>
          <span style={{ fontWeight: 800 }}>{fmt(walletBalance)}</span>
        </div>

        {/* نوع الوجهة */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('wallet.modal.destination')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['campaign', t('wallet.modal.campaign')], ['case', t('wallet.modal.case')]].map(([val, label]) => (
              <button key={val} onClick={() => { setTargetType(val); setSelectedId(''); setError('') }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10, fontSize: '0.88rem',
                  fontFamily: 'Cairo, sans-serif', cursor: 'pointer', fontWeight: 600,
                  border: `1px solid ${targetType === val ? '#094037' : 'var(--border-default)'}`,
                  background: targetType === val ? '#094037' : 'transparent',
                  color: targetType === val ? '#fff' : 'var(--text-secondary)',
                  transition: '0.15s',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* اختيار الحملة / الحالة */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
            {targetType === 'campaign' ? t('wallet.modal.selectCampaign') : t('wallet.modal.selectCase')}
          </label>
          <div style={{ position: 'relative' }}>
            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setError('') }} style={{ ...inputStyle, appearance: 'none', paddingLeft: 32 }}>
              <option value="">— {t('wallet.modal.choose')} —</option>
              {options.map(o => {
                const rem = (o.raised ?? 0) - (o.disbursed ?? 0)
                return <option key={o.id} value={o.id} disabled={rem <= 0}>{o.name} — {t('wallet.modal.remaining')}: {fmt(rem)}</option>
              })}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ملخص الوجهة */}
        {selected && (
          <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            {[
              { label: t('wallet.modal.totalRaised'), val: fmt(selected.raised ?? 0),    color: 'var(--text-primary)' },
              { label: t('wallet.modal.disbursed'),   val: fmt(selected.disbursed ?? 0), color: '#BA7517'             },
              { label: t('wallet.modal.remaining'),   val: fmt(remaining),               color: '#094037', bold: true  },
            ].map(({ label, val, color, bold }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: bold ? 800 : 600, color }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* المبلغ */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('wallet.modal.amount')}</label>
          <input type="number" value={amount} placeholder={t('wallet.modal.amountPlaceholder')}
            onChange={e => { setAmount(e.target.value); setError('') }}
            style={{ ...inputStyle, border: `1px solid ${error ? '#E24B4A' : 'var(--border-default)'}` }}
          />
        </div>

        {/* ملاحظة (اختياري) */}
        <div style={{ marginBottom: error ? 8 : 16 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{t('wallet.modal.note')} <span style={{ fontWeight: 400, opacity: 0.6 }}>({t('common.optional')})</span></label>
          <input type="text" value={note} placeholder={t('wallet.modal.notePlaceholder')}
            onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A32D2D', fontSize: '0.8rem', marginBottom: 12 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>
            {t('common.cancel')}
          </button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: '#094037', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Send size={14} /> {t('wallet.modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Disburse Item Card (حملة أو حالة) ───────────────────────────────────────
function DisburseCard({ item, onDisburse }) {
  const { t }     = useTranslation()
  const raised    = item.raised    ?? 0
  const disbursed = item.disbursed ?? 0
  const target    = item.target    ?? raised
  const remaining = raised - disbursed
  const pct       = Math.min(100, Math.round((raised / (target || 1)) * 100))
  const fullyDone = remaining <= 0
  const isCompleted = item.status === 'completed'

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
        <span style={{
          background: item.status
            ? (isCompleted ? 'var(--color-primary-50)' : '#fef3c7')
            : 'var(--bg-muted)',
          color: item.status
            ? (isCompleted ? '#094037' : '#92400e')
            : 'var(--text-muted)',
          padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
        }}>
          {item.category ?? (isCompleted ? t('wallet.status.completed') : t('wallet.status.active'))}
        </span>
      </div>

      {/* progress bar للحملات فقط */}
      {item.target && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>{t('wallet.raised')}</span><span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: isCompleted ? '#eab308' : '#094037', borderRadius: 10, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
        {[
          { label: t('wallet.totalRaised'), val: fmt(raised),    color: 'var(--text-primary)' },
          { label: t('wallet.disbursed'),   val: fmt(disbursed), color: '#BA7517'             },
          { label: t('wallet.remaining'),   val: fmt(remaining), color: '#094037'             },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '6px 8px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color }}>{val}</p>
          </div>
        ))}
      </div>

      <PermissionButton
        onClick={() => !fullyDone && onDisburse()}
        disabled={fullyDone}
        style={{
          width: '100%', padding: '8px', borderRadius: 10, fontSize: '0.82rem',
          border: 'none', cursor: fullyDone ? 'default' : 'pointer',
          fontFamily: 'Cairo, sans-serif', fontWeight: 700,
          background: fullyDone ? 'var(--bg-muted)' : '#094037',
          color: fullyDone ? 'var(--text-muted)' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: '0.15s', opacity: fullyDone ? 0.7 : 1,
        }}
      >
        {fullyDone
          ? <><CheckCircle size={14} /> {t('wallet.fullyDisbursed')}</>
          : <><Send size={14} /> {t('wallet.disburse')}</>
        }
      </PermissionButton>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WalletPage() {
  const { t }  = useTranslation()
  const qc     = useQueryClient()

  const [txFilter,   setTxFilter]   = useState('all')   // all | campaign | case
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [showModal,  setShowModal]  = useState(false)
  const [toast,      setToast]      = useState(null)

  // ── data (استبدليها بـ useQuery) ──
  const [summary,   setSummary]   = useState(MOCK_SUMMARY)
  const [allTx,     setAllTx]     = useState(MOCK_TX)
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)
  const [cases,     setCases]     = useState(MOCK_CASES)

  // فلترة المعاملات
  const filteredTx = useMemo(() => {
    return allTx.filter(tx => {
      const matchType = txFilter === 'all' || tx.targetType === txFilter
      const matchSrch = !search.trim() || tx.target.includes(search) || (tx.note ?? '').includes(search)
      return matchType && matchSrch
    })
  }, [allTx, txFilter, search])

  const paged = filteredTx.slice((page - 1) * LIMIT, page * LIMIT)

  function showToast(msg, error = false) {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3500)
  }

  function handleDisburse({ targetType, targetId, targetName, amount, note }) {
    // disburseMut.mutate({ targetType, targetId, amount, note })
    setSummary(s => ({ ...s, balance: s.balance - amount, totalOut: s.totalOut + amount }))
    if (targetType === 'campaign') setCampaigns(prev => prev.map(c => c.id === targetId ? { ...c, disbursed: c.disbursed + amount } : c))
    else                           setCases(prev =>     prev.map(c => c.id === targetId ? { ...c, disbursed: c.disbursed + amount } : c))
    setAllTx(prev => [{ id: prev.length + 1, target: targetName, targetType, date: new Date().toISOString().slice(0, 10), amount, note }, ...prev])
    setShowModal(false)
    showToast(`${t('wallet.toast.success')} ${targetName}`)
  }

  // ── columns جدول المصروفات ──
  const TYPE_META = {
    campaign: { bg: 'var(--color-primary-50)', text: '#094037',         label: t('wallet.type.campaign') },
    case:     { bg: '#fef3c7',                 text: '#92400e',         label: t('wallet.type.case')     },
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

  // ── tab style (نفس نمط Donations) ──
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
        <PermissionButton
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 14, border: 'none',
            background: 'var(--color-secondary-500)', color: '#111',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          <Send size={15} /> {t('wallet.disburseBtn')}
        </PermissionButton>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard label={t('wallet.kpi.balance')}  value={fmt(summary.balance)}  change={summary.changeBalance}  icon={Wallet}          />
        <KpiCard label={t('wallet.kpi.totalOut')} value={fmt(summary.totalOut)} change={-summary.changeOut}     icon={ArrowUpCircle}   />
      </div>

      {/* Disbursements Table */}
      <Card style={{ borderRadius: 24, overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('wallet.txTitle')}</h3>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t('wallet.txSubtitle')}</p>
        </div>

        {/* Filter Row */}
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

      {/* Disbursement Cards */}
      <div>
        {/* الحملات */}
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('wallet.campaigns')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
          {campaigns.map(c => <DisburseCard key={c.id} item={c} onDisburse={() => setShowModal(true)} />)}
        </div>

        {/* الحالات */}
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('wallet.cases')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {cases.map(c => <DisburseCard key={c.id} item={c} onDisburse={() => setShowModal(true)} />)}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DisburseModal
          walletBalance={summary.balance}
          campaigns={campaigns}
          cases={cases}
          onClose={() => setShowModal(false)}
          onConfirm={handleDisburse}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
          background: toast.error ? '#A32D2D' : '#094037',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: '0.88rem', fontFamily: 'Cairo, sans-serif', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          {toast.error ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}