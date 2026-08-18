import axiosInstance from './axiosInstance' // ⚠️ عدّلي المسار حسب مكان axiosInstance عندك

export const disburseApi = {
    // ── صرف حملة واحدة ──
    disburseCampaign: (campaignId) =>
        axiosInstance.post(`/disburse/campaign/${campaignId}`).then((r) => r.data),

    // ── الحملات المعلقة الصرف (فلترة من الباك مباشرة) ──
    getPendingCampaigns: () =>
        axiosInstance.get('/disburse/campaigns/pending').then((r) => r.data),

    // ── صرف طلب (حالة) واحد ──
    disburseRequest: (requestId) =>
        axiosInstance.post(`/disburse/request/${requestId}`).then((r) => r.data),

    // ── الطلبات (الحالات) المعلقة الصرف ──
    getPendingRequests: () =>
        axiosInstance.get('/disburse/requests/pending').then((r) => r.data),

    // ── تقرير شامل لشهر معين — منستخدمه لعرض إجمالي المصروف + سجل الشهر الحالي ──
    getCompleteDisbursementReport: (year, month) =>
        axiosInstance.get(`/reports/complete-disbursement/${year}/${month}`).then((r) => r.data),
}