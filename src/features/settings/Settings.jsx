
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../ui/PageHeader'
import {  Card } from '../../ui/Card'



import { useTheme } from '../../context/ThemeContext'
import { Settings as SettingsIcon, Globe, Moon, Sun, Bell, Shield, Save, DollarSign, Users, Check } from 'lucide-react'
import { CardHeader } from '../../ui/Card'

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border-subtle)', gap:'16px' }}>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>{label}</p>
        {description && <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px' }}>{description}</p>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width:'44px', height:'24px', borderRadius:'99px', border:'none', cursor:'pointer',
        background: on ? '#0D5247' : 'var(--border-default)',
        position:'relative', transition:'background 0.2s ease',
        padding:0,
      }}
    >
      <span style={{
        position:'absolute', top:'3px',
        right: on ? '3px' : '23px',
        width:'18px', height:'18px', borderRadius:'50%', background:'white',
        transition:'right 0.2s ease',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()

  const [saved, setSaved] = useState(false)

  // Financial settings
  const [orphanAmount, setOrphanAmount] = useState(500)
  const [minNights,    setMinNights]    = useState(1)
  const [maxMembers,   setMaxMembers]   = useState(10)
  const [currency,     setCurrency]     = useState('SAR')

  // Notification settings
  const [notifDonation, setNotifDonation] = useState(true)
  const [notifCase,     setNotifCase]     = useState(true)
  const [notifCampaign, setNotifCampaign] = useState(false)

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    document.documentElement.lang = next
    document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr'
    document.body.dir = next === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('charity-lang', next)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputNum = { width:'120px', textAlign:'center', fontWeight:700 }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', maxWidth:'900px' }}>
      <PageHeader title="Settings" subtitle="System preferences and app behavior" />

      {/* ── Financial Settings ── */}
      <Card>
        <CardHeader title="Financial Settings">
          <div style={{ padding:'6px', background:'#e6f0ee', borderRadius:'8px' ,marginTop:'13px' , fontWeight:'bold'}}>
            <DollarSign size={15} color="#0D5247" />
          </div>
        </CardHeader>
        <div className="card-body" style={{ padding:'0 20px' }}>
          <SettingRow label="Monthly orphan sponsorship amount" description="Used as the default amount for new sponsorship entries.">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <input className="input" type="number" min={100} step={50} style={inputNum}
                value={orphanAmount} onChange={e => setOrphanAmount(Number(e.target.value))} />
              <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)' }}>SAR</span>
            </div>
          </SettingRow>
          <SettingRow label="System currency" description="Currency used across all financial operations.">
            <select className="input" style={{ width:'160px', fontSize:'0.85rem' }} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="SAR">Saudi Riyal (SAR)</option>
              <option value="AED">UAE Dirham (AED)</option>
              <option value="KWD">Kuwaiti Dinar (KWD)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </SettingRow>
        </div>
      </Card>

      {/* ── Beneficiary Settings ── */}
      <Card>
        <CardHeader title="Beneficiary Rules">
          <div style={{ padding:'6px', background:'#fef9c3', borderRadius:'8px',marginTop:'13px' , fontWeight:'bold' }}>
            <Users size={15} color="#a16207" />
          </div>
        </CardHeader>
        <div className="card-body" style={{ padding:'0 20px' }}>
          <SettingRow label="Maximum family members" description="Upper limit allowed while registering a new case.">
            <input className="input" type="number" min={1} max={20} style={inputNum}
              value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} />
          </SettingRow>
          <SettingRow label="Case review cycle (months)" description="Months before beneficiary case review refresh.">
            <input className="input" type="number" min={1} max={12} style={inputNum}
              value={minNights} onChange={e => setMinNights(Number(e.target.value))} />
          </SettingRow>
        </div>
      </Card>

      {/* ── Appearance ── */}
      <Card>
        <CardHeader title="Appearance & Language">
          <div style={{ padding:'6px', background:'#f3e8ff', borderRadius:'8px',marginTop:'13px' , fontWeight:'bold' }}>
            <Globe size={15} color="#7c3aed" />
          </div>
        </CardHeader>
        <div className="card-body" style={{ padding:'0 20px' }}>
          <SettingRow label="Dark mode" description="Switch between light and dark themes.">
            <Toggle on={isDark} onChange={toggleTheme} />
          </SettingRow>
          <SettingRow label="System language" description={`Current language: ${i18n.language === 'ar' ? 'Arabic' : 'English'}`}>
            <button className="btn-outline" style={{ fontSize:'0.82rem', padding:'7px 14px' }} onClick={toggleLang}>
              <Globe size={13} />
              {i18n.language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
            </button>
          </SettingRow>
        </div>
      </Card>

      {/* ── Notifications ── */}
      <Card>
        <CardHeader title="Notifications">
          <div style={{ padding:'6px', background:'#fce7f3', borderRadius:'8px',marginTop:'13px' , fontWeight:'bold' }}>
            <Bell size={15} color="#be185d" />
          </div>
        </CardHeader>
        <div className="card-body" style={{ padding:'0 20px' }}>
          <SettingRow label="Donation alerts" description="Notify when a new donation is submitted.">
            <Toggle on={notifDonation} onChange={setNotifDonation} />
          </SettingRow>
          <SettingRow label="Case alerts" description="Notify when a new beneficiary case is submitted.">
            <Toggle on={notifCase} onChange={setNotifCase} />
          </SettingRow>
          <SettingRow label="Campaign alerts" description="Notify when campaign reaches goal or completes.">
            <Toggle on={notifCampaign} onChange={setNotifCampaign} />
          </SettingRow>
        </div>
      </Card>

      {/* ── Security ── */}
      <Card>
        <CardHeader title="Security & Session">
          <div style={{ padding:'6px', background:'#dcfce7', borderRadius:'8px' ,marginTop:'13px' , fontWeight:'bold'}}>
            <Shield size={15} color="#16a34a" />
          </div>
        </CardHeader>
        <div className="card-body" style={{ padding:'0 20px' }}>
          <SettingRow label="Auto sign-out" description="Automatically sign out after inactivity.">
            <Toggle on={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Session timeout (minutes)" description="How long user stays signed in without activity.">
            <input className="input" type="number" min={15} max={480} step={15} style={inputNum} defaultValue={60} />
          </SettingRow>
        </div>
      </Card>

      {/* Save */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', paddingBottom:'2rem' }}>
        <button onClick={handleSave} className="btn-primary" style={{ padding:'10px 28px' }}>
          <Save size={15} />
          Save settings
        </button>
        {saved && (
          <div className="animate-fade-in" style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', fontWeight:600, color:'#16a34a' }}>
            <Check size={16} />
            Saved successfully
          </div>
        )}
      </div>
    </div>
  )
}
