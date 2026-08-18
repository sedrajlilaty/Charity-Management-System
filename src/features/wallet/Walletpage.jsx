import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import {
  Wallet,
  Send,
  Loader2,
} from 'lucide-react'
import { Card }        from '../../ui/Card'
import { PageHeader }  from '../../ui/PageHeader'
import { SpinnerPage } from '../../ui/Spinner'
import { EmptyState }  from '../../ui/EmptyState'
import PermissionButton from '../../ui/PermissionButton'
import { useAuth } from '../../context/AuthContext'

import {
  usePendingCampaigns,
  usePendingRequests,
  useMonthlyDisbursementReport,
  useDisburseCampaign,
  useDisburseRequest,
} from '../../hooks/useDisburse'

const fmt = (n) => 'ر.س ' + Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 0 })

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon }) {
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
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="#eab308" />
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

// ─── Disburse Item Card (حملة / حالة) — فيها زر صرف فردي ───
function DisburseCard({ item, onDisburse, isDisbursing }) {
  const { t }  = useTranslation()
  const raised = item.raised ?? 0
  const target = item.target ?? raised
  const pct    = Math.min(100, Math.round((raised / (target || 1)) * 100))

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
        <span style={{
          background: '#fef3c7', color: '#92400e',
          padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
        }}>
          {t('wallet.status.pendingDisburse', { defaultValue: 'بانتظار الصرف' })}
        </span>
      </div>

      {target > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>{t('wallet.raised')}</span><span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-primary-500)', borderRadius: 10, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '6px 8px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('wallet.totalRaised')}</p>
          <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(raised)}</p>
        </div>
        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '6px 8px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('wallet.remaining', { defaultValue: 'الهدف' })}</p>
          <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-500)' }}>{fmt(target)}</p>
        </div>
      </div>

      {/* ✅ زر صرف فردي لكل كرت */}
      <PermissionButton
        permission="wallet.disburse"
        disabled={isDisbursing}
        onClick={() => onDisburse(item.id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 12, border: 'none',
          background: 'var(--color-secondary-500)', color: '#111',
          cursor: isDisbursing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700,
          fontFamily: 'Cairo, sans-serif', opacity: isDisbursing ? 0.6 : 1,
        }}
      >
        {isDisbursing ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
        {t('wallet.disburseBtn', { defaultValue: 'صرف' })}
      </PermissionButton>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function WalletPage() {
  const { t }    = useTranslation()
  const { user } = useAuth()

  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  // ✅ البالانس — من اليوزر المسجل دخول (الأدمن) مباشرة عبر AuthContext
  const balance = Number(user?.balances?.USD || 0)

  // ✅ الحملات والطلبات المعلقة الصرف — الفلترة صارت بالباك مباشرة
  const { data: pendingCampaignsRes, isLoading: campaignsLoading } = usePendingCampaigns()
  const { data: pendingRequestsRes,  isLoading: requestsLoading  } = usePendingRequests()

  // ✅ تقرير الشهر الحالي — لعرض إجمالي المصروف وسجل هالشهر
  const { data: reportRes, isLoading: reportLoading } = useMonthlyDisbursementReport(year, month)

  // ✅ mutations الصرف الفردي
  const disburseCampaignMut = useDisburseCampaign()
  const disburseRequestMut  = useDisburseRequest()

  const campaigns = useMemo(() => {
    return (pendingCampaignsRes?.data ?? []).map(c => ({
      id:     c.campaign_id,
      name:   c.title,
      raised: c.amount_collected ?? 0,
      target: c.amount_needed ?? 0,
    }))
  }, [pendingCampaignsRes])

  const cases = useMemo(() => {
    return (pendingRequestsRes?.data ?? []).map(r => ({
      id:     r.request_id,
      name:   r.title,
      raised: r.amount_collected ?? 0,
      target: r.required_amount ?? 0,
    }))
  }, [pendingRequestsRes])

  const report = reportRes?.report

  // ── معالجة الصرف الفردي ────────────────────────────────────
  const handleDisburseCampaign = (campaignId) => {
    disburseCampaignMut.mutate(campaignId, {
      onSuccess: (res) => {
        toast.success(res?.message ?? t('wallet.toast.disburseSuccess', { defaultValue: 'تم الصرف ✅' }))
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? t('wallet.toast.disburseError', { defaultValue: 'فشلت عملية الصرف' }))
      },
    })
  }

  const handleDisburseRequest = (requestId) => {
    disburseRequestMut.mutate(requestId, {
      onSuccess: (res) => {
        toast.success(res?.message ?? t('wallet.toast.disburseSuccess', { defaultValue: 'تم الصرف ✅' }))
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message ?? t('wallet.toast.disburseError', { defaultValue: 'فشلت عملية الصرف' }))
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'var(--bg-base)' }}>

      {/* Header */}
      <PageHeader title={t('wallet.title')} subtitle={t('wallet.subtitle')} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KpiCard label={t('wallet.kpi.balance')} value={fmt(balance)} icon={Wallet} />
        <KpiCard
          label={t('wallet.kpi.totalDisbursed', { defaultValue: 'المصروف هالشهر' })}
          value={reportLoading ? '...' : fmt(report?.summary?.total?.total_amount ?? 0)}
          icon={Send}
        />
      </div>

      {/* سجل عمليات الصرف — من تقرير الشهر الحالي */}
      <Card style={{ borderRadius: 24, overflow: 'hidden', padding: 0, background: 'var(--bg-base)' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('wallet.logsTitle', { defaultValue: 'سجل عمليات الصرف هالشهر' })}
          </h3>
        </div>

        {reportLoading ? (
          <SpinnerPage />
        ) : (!report?.campaigns_details?.length && !report?.requests_details?.length) ? (
          <EmptyState title={t('wallet.empty')} />
        ) : (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...(report?.campaigns_details ?? []), ...(report?.requests_details ?? [])].map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 12, background: 'var(--bg-muted)',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{log.title}</span>
                <span style={{ fontWeight: 800, color: '#BA7517' }}>{fmt(log.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* الحملات المعلقة الصرف */}
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
            {campaigns.map(c => (
              <DisburseCard
                key={c.id}
                item={c}
                onDisburse={handleDisburseCampaign}
                isDisbursing={disburseCampaignMut.isPending && disburseCampaignMut.variables === c.id}
              />
            ))}
          </div>
        )}

        {/* الحالات المعلقة الصرف */}
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('wallet.cases')}
        </p>
        {requestsLoading ? (
          <SpinnerPage />
        ) : cases.length === 0 ? (
          <EmptyState title={t('wallet.empty')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {cases.map(c => (
              <DisburseCard
                key={c.id}
                item={c}
                onDisburse={handleDisburseRequest}
                isDisbursing={disburseRequestMut.isPending && disburseRequestMut.variables === c.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}