import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bot, X, Send, Trash2, StopCircle, Sparkles, ChevronDown, User, AlertCircle } from 'lucide-react'

import { useAIAssistant, SUGGESTED_QUESTIONS } from '../../hooks/useAIAssistant'
import { dashboardService }     from '../../service/ServiceLayer'
import { donationsService }     from '../../service/ServiceLayer'
import { beneficiariesService } from '../../service/ServiceLayer'
import { campaignsService }     from '../../service/ServiceLayer'
import { volunteersService }    from '../../service/ServiceLayer'
import PermissionButton from '../../ui/PermissionButton'
// ─── جلب بيانات الداشبورد ────────────────────────────────────────────────────
function useDashboardContext() {
  const { data: kpis }    = useQuery({ queryKey: ['kpis'],               queryFn: dashboardService.getKPIs,                              staleTime: 2 * 60_000 })
  const { data: donData } = useQuery({ queryKey: ['donations', '', 1],   queryFn: () => donationsService.getList({ page: 1, limit: 5 }), staleTime: 2 * 60_000 })
  const { data: benData } = useQuery({ queryKey: ['beneficiaries-ai'],   queryFn: () => beneficiariesService.getList({ page: 1, limit: 1 }), staleTime: 2 * 60_000 })
  const { data: camData } = useQuery({ queryKey: ['campaigns', 1],       queryFn: () => campaignsService.getList({ page: 1, limit: 10 }), staleTime: 2 * 60_000 })
  const { data: volData } = useQuery({ queryKey: ['volunteers-ai'],       queryFn: () => volunteersService.getList({ page: 1, limit: 1 }), staleTime: 2 * 60_000 })

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

// ─── فقاعة الرسالة ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isAr }) {
  const isUser = msg.role === 'user'

  // ✅ رسالة خطأ تفصيلية
  if (msg.error) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertCircle size={14} color="#dc2626" />
        </div>
        <div style={{ maxWidth: '78%', padding: '10px 13px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, marginBottom: '3px' }}>⚠ حدث خطأ</p>
          <p style={{ fontSize: '0.78rem', color: '#dc2626', opacity: 0.85 }}>{msg.errorMsg ?? 'تحقق من API Key في ملف .env'}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', gap: '8px',
      flexDirection: isUser ? (isAr ? 'row' : 'row-reverse') : (isAr ? 'row-reverse' : 'row'),
      alignItems: 'flex-end',
    }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: isUser ? '#094037' : '#e6f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUser ? <User size={14} color="#fff" /> : <Bot size={14} color="#094037" />}
      </div>
      <div style={{
        maxWidth: '78%', padding: '10px 13px',
        borderRadius: isUser
          ? (isAr ? '16px 4px 16px 16px' : '4px 16px 16px 16px')
          : (isAr ? '4px 16px 16px 16px' : '16px 4px 16px 16px'),
        background: isUser ? '#094037' : 'var(--bg-muted)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: '0.84rem', lineHeight: 1.65,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

// ─── مؤشر التحميل ────────────────────────────────────────────────────────────
function TypingIndicator({ isAr }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexDirection: isAr ? 'row-reverse' : 'row' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e6f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={14} color="#094037" />
      </div>
      <div style={{ background: 'var(--bg-muted)', borderRadius: '16px 4px 16px 16px', padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#094037', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}

// ─── شاشة الترحيب ────────────────────────────────────────────────────────────
function WelcomeScreen({ suggestions, onSuggest, isAr }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '1.5rem', gap: '1rem', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#094037,#0D5247)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(9,64,55,0.3)' }}>
        <Sparkles size={24} color="#eab308" />
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {isAr ? 'مساعد الجمعية الذكي' : 'AI Charity Assistant'}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {isAr ? 'اسألني عن أي شيء في النظام' : 'Ask me anything about the system'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '8px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
          {isAr ? 'أسئلة مقترحة:' : 'Suggested questions:'}
        </p>
        {suggestions.map((q, i) => (
          <PermissionButton  key={i} onClick={() => onSuggest(q)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: isAr ? 'right' : 'left', transition: 'all 0.15s', fontFamily: 'Cairo, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e6f0ee'; e.currentTarget.style.color = '#094037'; e.currentTarget.style.borderColor = '#094037' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}>
            {q}
          </PermissionButton >
        ))}
      </div>
    </div>
  )
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function AIAssistant() {
  const { i18n }  = useTranslation()
  const isAr      = i18n.language?.startsWith('ar')
  const lang      = isAr ? 'ar' : 'en'

  const [isOpen,     setIsOpen]     = useState(false)
  const [input,      setInput]      = useState('')
  const [showScroll, setShowScroll] = useState(false)

  const dashboardData = useDashboardContext()

  // ✅ stopGeneration الآن موجودة في الـ hook
  const { messages, isLoading, error, sendMessage, clearChat, stopGeneration } = useAIAssistant()

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const listRef        = useRef(null)
  const suggestions    = SUGGESTED_QUESTIONS[lang] ?? SUGGESTED_QUESTIONS.ar

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    setShowScroll(scrollHeight - scrollTop - clientHeight > 80)
  }, [])

  const handleSend = useCallback((text) => {
    const q = (text ?? input).trim()
    if (!q) return
    setInput('')
    sendMessage(q, dashboardData, lang)
  }, [input, dashboardData, lang, sendMessage])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const hasApiKey = !!import.meta.env.VITE_GEMINI_KEY

  return (
    <>
      {/* ── زر عائم ── */}
      <PermissionButton 
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px',
          [isAr ? 'left' : 'right']: '24px',
          zIndex: 1000, width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #094037 0%, #0D5247 100%)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(9,64,55,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {isOpen ? <X size={22} color="#fff" /> : <Sparkles size={22} color="#eab308" />}
        {!isOpen && hasApiKey && (
          <span style={{ position: 'absolute', top: '4px', [isAr ? 'left' : 'right']: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
        )}
      </PermissionButton >
{/* أضف هذا مباشرة قبل نافذة الدردشة */}
{isOpen && (
  <div
    onClick={() => setIsOpen(false)}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(3px)',
      zIndex: 998,
    }}
  />
)}
      {/* ── نافذة الدردشة ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '88px',
          [isAr ? 'left' : 'right']: '24px',
          zIndex: 999,
          width: 'min(400px, calc(100vw - 48px))', height: '540px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
          animation: 'slideUp 0.22s ease-out',
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #094037 0%, #0D6050 100%)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={17} color="#eab308" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                  {isAr ? 'المساعد الذكي' : 'AI Assistant'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>
                  Gemini · {isAr ? 'يعرف بياناتك الحية' : 'Live data aware'}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <PermissionButton  onClick={clearChat}
                style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)' }}>
                <Trash2 size={14} />
              </PermissionButton >
            )}
          </div>

          {/* تحذير بدون key */}
          {!hasApiKey && (
            <div style={{ background: '#fef9c3', padding: '8px 14px', fontSize: '0.875rem', color: '#92400e', flexShrink: 0 }}>
              ⚠ أضف <code>VITE_GEMINI_KEY</code> في ملف <code>.env</code>
            </div>
          )}

          {/* ✅ عرض رسالة الخطأ العامة إن وُجدت */}
          {error && (
            <div style={{ background: '#fef2f2', padding: '8px 14px', fontSize: '0.875rem', color: '#b91c1c', flexShrink: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {/* Messages */}
          <div ref={listRef} onScroll={handleScroll}
            style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', scrollbarWidth: 'thin' }}>
            {messages.length === 0
              ? <WelcomeScreen suggestions={suggestions} onSuggest={q => handleSend(q)} isAr={isAr} />
              : messages.map(msg => <MessageBubble key={msg.id} msg={msg} isAr={isAr} />)
            }
            {isLoading && <TypingIndicator isAr={isAr} />}
            <div ref={messagesEndRef} />
          </div>

          {showScroll && (
            <PermissionButton  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              style={{ position: 'absolute', bottom: '70px', [isAr ? 'left' : 'right']: '16px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <ChevronDown size={16} color="var(--text-muted)" />
            </PermissionButton >
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '8px', alignItems: 'flex-end', flexShrink: 0, background: 'var(--bg-muted)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isAr ? 'اكتب سؤالك...' : 'Type your question...'}
              rows={1}
              disabled={!hasApiKey}
              style={{ flex: 1, resize: 'none', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '9px 12px', fontSize: '0.84rem', fontFamily: 'Cairo, sans-serif', outline: 'none', background: 'var(--bg-surface)', color: 'var(--text-primary)', lineHeight: 1.5, maxHeight: '100px', direction: isAr ? 'rtl' : 'ltr' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }}
            />
            {isLoading ? (
              <PermissionButton  onClick={stopGeneration}
                style={{ width: '38px', height: '38px', borderRadius: '12px', border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <StopCircle size={18} color="#b91c1c" />
              </PermissionButton >
            ) : (
              <PermissionButton  onClick={() => handleSend()}
                disabled={!input.trim() || !hasApiKey}
                style={{ width: '38px', height: '38px', borderRadius: '12px', border: 'none', background: input.trim() && hasApiKey ? '#094037' : 'var(--bg-muted)', cursor: input.trim() && hasApiKey ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                <Send size={16} color={input.trim() && hasApiKey ? '#fff' : 'var(--text-muted)'} style={{ transform: isAr ? 'scaleX(-1)' : 'none' }} />
              </PermissionButton >
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '4px 0 8px', background: 'var(--bg-muted)', flexShrink: 0 }}>
            {isAr ? 'مدعوم بـ Gemini AI · بيانات الداشبورد الحية' : 'Powered by Gemini AI · Live dashboard data'}
          </p>
        </div>
      )}
    </>
  )
}