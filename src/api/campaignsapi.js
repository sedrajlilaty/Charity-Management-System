import axiosClient from './axiosInstance'; // ⚠️ عدّلي المسار حسب مكان الـ axios instance عندك

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

/* ============================================================
   Normalizers — تحويل الـ response تبع الباك لشكل مريح للفرونت
   ============================================================ */

// بناء رابط الصورة الكامل من الـ path النسبي يلي بيرجعه الباك
export const normalizeCampaignMedia = (media = []) => {
    return (media || []).map((item) => ({
        id: item.id,
        campaign_id: item.campaign_id,
        path: item.image,
        url: item.image ? `${STORAGE_URL}/${item.image}` : null,
    }));
};

// توحيد شكل الحملة الواحدة (list item أو details)
export const normalizeCampaign = (campaign) => {
    if (!campaign) return null;

    return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description ?? null,
        type: campaign.type,
        participationType: campaign.participation_type,
        acceptsDonations: campaign.accepts_donations ?? null,
        acceptsVolunteers: campaign.accepts_volunteers ?? null,
        status: campaign.status,
        amountNeeded: campaign.amount_needed,
        amountCollected: campaign.amount_collected,
        progress: campaign.progress ?? null,
        timeRemaining: campaign.time_remaining ?? null,
        volunteersNeeded: campaign.volunteers_needed,
        volunteersJoined: campaign.volunteers_joined,
        approvedVolunteersCount: campaign.approved_volunteers_count ?? null,
        startDate: campaign.start_date ?? null,
        endDate: campaign.end_date ?? null,
        media: normalizeCampaignMedia(campaign.media),
    };
};

// تحويل paginator تبع لارافيل (current_page, data, last_page, total...) لشكل موحّد
export const normalizePaginatedCampaigns = (paginator) => {
    if (!paginator) return { items: [], meta: null };

    return {
        items: (paginator.data || []).map(normalizeCampaign),
        meta: {
            currentPage: paginator.current_page,
            lastPage: paginator.last_page,
            perPage: paginator.per_page,
            total: paginator.total,
        },
    };
};

/* ============================================================
   تحويل base64 (يلي بيرجعه ImageUpload) لـ File حقيقي قابل للرفع
   ============================================================ */
const base64ToFile = (base64, filename = 'campaign-image.png') => {
    const [header, data] = base64.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mime });
};

/* ============================================================
   Helper لبناء FormData من object فيه ملفات (media)
   ============================================================ */
export const buildCampaignFormData = (values) => {
    const formData = new FormData();

    const {
        title,
        description,
        type,
        participation_type,
        amount_needed,
        volunteers_needed,
        status,
        start_date,
        end_date,
        media, // array of File objects (جديدة فقط، اللي المستخدم ضافها هلق)
    } = values;

    if (title !== undefined) formData.append('title', title);
    if (description !== undefined && description !== null) formData.append('description', description);
    if (type !== undefined) formData.append('type', type);
    if (participation_type !== undefined) formData.append('participation_type', participation_type);
    if (amount_needed !== undefined && amount_needed !== null) formData.append('amount_needed', amount_needed);
    if (volunteers_needed !== undefined && volunteers_needed !== null) formData.append('volunteers_needed', volunteers_needed);
    if (status !== undefined && status !== null) formData.append('status', status);
    if (start_date !== undefined && start_date !== null) formData.append('start_date', start_date);
    if (end_date !== undefined && end_date !== null) formData.append('end_date', end_date);

    if (media && media.length > 0) {
        media.forEach((item, idx) => {
            // item ممكن يكون base64 (جاي من ImageUpload) أو File جاهز — منتعامل مع الحالتين
            const file = typeof item === 'string'
                ? base64ToFile(item, `campaign-image-${Date.now()}-${idx}.png`)
                : item;
            formData.append('media[]', file); // مهم: media[] حتى تنقرأ كـ array بلارافيل
        });
    }

    return formData;
};

/* ============================================================
   API Calls
   ============================================================ */
export const campaignsApi = {
    // GET /campaigns — list أساسي مع فلاتر بسيطة (type, participation_type, status, search, sort_by, sort_dir, per_page)
    getCampaigns: (params = {}) =>
        axiosClient.get('/campaigns', { params }).then((res) => res.data),

    // GET /campaignsfilter — فلترة متقدمة (نطاقات مبالغ وتواريخ)
    filterCampaigns: (params = {}) =>
        axiosClient.get('/campaignsfilter', { params }).then((res) => res.data),

    // GET /campaigns/{id}
    getCampaignDetails: (id) =>
        axiosClient.get(`/campaigns/${id}`).then((res) => res.data),

    // GET /campaigns/types
    getCampaignTypes: () =>
        axiosClient.get('/campaigns/types').then((res) => res.data),

    // GET /getParticipationTypes
    getParticipationTypes: () =>
        axiosClient.get('/getParticipationTypes').then((res) => res.data),

    // POST /storecampaign (FormData - fields + media[])
    createCampaign: (formData) =>
        axiosClient
            .post('/storecampaign', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((res) => res.data),

    // PUT /updatecampaign/{id} — نفس نمط _method: PUT المستخدم بباقي المشروع
    updateCampaign: ({ id, formData }) => {
        formData.append('_method', 'PUT');
        return axiosClient
            .post(`/updatecampaign/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((res) => res.data);
    },

    // DELETE /deletecampaign/{id}
    deleteCampaign: (id) =>
        axiosClient.delete(`/deletecampaign/${id}`).then((res) => res.data),

    // PATCH /closecampaign/{id}
    closeCampaign: (id) =>
        axiosClient.patch(`/closecampaign/${id}`).then((res) => res.data),
};