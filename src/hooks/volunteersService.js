import api from '../api/axiosInstance'

export const volunteersService = {
    // ============================================================
    // 1) طلب تطوع عام (المستخدم نفسه)
    // ============================================================
    submitApplication: (payload) =>
        api.post('/volunteer/apply', payload).then((r) => r.data),

    getMyApplication: () =>
        api.get('/volunteer/me').then((r) => r.data),

    getSkillsList: () =>
        api.get('/volunteer/skills').then((r) => r.data),

    // ============================================================
    // 2) مراجعة طلبات التطوع العامة (أدمن)
    // ============================================================
    getAllVolunteers: () =>
        api.get('/all-volunteers').then((r) => r.data),

    getApplicationsByStatus: (status) => {
        if (!status || status === 'all') {
            return api.get('/all-volunteers').then((r) => r.data)
        }
        return api.get(`/volunteer-applications/${status}`).then((r) => r.data)
    },

    filterApplications: (params) =>
        api.get('/volunteer-applications/filter', { params }).then((r) => r.data),

    reviewApplication: (volunteerId, status) =>
        api.patch(`/volunteer-applications/${volunteerId}`, { status }).then((r) => r.data),

    getApprovedGeneralVolunteers: () =>
        api.get('/approved-general-volunteers').then((r) => r.data),

    // ============================================================
    // 3) التطوع لحملة (المستخدم نفسه)
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
    // 4) متطوعين حملة معينة (أدمن)
    // ============================================================
    getCampaignVolunteers: (campaignId) =>
        api.get(`/campaigns/${campaignId}/volunteers`).then((r) => r.data),

    getCampaignVolunteersByStatus: (campaignId, status) =>
        api.get(`/campaigns/${campaignId}/volunteers/${status}`).then((r) => r.data),

    updateCampaignVolunteerStatus: (campaignId, volunteerId, status) =>
        api.patch(`/campaigns/${campaignId}/volunteers/${volunteerId}`, { status }).then((r) => r.data),

    // ============================================================
    // 5) ساعات التطوع
    // ============================================================
    addVolunteerHours: (campaignId, volunteerId, { date, hours, activity_description }) =>
        api
            .post(`/campaigns/${campaignId}/volunteers/${volunteerId}/hours`, {
                date,
                hours,
                activity_description,
            })
            .then((r) => r.data),

    getVolunteerHoursInCampaign: (campaignId, volunteerId) =>
        api
            .get(`/campaigns/${campaignId}/volunteers/${volunteerId}/hours`)
            .then((r) => r.data),
}

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

// تطبيع المهارات (نص مفصول بفواصل / مصفوفة نصوص / مصفوفة objects)
export const parseSkills = (skills) => {
    if (!skills) return []
    if (Array.isArray(skills)) {
        return skills
            .map((s) => {
                if (typeof s === 'string') return s.trim()
                if (s && typeof s === 'object') return s.skill || s.name || s.key || ''
                return ''
            })
            .filter(Boolean)
    }
    if (typeof skills === 'string') {
        return skills.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return []
}

// ⚠️ استخرج معلومات الحملة من الـ row — عدّل أسماء الحقول هون
// حسب الشكل الفعلي يلي بيرجعه الـ API (اعمل console.log(row) للتأكد)
// ⚠️ الحقل الحقيقي القادم من الباك: general_application (boolean)
// true  → متطوع عام (للجمعية)
// false → متطوع لحملة معينة
export const getVolunteerCampaignInfo = (row) => {
    const isGeneral = row.general_application === true

    const campaignId = isGeneral
        ? null
        : row.campaign_id ?? row.campaignId ?? row.campaign?.id ?? null

    const campaignName = isGeneral
        ? null
        : row.campaign_title ?? row.campaign_name ?? row.campaign?.title ?? row.campaign?.name ?? null

    return { campaignId, campaignName, isGeneral }
}

// ... (كل الكود السابق يبقى متل ما هو، فقط أضف هاد بالآخر)

// تجميع صفوف المتطوعين: عام (سطر لحاله) VS حملات (مجمّعة بشخص واحد)
export const groupVolunteersByPerson = (rows = []) => {
    const general = []
    const campaignMap = new Map()

    for (const row of rows) {
        const isGeneral = row.general_application === true

        if (isGeneral) {
            general.push({ ...row, __rowType: 'general' })
            continue
        }

        // ⚠️ معرّف التجميع — بدّله لـ user_id إذا موجود بالـ response
        const key = (row.email || row.phone || row.name || '').toLowerCase().trim()

        if (!campaignMap.has(key)) {
            campaignMap.set(key, {
                key,
                name: row.name,
                phone: row.phone,
                email: row.email,
                gender: row.gender,
                occupation: row.occupation,
                governorate: row.governorate,
                availability: row.availability,
                skills: row.skills,
                description: row.description,
                applications: [],
                __rowType: 'campaign-group',
            })
        }
        campaignMap.get(key).applications.push(row)
    }

    const campaignGroups = Array.from(campaignMap.values()).map((g) => {
        const statusCounts = { pending: 0, approved: 0, rejected: 0, suspended: 0 }
        g.applications.forEach((a) => {
            if (statusCounts[a.status] !== undefined) statusCounts[a.status]++
        })
        return { ...g, campaignsCount: g.applications.length, statusCounts }
    })

    return { general, campaignGroups }
}