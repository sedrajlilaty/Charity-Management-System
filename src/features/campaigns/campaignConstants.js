// features/campaigns/campaignConstants.js
// ثوابت مشتركة بين CampaignModal و Campaigns.jsx و Badge — كل شي بمفاتيح ترجمة
export const CAMPAIGN_TYPES = [
    { value: 'educational', labelKey: 'campaigns.types.educational' },
    { value: 'medical', labelKey: 'campaigns.types.medical' },
    { value: 'humanitarian', labelKey: 'campaigns.types.humanitarian' },
    { value: 'environmental', labelKey: 'campaigns.types.environmental' },
]

export const PARTICIPATION_TYPES = [
    { value: 'donation_only', labelKey: 'campaigns.participationTypes.donationOnly' },
    { value: 'volunteer_only', labelKey: 'campaigns.participationTypes.volunteerOnly' },
    { value: 'donation_and_volunteer', labelKey: 'campaigns.participationTypes.donationAndVolunteer' },
]

// الحالات المسموح للمستخدم يحددها يدوياً فقط (الباقي زي completed_* و expired منظومة تلقائية)
export const EDITABLE_STATUSES = [
    { value: 'open', labelKey: 'campaigns.statuses.open' },
    { value: 'closed', labelKey: 'campaigns.statuses.closed' },
    { value: 'paused', labelKey: 'campaigns.statuses.paused' },
    { value: 'cancelled', labelKey: 'campaigns.statuses.cancelled' },
]

// كل الحالات الممكنة (تُستخدم لعرض Badge حتى للحالات النظامية)
export const ALL_STATUS_LABEL_KEYS = {
    open: 'campaigns.statuses.open',
    closed: 'campaigns.statuses.closed',
    paused: 'campaigns.statuses.paused',
    cancelled: 'campaigns.statuses.cancelled',
    expired: 'campaigns.statuses.expired',
    completed_donations: 'campaigns.statuses.completedDonations',
    completed_volunteers: 'campaigns.statuses.completedVolunteers',
    completed_all: 'campaigns.statuses.completedAll',
}

// كل الحالات — تُستخدم بفلتر الحالة (بعكس EDITABLE_STATUSES المستخدمة بالمودال بس)
export const FILTERABLE_STATUSES = [
    { value: 'open', labelKey: 'campaigns.statuses.open' },
    { value: 'closed', labelKey: 'campaigns.statuses.closed' },
    { value: 'paused', labelKey: 'campaigns.statuses.paused' },
    { value: 'cancelled', labelKey: 'campaigns.statuses.cancelled' },
    { value: 'expired', labelKey: 'campaigns.statuses.expired' },
    { value: 'completed_donations', labelKey: 'campaigns.statuses.completedDonations' },
    { value: 'completed_volunteers', labelKey: 'campaigns.statuses.completedVolunteers' },
    { value: 'completed_all', labelKey: 'campaigns.statuses.completedAll' },
]

// خيارات الترتيب — لازم تطابق sort_by المسموح بالباك بالضبط
export const SORT_OPTIONS = [
    { value: 'created_at', labelKey: 'campaigns.filters.sort.newest' },
    { value: 'amount_needed', labelKey: 'campaigns.filters.sort.amountNeeded' },
    { value: 'amount_collected', labelKey: 'campaigns.filters.sort.amountCollected' },
    { value: 'start_date', labelKey: 'campaigns.filters.sort.startDate' },
    { value: 'end_date', labelKey: 'campaigns.filters.sort.endDate' },
    { value: 'title', labelKey: 'campaigns.filters.sort.title' },
]