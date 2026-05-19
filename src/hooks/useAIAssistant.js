import { useState, useCallback, useRef, useEffect } from 'react'

const API_URL = (key) =>
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`

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

    if (beneficiaries) {
        lines.push(`\n## Beneficiaries: Urgent Priority Cases: ${beneficiaries.urgent ?? 0} out of ${beneficiaries.total ?? 0}`)
    }

    if (campaigns?.list) {
        lines.push(`\n## Campaigns Progress:`)
        campaigns.list.slice(0, 5).forEach(c => {
            const pct = c.targetAmount > 0 ? Math.round((c.collectedAmount / c.targetAmount) * 100) : 0
            lines.push(`- ${c.name}: ${pct}% completed`)
        })
    }

    return lines.join('\n')
}

// ─── الـ Hook المطور ──────────────────────────────────────────────────────────
export function useAIAssistant() {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)
    const scrollRef = useRef(null) // مرجع للسكروول التلقائي

    // التحريك التلقائي للأسفل عند إضافة رسالة جديدة
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    const sendMessage = useCallback(async (question, dashboardData = {}) => {
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
            const context = buildContext(dashboardData)

            // تحويل مصفوفة الرسائل الحالية إلى History يفهمه Gemini
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))

            const systemPrompt = `
            Identity: Expert Charity Data Analyst for a Syrian NGO.
            Task: Answer questions based ONLY on the provided context.
            Language Rule: ALWAYS reply in the SAME LANGUAGE as the user's last message.
            Behavior: 
            - If data is missing, say "Information not available".
            - Be concise but insightful (e.g., notice if urgent cases are high).
            - Use Markdown (bold, lists) for clarity.
            
            Context Data:
            ${context}`

            const res = await fetch(API_URL(apiKey), {
                method: 'POST',
                signal: abortRef.current.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        ...history, // إرسال التاريخ لضمان الذاكرة
                        {
                            role: 'user',
                            parts: [{ text: `${systemPrompt}\n\nUser Question: ${question}` }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.5, // تقليل العشوائية لضمان دقة الأرقام
                        maxOutputTokens: 800,
                    },
                }),
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData?.error?.message || `Error: ${res.status}`)
            }

            const data = await res.json()
            const candidate = data.candidates?.[0]

            if (candidate?.finishReason === 'SAFETY') throw new Error('Blocked by safety filters.')

            const content = candidate?.content?.parts?.[0]?.text

            if (!content?.trim()) throw new Error('Empty response from AI.')

            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, role: 'assistant', content: content.trim() },
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
        scrollRef // مرري هذا المرجع لحاوية الرسائل في الواجهة (div)
    }
}

export const SUGGESTED_QUESTIONS = {
    ar: [
        'لخّص أداء الجمعية هذا الشهر',
        'كم إجمالي التبرعات؟',
        'هل توجد حالات عاجلة؟',
        'ما حالة الحملات النشطة؟',
        'كم متطوعاً قيد الانتظار؟',
        'اكتب تقرير مختصر للجهات المانحة',
    ],
    en: [
        'Summarize this month\'s performance',
        'What is the total donations?',
        'Are there urgent cases?',
        'What is the status of active campaigns?',
        'How many pending volunteers?',
    ],
}