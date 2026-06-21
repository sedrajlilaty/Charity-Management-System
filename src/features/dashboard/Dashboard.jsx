import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { dashboardService } from '../../service/ServiceLayer'
import { CardHeader } from '../../ui/Card'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { DollarSign, Users, Megaphone, UserCheck, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { color } from 'framer-motion'
import PermissionButton from '../../ui/PermissionButton'
/* ───────────────────── KPI Card ───────────────────── */
function KpiCard({ label, value, change, icon: Icon, accent }) {
  const up = change >= 0
  return (
    <div style={{
      background: '#094037',
      borderRadius: '14px',
      padding: '1.1rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 2px 12px rgba(9,64,55,0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(9,64,55,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(9,64,55,0.2)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={accent ?? '#eab308'} />
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '0.68rem', fontWeight: 700,
          color: up ? '#4ade80' : '#f87171',
          background: up ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
          padding: '3px 9px', borderRadius: '99px',
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
          {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
        </p>
      </div>
    </div>
  )
}

/* ───────────────────── Tooltip ───────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  )
}

/* ───────────────────── Pie Label ───────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.08) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ───────────────────── Modern Table ───────────────────── */
function ModernTable({ title, headers, children, onViewAll }) {
  return (
    <Card style={{ background: 'var(--bg-base)' }}>
      <CardHeader title={title}>
        <PermissionButton 
          onClick={onViewAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.78rem', color: 'var(--text-primary)', background: 'var(--bg-muted)',
            border: 'none', cursor: 'pointer', padding: '5px 12px',
            borderRadius: '8px', fontFamily: 'Cairo,sans-serif', fontWeight: 600,
            transition: 'background 0.15s',margen:'8px'
          }}
        >
          عرض الكل <ExternalLink size={12} />
        </PermissionButton >
      </CardHeader>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'start',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: '0.05em', background: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border-default)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  )
}

function Tr({ children }) {
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </tr>
  )
}

function Td({ children, bold, accent, muted, minW }) {
  return (
    <td style={{
      padding: '11px 16px',
      fontWeight:  bold   ? 700 : 400,
      color:       accent ? '#094037' : muted ? 'var(--text-muted)' : 'var(--text-primary)',
      fontSize:    muted  ? '0.72rem' : '0.82rem',
      minWidth:    minW   ? `${minW}px` : undefined,
      whiteSpace:  'nowrap',
    }}>
      {children}
    </td>
  )
}

/* ───────────────────── Progress Bar ───────────────────── */
function ProgressCell({ pct }) {
  const color = pct >= 100 ? '#16a34a' : pct >= 60 ? '#094037' : '#d97706'
  return (
    <td style={{ padding: '11px 16px', minWidth: '120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          flex: 1, height: '5px', background: 'var(--bg-muted)',
          borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color, minWidth: '32px' }}>{pct}%</span>
      </div>
    </td>
  )
}

/* ───────────────────── Dashboard ───────────────────── */
export default function Dashboard() {
  const { t } = useTranslation()

  const { data: kpis,      isLoading: kl } = useQuery({ queryKey: ['kpis'],            queryFn: dashboardService.getKPIs })
  const { data: monthly,   isLoading: ml } = useQuery({ queryKey: ['monthly'],          queryFn: dashboardService.getMonthlyDonations })
  const { data: byStatus               }   = useQuery({ queryKey: ['cases-status'],     queryFn: dashboardService.getCasesByStatus })
  const { data: recentDon, isLoading: dl } = useQuery({ queryKey: ['recent-donations'], queryFn: dashboardService.getRecentDonations })
  const { data: campaigns, isLoading: cl } = useQuery({ queryKey: ['top-campaigns'],    queryFn: dashboardService.getTopCampaigns })

  if (kl) return <SpinnerPage />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <KpiCard label={t('dashboard.totalDonations')}  value={formatCurrency(kpis?.totalDonations.value ?? 0)}   change={kpis?.totalDonations.change ?? 0}     icon={DollarSign} accent="#eab308" />
        <KpiCard label={t('dashboard.activeCases')}     value={kpis?.activeCases.value ?? 0}                      change={kpis?.activeCases.change ?? 0}         icon={UserCheck}  accent="#6ee7b7" />
        <KpiCard label={t('dashboard.activeCampaigns')} value={kpis?.activeCampaigns.value ?? 0}                  change={kpis?.activeCampaigns.change ?? 0}     icon={Megaphone}  accent="#eab308" />
        <KpiCard label={t('dashboard.beneficiaries')}   value={kpis?.totalBeneficiaries.value ?? 0}               change={kpis?.totalBeneficiaries.change ?? 0}  icon={Users}      accent="#93c5fd" />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* مخطط التبرعات */}
        <Card style={{ background: 'var(--bg-base)' }}>
          <CardHeader title={t('dashboard.donationsTrend')}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '3px 10px', borderRadius: '99px' }}>
              {t('dashboard.year')}
            </span>
          </CardHeader>
          <div style={{ padding: '1rem 1rem 0.5rem' }}>
            {ml ? <SpinnerPage /> : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#094037" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#094037" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" name={t('dashboard.totalDonations')}
                    stroke="#094037" strokeWidth={2.5} fill="url(#gd)" dot={false}
                    activeDot={{ r: 5, fill: '#094037', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* دائرة الحالات */}
       <Card style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
  <CardHeader title={t('dashboard.casesByStatus')} />
  <div style={{ padding: '0.875rem 1rem' }}>
    
    {/* 1. زدنا الارتفاع إلى 220 ليعطي مساحة أكبر للدائرة المكبرة */}
    <ResponsiveContainer width="100%" height={220}> 
      <PieChart>
        {/* 2. تم تكبير القطر الخارجي والداخلي للدائرة أكثر */}
        <Pie 
          data={byStatus} 
          cx="50%" 
          cy="50%" 
          innerRadius={65}   
          outerRadius={95}  
          paddingAngle={3} 
          dataKey="value" 
          labelLine={false} 
          label={PieLabel}
        >
          {byStatus?.map((e, i) => <Cell key={i} fill={e.color} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [v, n]} />
      </PieChart>
    </ResponsiveContainer>

    {/* 3. تعديل الأسطورة لتصبح أفقية (بجانب بعضها) ومتناسقة أسفل الدائرة */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',     
      flexWrap: 'wrap',         
      justifyContent: 'center', 
      gap: '16px',              
      marginTop: '16px' 
    }}>
      {byStatus?.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* النقطة الملونة */}
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          
          {/* الاسم وبجانبه القيمة مباشرة بين قوسين أو بجانبه */}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {s.name} <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: '4px' }}>({s.value})</span>
          </span>
        </div>
      ))}
    </div>

  </div>
</Card>
      </div>

      {/* ── جداول ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>

        {/* آخر التبرعات */}
        {dl ? <SpinnerPage /> : (
          <ModernTable
            title={t('dashboard.recentDonations')}
            headers={[t('common.name'), t('common.SAR'), t('common.status'), t('common.date')]}
            onViewAll={() => {}}
          >
            {recentDon?.map(d => (
              <Tr key={d.id}>
                <Td bold>{d.donorName}</Td>
                <Td accent bold>{formatCurrency(d.amount)}</Td>
                <td style={{ padding: '11px 16px' }}><Badge status={d.status} /></td>
                <Td muted>{formatDate(d.date)}</Td>
              </Tr>
            ))}
          </ModernTable>
        )}

        {/* أبرز الحملات */}
        {cl ? <SpinnerPage /> : (
          <ModernTable
            title={t('dashboard.topCampaigns')}
            headers={[t('nav.campaigns'), t('dashboard.raised'), t('common.status')]}
            onViewAll={() => {}}
          >
            {campaigns?.map(c => {
              const pct = c.targetAmount > 0
                ? Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100))
                : 0
              return (
                <Tr key={c.id}>
                  <Td>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(c.collectedAmount)} / {formatCurrency(c.targetAmount)}
                    </p>
                  </Td>
                  <ProgressCell pct={pct} />
                  <td style={{ padding: '11px 16px' }}><Badge status={c.status} /></td>
                </Tr>
              )
            })}
          </ModernTable>
        )}

      </div>
    </div>
  )
}