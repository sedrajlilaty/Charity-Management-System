// ── volunteersService.js ─────────────────────────────────────────────────
// خدمة التطوع: تغطي مسارين منفصلين
//  (أ) طلبات التطوع العامة بالجمعية  → /volunteer-applications/*  + /volunteer/*
//  (ب) متطوعين حملة معينة           → /campaigns/{id}/volunteers/*

import api from '../api/axiosInstance' // ✅ عدّلي المسار حسب مكان instance الـ axios عندك

export const volunteersService = {
    // ============================================================
    // طلب تطوع عام (المستخدم نفسه)
    // ============================================================
    submitApplication: (payload) =>
        api.post('/volunteer/apply', payload).then((r) => r.data),

    getMyApplication: () =>
        api.get('/volunteer/me').then((r) => r.data),

    getSkillsList: () =>
        api.get('/volunteer/skills').then((r) => r.data), // { success, skills: [ 'design', ... ] }

    // ============================================================
    // مراجعة طلبات التطوع العامة (أدمن) — صفحة Volunteers.jsx
    // ============================================================
    getApplicationsByStatus: (status) => {
        // status: '' (الكل عبر filter) | 'pending' | 'approved' | 'rejected' | 'suspended'
        if (!status) return api.get('/volunteer-applications/filter').then((r) => r.data)
        return api.get(`/volunteer-applications/${status}`).then((r) => r.data)
    },

    filterApplications: (params) =>
        // params: { status, gender, governorate_id, skill }
        api.get('/volunteer-applications/filter', { params }).then((r) => r.data),

    reviewApplication: (volunteerId, status) =>
        api.patch(`/volunteer-applications/${volunteerId}`, { status }).then((r) => r.data),

    getApprovedGeneralVolunteers: () =>
        api.get('/approved-general-volunteers').then((r) => r.data),

    // ============================================================
    // التطوع لحملة (المستخدم نفسه)
    // ============================================================
    volunteerForCampaign: (campaignId, notes) =>
        api.post(`/campaigns/volunteer/${campaignId}`, { notes }).then((r) => r.data),

    getMyApprovedCampaigns: () =>
        api.get('/my-campaigns/approved').then((r) => r.data),

    getMyPendingCampaigns: () =>
        api.get('/my-campaigns/pending').then((r) => r.data),

    getMyVolunteerHours: () =>
        api.get('/my-volunteer-hours').then((r) => r.data),

    // ============================================================
    // متطوعين حملة معينة (أدمن) — CampaignVolunteersModal
    // ============================================================
    getCampaignVolunteers: (campaignId) =>
        api.get(`/campaigns/${campaignId}/volunteers`).then((r) => r.data), // { success, volunteers: [...] }

    getCampaignVolunteersByStatus: (campaignId, status) =>
        // status: 'pending' | 'approved' | 'rejected'
        api.get(`/campaigns/${campaignId}/volunteers/${status}`).then((r) => r.data),

    updateCampaignVolunteerStatus: (campaignId, volunteerId, status) =>
        api.patch(`/campaigns/${campaignId}/volunteers/${volunteerId}`, { status }).then((r) => r.data),

    // ============================================================
    // ساعات التطوع ضمن حملة (field_worker فقط للإضافة)
    // ============================================================
    addVolunteerHours: (campaignId, volunteerId, { date, hours, activity_description }) =>
        api
            .post(`/campaigns/${campaignId}/volunteers/${volunteerId}/hours`, {
                date,
                hours,
                activity_description,
            })
            .then((r) => r.data), // { success, entry, total_hours_in_campaign, total_hours_overall }

    getVolunteerHoursInCampaign: (campaignId, volunteerId) =>
        api
            .get(`/campaigns/${campaignId}/volunteers/${volunteerId}/hours`)
            .then((r) => r.data), // { success, entries: [...], total_hours }
}

// ============================================================
// خريطة تسمية المهارات — الباك اند بيرجع مفاتيح إنجليزية بس بدون ترجمة
// لازم نترجمها محلياً بالفرونت (ولا داعي لأي endpoint إضافي)
// ============================================================
export const SKILLS_LABELS_AR = {
    design: 'تصميم',
    translation: 'ترجمة',
    accounting: 'محاسبة',
    hr: 'موارد بشرية',
    photography: 'تصوير',
    video_editing: 'مونتاج فيديو',
    counseling_mental_health: 'دعم نفسي',
    child_psychosocial_support: 'دعم نفسي-اجتماعي للأطفال',
    public_relations: 'علاقات عامة',
    field_work: 'عمل ميداني',
    first_aid: 'إسعافات أولية',
    medical_support: 'دعم طبي',
    teaching: 'تعليم',
    logistics: 'لوجستيات',
    event_management: 'إدارة فعاليات',
    social_media: 'سوشال ميديا',
    fundraising: 'جمع تبرعات',
    legal_support: 'دعم قانوني',
    it_support: 'دعم تقني',
    cooking_food_prep: 'تحضير طعام',
}

export const getSkillLabel = (key) => SKILLS_LABELS_AR[key] || key