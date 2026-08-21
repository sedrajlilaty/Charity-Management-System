import axiosInstance from '../api/axiosInstance'

export const sponsorshipApi = {
    // كل اليتامى المكفولين حالياً — الباك بيرجعن كطلبات (requests) فيها بيانات اليتيم/الكفيل/التبرعات
    getSponsoredOrphans: async () => {
        const { data } = await axiosInstance.get('/orphans/sponsored/list')
        return data
    },

    // كفالات المستخدم الحالي (احتياطي لصفحة "كفالاتي" مستقبلاً)
    getMySponsoredOrphans: async () => {
        const { data } = await axiosInstance.get('/orphans/my-sponsored/list')
        return data
    },

    // تفاصيل كفالة يتيم محدد — فيها next_monthly_deduction_at
    getSponsorshipInfo: async (orphanId) => {
        const { data } = await axiosInstance.get(`/orphanssponsorship-info/${orphanId}`)
        return data
    },

    // إلغاء الكفالة — بالـ orphan_id، DELETE
    cancelSponsorship: async (orphanId) => {
        const { data } = await axiosInstance.delete(`/orphanssponsor/${orphanId}`)
        return data
    },
}