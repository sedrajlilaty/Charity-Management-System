// ── certificatesService.js (محدّث) ──────────────────────────────────────────
// التغيير: totalHours تُحسب الآن من مجموع campaignHours بدل قيمة ثابتة

import { MOCK_VOLUNTEERS, getTotalHours } from '../features/certificates/mockVolunteers'

const REQUIRED_HOURS = 50 // الحد المطلوب لإصدار شهادة - يمكن جعله إعداد عام

// حالة الإصدار (issued/issueDate) محفوظة بشكل منفصل عن بيانات المتطوع
let ISSUED_CERTIFICATES = {
    // 'V-102': { id: 'CERT-0002', issueDate: '2026-05-12' },
}

function buildCertificateRow(volunteer) {
    const totalHours = getTotalHours(volunteer)
    const issued = ISSUED_CERTIFICATES[volunteer.id]

    return {
        id: issued?.id || `CERT-${volunteer.id}`,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        phone: volunteer.phone,
        totalHours,
        requiredHours: REQUIRED_HOURS,
        status: issued ? 'issued' : totalHours >= REQUIRED_HOURS ? 'eligible' : 'not_eligible',
        issueDate: issued?.issueDate || null,
        // ✅ تفصيل الساعات حسب الحملة - مفيد لعرضه داخل معاينة الشهادة لو احتجناه
        campaignHours: volunteer.campaignHours || [],
    }
}

export const certificatesService = {
    getList: async ({ search = '', status = '', page = 1, limit = 10 } = {}) => {
        await new Promise((r) => setTimeout(r, 300))

        let rows = MOCK_VOLUNTEERS
            .map(buildCertificateRow)
            // فقط المستحقين أو من أُصدرت لهم شهادة (إخفاء not_eligible من القائمة الافتراضية)
            .filter((c) => c.status !== 'not_eligible' || status === 'not_eligible')

        if (search) {
            rows = rows.filter((c) => c.volunteerName.toLowerCase().includes(search.toLowerCase()))
        }

        if (status) {
            rows = rows.filter((c) => c.status === status)
        }

        const total = rows.length
        const start = (page - 1) * limit
        const data = rows.slice(start, start + limit)

        return { data, total }
    },

    issueCertificate: async (certificateId) => {
        await new Promise((r) => setTimeout(r, 300))

        const row = MOCK_VOLUNTEERS
            .map(buildCertificateRow)
            .find((c) => c.id === certificateId)

        if (!row) return null

        ISSUED_CERTIFICATES[row.volunteerId] = {
            id: row.id,
            issueDate: new Date().toISOString().split('T')[0],
        }

        return buildCertificateRow(MOCK_VOLUNTEERS.find((v) => v.id === row.volunteerId))
    },
}