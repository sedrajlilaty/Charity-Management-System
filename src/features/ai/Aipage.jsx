
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Send, Trash2, StopCircle, Sparkles,
  Bot, User, AlertCircle, Lightbulb, ChevronLeft
} from 'lucide-react'

import { useAIAssistant, SUGGESTED_QUESTIONS } from '../../hooks/useAIAssistant'
import { dashboardService }     from '../../service/ServiceLayer'
import { donationsService }     from '../../service/ServiceLayer'
import { beneficiariesService } from '../../service/ServiceLayer'
import { campaignsService }     from '../../service/ServiceLayer'
import { volunteersService }    from '../../service/ServiceLayer'

// ─── جلب بيانات الداشبورد ─────────────────────────────────────────────────────
function useDashboardContext() {
  const { data: kpis }    = useQuery({ queryKey: ['kpis'],             queryFn: dashboardService.getKPIs,                               staleTime: 2 * 60_000 })
  const { data: donData } = useQuery({ queryKey: ['donations', '', 1], queryFn: () => donationsService.getList({ page: 1, limit: 5 }), staleTime: 2 * 60_000 })
  const { data: benData } = useQuery({ queryKey: ['beneficiaries-ai'], queryFn: () => beneficiariesService.getList({ page: 1, limit: 1 }), staleTime: 2 * 60_000 })
  const { data: camData } = useQuery({ queryKey: ['campaigns', 1],    queryFn: () => campaignsService.getList({ page: 1, limit: 10 }),  staleTime: 2 * 60_000 })
  const { data: volData } = useQuery({ queryKey: ['volunteers-ai'],    queryFn: () => volunteersService.getList({ page: 1, limit: 1 }), staleTime: 2 * 60_000 })

  return {
    kpis,
    donations: {
      total:    donData?.total ?? 0,
      recent:   donData?.data  ?? [],
      approved: donData?.data?.filter(d => d.status === 'approved').length ?? 0,
      pending:  donData?.data?.filter(d => d.status === 'pending').length  ?? 0,
      rejected: donData?.data?.filter(d => d.status === 'rejected').length ?? 0,
    },
    beneficiaries: { total: benData?.total ?? 0, active: 0, pending: 0, urgent: 0 },
    campaigns: {
      total:  camData?.total ?? 0,
      active: camData?.data?.filter(c => c.status === 'active').length ?? 0,
      list:   camData?.data ?? [],
    },
    volunteers: { total: volData?.total ?? 0, pending: 0, approved: 0, completed: 0 },
  }
}

// ─── فقاعة الرسالة ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isAr }) {
  const isUser = msg.role === 'user'

  if (msg.error) {
    return (
      <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <AlertCircle size={16} color="#dc2626" />
        </div>
        <div style={{ maxWidth:'75%', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'14px', padding:'12px 15px' }}>
          <p style={{ fontSize:'13px', fontWeight:600, color:'#b91c1c', marginBottom:'4px' }}>⚠ حدث خطأ</p>
          <p style={{ fontSize:'12px', color:'#dc2626' }}>{msg.errorMsg ?? 'تحقق من API Key'}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display:'flex', gap:'10px',
      flexDirection: isUser
        ? (isAr ? 'row' : 'row-reverse')
        : (isAr ? 'row-reverse' : 'row'),
      alignItems:'flex-end',
    }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, background: isUser ? '#094037' : '#e6f0ee', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.1)' }}>
        {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#094037" />}
      </div>
      <div style={{
        maxWidth:'72%', padding:'12px 16px',
        borderRadius: isUser
          ? (isAr ? '18px 4px 18px 18px' : '4px 18px 18px 18px')
          : (isAr ? '4px 18px 18px 18px' : '18px 4px 18px 18px'),
        background:  isUser ? '#094037' : 'var(--bg-surface)',
        color:       isUser ? '#fff' : 'var(--text-primary)',
        fontSize:    '1rem',
        lineHeight:  1.7,
        whiteSpace:  'pre-wrap',
        wordBreak:   'break-word',
        border:      isUser ? 'none' : '1px solid var(--border-default)',
        boxShadow:   '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

// ─── مؤشر التحميل ─────────────────────────────────────────────────────────────
function TypingIndicator({ isAr }) {
  return (
    <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#e6f0ee', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Bot size={16} color="#094037" />
      </div>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'18px 4px 18px 18px', padding:'14px 18px', display:'flex', gap:'5px', alignItems:'center' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#094037', display:'block', animation:`typing 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1}}`}</style>
    </div>
  )
}

// ─── الشاشة الترحيبية ─────────────────────────────────────────────────────────
function WelcomeScreen({ suggestions, onSuggest, isAr, kpis }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', padding:'2rem 1rem', maxWidth:'520px', margin:'0 auto' }}>

      {/* أيقونة */}
      <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#094037,#0D5247)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(9,64,55,0.3)' }}>
        <Sparkles size={30} color="#eab308" />
      </div>

      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'6px' }}>
          {isAr ? 'مساعد الجمعية الذكي' : 'AI Charity Assistant'}
        </h2>
        <p style={{ fontSize:'1rem', color:'var(--text-muted)', lineHeight:1.6 }}>
          {isAr
            ? 'اسألني عن أي شيء في النظام — التبرعات، الحالات، الحملات، المتطوعون'
            : 'Ask about anything in the system — donations, cases, campaigns, volunteers'}
        </p>
      </div>

      {/* بطاقات إحصائية سريعة */}
      {kpis && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px', width:'100%' }}>
          {[
            { label: isAr ? 'إجمالي التبرعات' : 'Total Donations', value: kpis.totalDonations?.value?.toLocaleString('ar-SY') ?? '—', unit: 'ل.س', color:'#111', bg:'#eab308' },
            { label: isAr ? 'الحالات النشطة'  : 'Active Cases',    value: kpis.activeCases?.value ?? '—',       unit: '',     color:'#111', bg:'#eab308' },
            { label: isAr ? 'الحملات الجارية' : 'Active Campaigns',value: kpis.activeCampaigns?.value ?? '—',   unit: '',     color:'#111', bg:'#eab308' },
            { label: isAr ? 'المستفيدون'       : 'Beneficiaries',   value: kpis.totalBeneficiaries?.value ?? '—',unit: '',     color:'#111', bg:'#eab308' },
          ].map(({ label, value, unit, color, bg }) => (
            <div key={label} style={{ background:bg, borderRadius:'10px', padding:'10px 12px' }}>
              <p style={{ fontSize:'11px', color, fontWeight:600, marginBottom:'3px' }}>{label}</p>
              <p style={{ fontSize:'1rem', fontWeight:800, color }}>{value} <span style={{ fontSize:'11px', fontWeight:400 }}>{unit}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* أسئلة مقترحة */}
      <div style={{ width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
          <Lightbulb size={14} color="#a16207" />
          <p style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)' }}>
            {isAr ? 'جرّب أحد هذه الأسئلة' : 'Try one of these'}
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {suggestions.map((q, i) => (
            <button key={i} onClick={() => onSuggest(q)}
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'10px', padding:'10px 14px', fontSize:'0.83rem', color:'var(--text-secondary)', cursor:'pointer', textAlign: isAr ? 'right' : 'left', transition:'all 0.15s', fontFamily:'Cairo,sans-serif', display:'flex', alignItems:'center', gap:'8px' }}
              onMouseEnter={e => { e.currentTarget.style.background='#e6f0ee'; e.currentTarget.style.color='#094037'; e.currentTarget.style.borderColor='#094037' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border-default)' }}
            >
              <ChevronLeft size={14} style={{ flexShrink:0, transform: isAr ? 'none' : 'scaleX(-1)', color:'#094037' }} />
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function AIPage() {
  const { i18n }  = useTranslation()
  const isAr      = i18n.language?.startsWith('ar')
  const lang      = isAr ? 'ar' : 'en'

  const [input, setInput] = useState('')

  const dashboardData = useDashboardContext()
  const { messages, isLoading, error, sendMessage, clearChat, stopGeneration } = useAIAssistant()

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const suggestions    = SUGGESTED_QUESTIONS[lang] ?? SUGGESTED_QUESTIONS.ar

  const hasApiKey = !!import.meta.env.VITE_GEMINI_KEY

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback((text) => {
    const q = (text ?? input).trim()
    if (!q) return
    setInput('')
    sendMessage(q, dashboardData, lang)
  }, [input, dashboardData, lang, sendMessage])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - var(--navbar-height) - 2rem)', borderRadius:'16px', overflow:'hidden', background:'var(--bg-surface)', border:'1px solid var(--border-default)', boxShadow:'var(--shadow-card)' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg, #094037 0%, #0D5247 100%)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Sparkles size={20} color="#eab308" />
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:'1rem', color:'#fff' }}>
              {isAr ? 'المساعد الذكي' : 'AI Assistant'}
            </p>
            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>
              Gemini AI · {isAr ? 'بيانات الداشبورد الحية' : 'Live dashboard data'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.85)', cursor:'pointer', fontSize:'12px', fontFamily:'Cairo,sans-serif' }}>
            <Trash2 size={13} />
            {isAr ? 'محادثة جديدة' : 'New chat'}
          </button>
        )}
      </div>

      {/* تحذير بدون key */}
      {!hasApiKey && (
        <div style={{ background:'#fef9c3', padding:'10px 16px', fontSize:'13px', color:'#92400e', flexShrink:0, display:'flex', alignItems:'center', gap:'6px' }}>
          ⚠ {isAr ? 'أضف VITE_GEMINI_KEY في ملف .env' : 'Add VITE_GEMINI_KEY in .env'}
        </div>
      )}

      {/* خطأ */}
      {error && (
        <div style={{ background:'#fef2f2', padding:'10px 16px', fontSize:'13px', color:'#b91c1c', flexShrink:0, display:'flex', alignItems:'center', gap:'6px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'14px', scrollbarWidth:'thin' }}>
        {messages.length === 0
          ? <WelcomeScreen suggestions={suggestions} onSuggest={q => handleSend(q)} isAr={isAr} kpis={dashboardData.kpis} />
          : messages.map(msg => <MessageBubble key={msg.id} msg={msg} isAr={isAr} />)
        }
        {isLoading && <TypingIndicator isAr={isAr} />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border-default)', background:'var(--bg-muted)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'14px', padding:'10px 14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isAr ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
            rows={1}
            disabled={!hasApiKey}
            style={{ flex:1, resize:'none', border:'none', outline:'none', background:'transparent', fontSize:'1rem', fontFamily:'Cairo,sans-serif', color:'var(--text-primary)', lineHeight:1.6, maxHeight:'120px', direction: isAr ? 'rtl' : 'ltr' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          />
          {isLoading ? (
            <button onClick={stopGeneration}
              style={{ width:'38px', height:'38px', borderRadius:'10px', border:'none', background:'#fee2e2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <StopCircle size={18} color="#b91c1c" />
            </button>
          ) : (
            <button onClick={() => handleSend()}
              disabled={!input.trim() || !hasApiKey}
              style={{ width:'38px', height:'38px', borderRadius:'10px', border:'none', background: input.trim() && hasApiKey ? '#094037' : 'var(--bg-muted)', cursor: input.trim() && hasApiKey ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s' }}>
              <Send size={16} color={input.trim() && hasApiKey ? '#fff' : 'var(--text-muted)'} style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
            </button>
          )}
        </div>
        <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text-muted)', marginTop:'6px' }}>
          {isAr ? 'Enter للإرسال · Shift+Enter لسطر جديد' : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}