// ── mock data: بنية المتطوع - إضافة appReportedHours ────────────────────────
//
// كل إدخال بمصفوفة campaignHours الآن يحتوي:
//   - appReportedHours : الساعات التي أدخلها المتطوع من تطبيق الموبايل (read-only للأدمن)
//   - hours            : الساعات المؤكدة/المعتمدة من الإدارة (هذي تُستخدم لحساب إجمالي الشهادة)

export const MOCK_VOLUNTEERS = [
    {
        id: 'V-101',
        name: 'سارة أحمد',
        phone: '0991234567',
        email: 'sara@example.com',
        skill: 'medical',
        availability: 'morning',
        experience: '3_5',
        notes: '',
        status: 'approved',

        campaignHours: [
            { campaignId: 'C-1', campaignName: 'حملة كسوة الشتاء', appReportedHours: 32, hours: 30 },
            { campaignId: 'C-2', campaignName: 'حملة الإفطار الرمضاني', appReportedHours: 22, hours: 22 },
        ],
    },
    {
        id: 'V-102',
        name: 'محمد خالد',
        phone: '0998765432',
        email: 'mohammad@example.com',
        skill: 'logistics',
        availability: 'flexible',
        experience: '5_plus',
        notes: '',
        status: 'approved',

        campaignHours: [
            { campaignId: 'C-1', campaignName: 'حملة كسوة الشتاء', appReportedHours: 45, hours: 40 },
            { campaignId: 'C-3', campaignName: 'حملة دعم الأيتام', appReportedHours: 20, hours: 20 },
        ],
    },
    {
        id: 'V-103',
        name: 'لمى يوسف',
        phone: '0944112233',
        email: 'lama@example.com',
        skill: 'social',
        availability: 'evening',
        experience: '1_2',
        notes: '',
        status: 'completed',

        campaignHours: [
            { campaignId: 'C-2', campaignName: 'حملة الإفطار الرمضاني', appReportedHours: 38, hours: 35 },
            { campaignId: 'C-3', campaignName: 'حملة دعم الأيتام', appReportedHours: 20, hours: 20 },
        ],
    },
]

// ── helper: إجمالي الساعات المعتمدة (hours) - تُستخدم للشهادة ───────────────
export function getTotalHours(volunteer) {
    return (volunteer.campaignHours || []).reduce((sum, c) => sum + (Number(c.hours) || 0), 0)
}

// ── helper: إجمالي الساعات المُدخلة من التطبيق (للمقارنة/المرجعية) ──────────
export function getTotalAppReportedHours(volunteer) {
    return (volunteer.campaignHours || []).reduce((sum, c) => sum + (Number(c.appReportedHours) || 0), 0)
}

// ── helper: تحديث/إضافة ساعات معتمدة لحملة معينة ────────────────────────────
// appReportedHours لا تتغير من هنا إلا إذا تم تمريرها صراحة
export function setCampaignHours(volunteer, campaignId, campaignName, hours, appReportedHours = null) {
    const list = [...(volunteer.campaignHours || [])]
    const idx = list.findIndex((c) => c.campaignId === campaignId)

    if (idx !== -1) {
        list[idx] = {
            ...list[idx],
            hours: Number(hours) || 0,
            ...(appReportedHours !== null ? { appReportedHours: Number(appReportedHours) } : {}),
        }
    } else {
        list.push({
            campaignId,
            campaignName,
            appReportedHours: appReportedHours !== null ? Number(appReportedHours) : 0,
            hours: Number(hours) || 0,
        })
    }

    return { ...volunteer, campaignHours: list }
}