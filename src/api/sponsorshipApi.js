import axiosInstance from '../api/axiosInstance' // ⚠️ عدلي المسار حسب مكان axiosInstance عندك (متل باقي الـ api files)

const BASE = '/sponsorships' // ⚠️ placeholder — بدّليه لما ياخد الباك اسمو النهائي

export const sponsorshipApi = {
    /**
     * المصدر الأساسي لجدول الداشبورد:
     * يرجع كل يتيم + مين الكفيل تبعو (أو null إذا مش مكفول) + تاريخ بداية الكفالة + الحالة
     */
    getOrphansWithSponsors: async (params = {}) => {
        const { data } = await axiosInstance.get(`${BASE}/orphans`, { params })
        return data
    },

    // يرجع كل اليتامى الكفالى بس (احتياطي لو احتجناه بمكان تاني)
    getSponsoredOrphans: async (params = {}) => {
        const { data } = await axiosInstance.get(`${BASE}/orphans/sponsored`, { params })
        return data
    },

    // يرجع بشو متكفل كفيل معين (مفيدة لصفحة تفاصيل الكفيل لاحقاً)
    getSponsorSponsorships: async (sponsorId) => {
        const { data } = await axiosInstance.get(`${BASE}/sponsors/${sponsorId}`)
        return data
    },

    // إلغاء كفالة — لما الكفيل يوقف عن الدفع
    cancelSponsorship: async (sponsorshipId) => {
        const { data } = await axiosInstance.post(`${BASE}/${sponsorshipId}/cancel`)
        return data
    },
}