import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { dashboardService } from '../../service/ServiceLayer'
import {CardHeader} from'../../ui/Card'
import { formatCurrency, formatDate } from '../../utlis/helper'
import { SpinnerPage } from '../../ui/Spinner'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { DollarSign, Users, Megaphone, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react'


/* ── KPI Card ── */
function KpiCard({ label, value, change, icon: Icon, iconBg, iconColor }) {
  const up = change >= 0
  return (
    <div style={{
      background:'#0D5247',
      border:'1px solid var(--border-default)',
      borderRadius:'14px',
      padding:'1.1rem 1.25rem',
      display:'flex', flexDirection:'column', gap:'10px',
      boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
      transition:'box-shadow 0.2s',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ padding:'9px', borderRadius:'10px', background:iconBg }}>
          <Icon size={19} color={iconColor} />
        </div>
        <span style={{
          display:'flex', alignItems:'center', gap:'3px',
          fontSize:'0.7rem', fontWeight:700,
          color: up ? '#16a34a' : '#dc2626',
          background: up ? '#dcfce7' : '#fee2e2',
          padding:'3px 8px', borderRadius:'99px',
        }}>
          {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
          {Math.abs(change)}%
        </span>
      </div>
      <div>
        <p style={{ fontSize:'0.72rem', fontWeight:600, color:'#c0d9d4', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.03em' }}>{label}</p>
        <p style={{ fontSize:'1.7rem', fontWeight:800, color:'#ffffff', lineHeight:1 }}>
          {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
        </p>
      </div>
    </div>
  )
}

/* ── Tooltip ── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'10px', padding:'10px 14px', fontSize:'0.8rem', boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'4px' }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color }}>{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  )
}

/* ── Pie label ── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  if (percent < 0.08) return null
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent*100).toFixed(0)}%`}</text>
}

export default function Dashboard() {
  const { t } = useTranslation()

  const { data: kpis,      isLoading: kl } = useQuery({ queryKey:['kpis'],            queryFn: dashboardService.getKPIs })
  const { data: monthly,   isLoading: ml } = useQuery({ queryKey:['monthly'],          queryFn: dashboardService.getMonthlyDonations })
  const { data: byStatus               }   = useQuery({ queryKey:['cases-status'],     queryFn: dashboardService.getCasesByStatus })
  const { data: recentDon, isLoading: dl } = useQuery({ queryKey:['recent-donations'], queryFn: dashboardService.getRecentDonations })
  const { data: campaigns, isLoading: cl } = useQuery({ queryKey:['top-campaigns'],    queryFn: dashboardService.getTopCampaigns })

  if (kl) return <SpinnerPage />

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      {/* ── KPIs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'1rem' }}>
        <KpiCard label="Total Donations" value={formatCurrency(kpis?.totalDonations.value ?? 0)} change={kpis?.totalDonations.change ?? 0} icon={DollarSign} iconBg="#e6f0ee" iconColor="#835500" />
        <KpiCard label="Active Cases" value={kpis?.activeCases.value ?? 0} change={kpis?.activeCases.change ?? 0} icon={UserCheck} iconBg="#e6f0ee" iconColor="#a16207" />
        <KpiCard label="Active Campaigns" value={kpis?.activeCampaigns.value ?? 0} change={kpis?.activeCampaigns.change ?? 0} icon={Megaphone} iconBg="#e6f0ee" iconColor="#835500" />
        <KpiCard label="Beneficiaries" value={kpis?.totalBeneficiaries.value ?? 0} change={kpis?.totalBeneficiaries.change ?? 0} icon={Users} iconBg="#e6f0ee" iconColor="#835500" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1rem' }}>

        {/* Donations Trend — في كارد */}
        <Card>
          <CardHeader title="Donations Trend">
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', background:'var(--bg-muted)', padding:'3px 10px', borderRadius:'99px' }}>2024</span>
          </CardHeader>
          <div style={{ padding:'1rem 1rem 0.5rem', background:'var(--bg-base)', borderRadius:'0 0 14px 14px' }}>
            {ml ? <SpinnerPage /> : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthly} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0D5247" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#0D5247" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis  tick={{ fontSize:10, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`}/>
                  <Tooltip content={<ChartTooltip />}/>
                  <Area type="monotone" dataKey="amount" name="Donations" stroke="#0D5247" strokeWidth={2.5} fill="url(#gd)" dot={false} activeDot={{ r:4, fill:'#0D5247' }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Cases by Status — في كارد */}
        <Card>
          <CardHeader title="Cases by Status"/>
          <div style={{ padding:'0.75rem 1rem', background:'var(--bg-base)', borderRadius:'0 0 14px 14px' }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" labelLine={false} label={PieLabel}>
                  {byStatus?.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={(v,n) => [v,n]}/>
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'6px' }}>
              {byStatus?.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <span style={{ width:'9px', height:'9px', borderRadius:'50%', background:s.color, flexShrink:0 }}/>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tables Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'1rem' }}>

        {/* أحدث التبرعات — table */}
        <Card>
  <CardHeader title="Recent Donations">
    <button style={{ fontSize:'0.75rem', color:'#0D5247', background:'none', border:'none', cursor:'pointer', fontFamily:'Cairo,sans-serif', fontWeight:600 }}>
      View all
    </button>
  </CardHeader>
  {dl ? <SpinnerPage /> : (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
        <thead>
          <tr style={{ background:'var(--bg-subtle)', borderBottom:'1px solid var(--border-default)' }}>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap', borderRight:'1px solid var(--border-subtle)' }}>Name</th>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', borderRight:'1px solid var(--border-subtle)' }}>Amount</th>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', borderRight:'1px solid var(--border-subtle)' }}>Status</th>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {recentDon?.map(d => (
            <tr key={d.id}
              style={{ borderBottom:'1px solid var(--border-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <td style={{ padding:'11px 16px', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', borderRight:'1px solid var(--border-subtle)' }}>{d.donorName}</td>
              <td style={{ padding:'11px 16px', fontWeight:800, color:'#0D5247', whiteSpace:'nowrap', borderRight:'1px solid var(--border-subtle)' }}>{formatCurrency(d.amount)}</td>
              <td style={{ padding:'11px 16px', borderRight:'1px solid var(--border-subtle)' }}><Badge status={d.status}/></td>
              <td style={{ padding:'11px 16px', fontSize:'0.72rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDate(d.date)}</td>
             </tr>
          ))}
        </tbody>
       </table>
    </div>
  )}
</Card>

        {/* أبرز الحملات — table */}
        <Card>
  <CardHeader title="Top Campaigns">
    <button style={{ fontSize:'0.75rem', color:'#0D5247', background:'none', border:'none', cursor:'pointer', fontFamily:'Cairo,sans-serif', fontWeight:600 }}>
      View all
    </button>
  </CardHeader>
  {cl ? <SpinnerPage /> : (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
        <thead>
          <tr style={{ background:'var(--bg-subtle)', borderBottom:'1px solid var(--border-default)' }}>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', borderRight:'1px solid var(--border-subtle)' }}>Campaign</th>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap', borderRight:'1px solid var(--border-subtle)' }}>Progress</th>
            <th style={{ padding:'10px 16px', textAlign:'right', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns?.map(c => {
            const pct = c.targetAmount > 0 ? Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100)) : 0
            const barColor = pct >= 100 ? '#16a34a' : pct >= 60 ? '#0D5247' : '#d97706'
            return (
              <tr key={c.id}
                style={{ borderBottom:'1px solid var(--border-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <td style={{ padding:'10px 16px', borderRight:'1px solid var(--border-subtle)' }}>
                  <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'2px', whiteSpace:'nowrap' }}>{c.name}</p>
                  <p style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{formatCurrency(c.collectedAmount)} / {formatCurrency(c.targetAmount)}</p>
                </td>
                <td style={{ padding:'10px 16px', minWidth:'100px', borderRight:'1px solid var(--border-subtle)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ flex:1, height:'5px', background:'var(--bg-muted)', borderRadius:'99px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:'99px' }}/>
                    </div>
                    <span style={{ fontSize:'0.72rem', fontWeight:800, color:barColor, minWidth:'30px' }}>{pct}%</span>
                  </div>
                </td>
                <td style={{ padding:'10px 16px' }}><Badge status={c.status}/></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )}
</Card>
</div>
    </div>
  )
}