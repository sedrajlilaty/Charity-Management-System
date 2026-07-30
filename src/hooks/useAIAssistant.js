// hooks/useAIAssistant.js — تحديث كامل (buildContext + systemInstruction + كشف لغة تلقائي)
import { useState, useCallback, useRef, useEffect } from 'react'

const API_URL = (key, model = 'gemini-2.5-flash') =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

// موديل احتياطي أخف وأرخص — بنجرب فيه لو الموديل الأساسي مزحوم (503)
const FALLBACK_MODEL = 'gemini-2.5-flash-lite'

// بانتظار قبل إعادة المحاولة عند الازدحام (Exponential backoff بسيط)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// كشف اللغة تلقائياً من نص السؤال (بدل الاعتماد الكامل على prop خارجي)
const ARABIC_REGEX = /[\u0600-\u06FF]/
function detectLang(text) {
    return ARABIC_REGEX.test(text) ? 'ar' : 'en'
}

// ════════════════════════════════════════════════
// ✏️ عدّلي هاد النص براحتك — هو التعريف الثابت للجمعية
// يترسل دايماً مع كل سؤال، والموديل بيستخدمه لما يُسأل "شو هي جمعية عطاء؟"
// ════════════════════════════════════════════════
const ATAA_ABOUT = `جمعية عطاء (Ataa) هي جمعية خيرية سورية تهدف إلى مساعدة فئات واسعة من المجتمع لتحسين أحوالهم المعيشية والاجتماعية. تقدم الجمعية دعماً مباشراً لعدة فئات من المستفيدين: المرضى، الأيتام، طلاب المدارس، وطلاب الجامعات، من خلال حملات تبرع وحملات تطوع منظمة تُدار عبر نظام إدارة داخلي شفاف.`

// ─── بناء Context محسّن لتحليل البيانات ────────────────────────────────────────
function buildContext(data = {}) {
    const { donations, beneficiaries, campaigns, volunteers, kpis } = data
    const lines = ['# High-Level Charity Management Data (Real-time)']

    if (kpis) {
        lines.push(`\n## KPIs:`)
        lines.push(`- Total Donations: ${kpis.totalDonations?.value ?? 0} SYP`)
        lines.push(`- Active Cases: ${kpis.activeCases?.value ?? 0}`)
        lines.push(`- Running Campaigns: ${kpis.activeCampaigns?.value ?? 0}`)
    }

    if (donations) {
        lines.push(`\n## Donations Details: Total(${donations.total}), Approved(${donations.approved}), Pending(${donations.pending})`)
    }

    // ✅ بيانات المستفيدين المفصّلة حسب الفئة والحالة (معلق / مقبول)
    if (beneficiaries?.pending || beneficiaries?.accepted) {
        lines.push(`\n## Beneficiaries by Category:`)
        lines.push(`- Total: ${beneficiaries.total ?? 0} (Pending: ${beneficiaries.totalPending ?? 0}, Accepted: ${beneficiaries.totalAccepted ?? 0})`)
        lines.push(`- Patients: pending ${beneficiaries.pending?.patients ?? 0} / accepted ${beneficiaries.accepted?.patients ?? 0}`)
        lines.push(`- Orphans: pending ${beneficiaries.pending?.orphans ?? 0} / accepted ${beneficiaries.accepted?.orphans ?? 0}`)
        lines.push(`- School students: pending ${beneficiaries.pending?.schoolStudents ?? 0} / accepted ${beneficiaries.accepted?.schoolStudents ?? 0}`)
        lines.push(`- University students: pending ${beneficiaries.pending?.universityStudents ?? 0} / accepted ${beneficiaries.accepted?.universityStudents ?? 0}`)
    } else if (beneficiaries) {
        lines.push(`\n## Beneficiaries: Urgent Priority Cases: ${beneficiaries.urgent ?? 0} out of ${beneficiaries.total ?? 0}`)
    }

    // ✅ الحملات — بأسماء الحقول الصحيحة (title, amountNeeded, amountCollected, status الحقيقية)
    if (campaigns?.list?.length) {
        lines.push(`\n## Campaigns Progress (${campaigns.total ?? campaigns.list.length} total, ${campaigns.active ?? 0} open):`)
        campaigns.list.slice(0, 8).forEach((c) => {
            const parts = [`- "${c.title}" [${c.status}]`]
            if (c.amountNeeded > 0) {
                const pct = Math.round((c.amountCollected / c.amountNeeded) * 100)
                parts.push(`donations: ${pct}% (${c.amountCollected}/${c.amountNeeded} SYP)`)
            }
            if (c.volunteersNeeded > 0) {
                parts.push(`volunteers: ${c.volunteersJoined ?? 0}/${c.volunteersNeeded}`)
            }
            if (c.type) parts.push(`type: ${c.type}`)
            lines.push(parts.join(' — '))
        })
    }

    if (volunteers) {
        lines.push(`\n## Volunteers: Pending(${volunteers.pending ?? 0}), Approved(${volunteers.approved ?? 0}), Total(${volunteers.total ?? 0})`)
    }

    return lines.join('\n')
}

// ─── بناء system instruction منفصل (أقوى وأثبت عبر كل الـ turns) ─────────────
function buildSystemInstruction(dashboardData, lang) {
    const context = buildContext(dashboardData)

    const langInstruction = lang === 'en'
        ? 'CRITICAL: You MUST respond ONLY in English, in every single reply, regardless of what language previous messages in this conversation were in, and even though some of the context data below is in Arabic.'
        : 'مهم جداً: لازم تجاوبي بالعربي فقط بكل رد، بغض النظر عن لغة الرسائل السابقة بالمحادثة، وحتى لو بعض بيانات السياق تحت بالإنجليزي.'

    return `Identity: Expert Charity Data Analyst & Advisor for a Syrian NGO called "Ataa" (عطاء).

${langInstruction}

About the organization (use this whenever the user asks generally about "the organization",
"عن الجمعية", "شو هي جمعية عطاء", "اشرحيلي عن الجمعية", or similar — start your answer with
this description, THEN follow it with a brief statistics summary from the Context Data below):
${ATAA_ABOUT}

Behavior:
- For factual/statistical questions (donations, cases, campaign numbers, volunteer counts):
  answer ONLY from the Context Data below. If the data is missing, say "Information not available".
- For advisory/creative questions (e.g. "اقترحيلي حملة جديدة", "كيف نجذب متبرعين أكتر",
  "اكتبيلي فكرة تسويقية", "شو رأيك نعمل حملة لكذا"): you ARE ALLOWED and ENCOURAGED to use your
  general knowledge of charity/NGO best practices and combine it with the Context Data as
  inspiration (e.g. suggest a campaign idea for a beneficiary category that currently has high
  pending numbers, or a fundraising angle based on a campaign that's behind on its target).
- Be concise but insightful (e.g., notice if urgent cases are high).
- When discussing campaigns and beneficiaries together, connect them naturally
  (e.g., mention which beneficiary categories the organization currently supports
  alongside the running campaigns), since they're both part of the same organization's work.
- Use Markdown (bold, lists) for clarity.

Context Data:
${context}`
}

// ─── الـ Hook المطور ──────────────────────────────────────────────────────────
export function useAIAssistant() {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    const sendMessage = useCallback(async (question, dashboardData = {}, lang = 'ar') => {
        if (!question.trim() || isLoading) return

        const apiKey = import.meta.env.VITE_GEMINI_KEY
        if (!apiKey) {
            setError('VITE_GEMINI_KEY is missing')
            return
        }

        const userMsg = { id: Date.now(), role: 'user', content: question }
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)
        setError(null)

        abortRef.current = new AbortController()

        try {
            // ✅ كشف اللغة من نص السؤال الفعلي، مش الاعتماد الأعمى على prop الواجهة
            // لو بدك تعطي أولوية لتفضيل المستخدم اليدوي بدل الكشف التلقائي، بدّليها لـ: lang || detectLang(question)
            const finalLang = detectLang(question)

            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))

            const systemInstructionText = buildSystemInstruction(dashboardData, finalLang)

            const requestBody = JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstructionText }]
                },
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: question }] }
                ],
                generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 2048,
                },
            })

            // ✅ نحاول: الموديل الأساسي → إعادة محاولة بعد ثانيتين → الموديل الاحتياطي الأخف
            const attempts = [
                { model: 'gemini-2.5-flash', delay: 0 },
                { model: 'gemini-2.5-flash', delay: 2000 },
                { model: FALLBACK_MODEL, delay: 500 },
            ]

            let res, lastErrMsg
            for (const attempt of attempts) {
                if (attempt.delay) await sleep(attempt.delay)
                res = await fetch(API_URL(apiKey, attempt.model), {
                    method: 'POST',
                    signal: abortRef.current.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: requestBody,
                })
                if (res.ok) break
                if (res.status !== 503) break // خطأ غير الازدحام (مثلاً 400/401) — ما في داعي نعيد المحاولة
                const errData = await res.json().catch(() => ({}))
                lastErrMsg = errData?.error?.message
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData?.error?.message || lastErrMsg || `Error: ${res.status}`)
            }

            const data = await res.json()
            const candidate = data.candidates?.[0]

            if (candidate?.finishReason === 'SAFETY') throw new Error('Blocked by safety filters.')

            // ✅ نجمع كل الـ parts مع بعض (كان الكود ياخد بس parts[0] وهاد كان سبب انقطاع الرد)
            const content = candidate?.content?.parts?.map(p => p.text ?? '').join('')

            if (!content?.trim()) throw new Error('Empty response from AI.')

            const finalContent = candidate?.finishReason === 'MAX_TOKENS'
                ? content.trim() + '\n\n_(الرد اتقطع لأنه طويل — اسألي سؤال أدق لو بدك التفاصيل كاملة)_'
                : content.trim()

            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, role: 'assistant', content: finalContent },
            ])

        } catch (err) {
            if (err.name === 'AbortError') return
            setError(err.message)
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, role: 'assistant', content: null, error: true, errorMsg: err.message },
            ])
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, messages])

    const stopGeneration = useCallback(() => {
        abortRef.current?.abort()
        setIsLoading(false)
    }, [])

    const clearChat = useCallback(() => {
        setMessages([])
        setError(null)
    }, [])

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        stopGeneration,
        scrollRef
    }
}

export const SUGGESTED_QUESTIONS = {
    ar: [
        'اشرحيلي عن الجمعية',
        'لخّص أداء الجمعية هذا الشهر',
        'كم إجمالي التبرعات؟',
        'هل توجد حالات عاجلة؟',
        'ما حالة الحملات النشطة؟',
        'كم متطوعاً قيد الانتظار؟',
        'اقترحيلي فكرة حملة جديدة',
        'اكتب تقرير مختصر للجهات المانحة',
    ],
    en: [
        'Tell me about the organization',
        'Summarize this month\'s performance',
        'What is the total donations?',
        'Are there urgent cases?',
        'What is the status of active campaigns?',
        'How many pending volunteers?',
        'Suggest a new campaign idea',
    ],
}