

import {
    mockUsers, mockDonations, mockDonors,
    mockBeneficiaries, mockCampaigns,
    mockNotifications, mockKPIs,
    mockMonthlyDonations, mockCasesByStatus,
} from '../../data/data'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

// ── Generic helpers ────────────────────────────────────────
let _users = [...mockUsers]
let _donations = [...mockDonations]
let _beneficiaries = [...mockBeneficiaries]
let _campaigns = [...mockCampaigns]
let _notifications = [...mockNotifications]

// ── Dashboard ──────────────────────────────────────────────
export const dashboardService = {
    getKPIs: async () => { await delay(300); return mockKPIs },
    getMonthlyDonations: async () => { await delay(300); return mockMonthlyDonations },
    getCasesByStatus: async () => { await delay(300); return mockCasesByStatus },
    getRecentDonations: async () => { await delay(300); return _donations.slice(0, 5) },
    getTopCampaigns: async () => { await delay(300); return _campaigns.slice(0, 4) },
}

// ── Users ──────────────────────────────────────────────────
export const usersService = {
    getList: async ({ page = 1, limit = 10, search = '', role = '' } = {}) => {
        await delay()
        let data = [..._users]
        if (search) data = data.filter(u => u.name.includes(search) || u.email.includes(search))
        if (role) data = data.filter(u => u.role === role)
        return { data: data.slice((page - 1) * limit, page * limit), total: data.length }
    },
    getById: async (id) => { await delay(200); return _users.find(u => u.id === id) },
    create: async (payload) => { await delay(); const u = { ...payload, id: Date.now() }; _users.push(u); return u },
    update: async (id, payload) => { await delay(); _users = _users.map(u => u.id === id ? { ...u, ...payload } : u); return _users.find(u => u.id === id) },
    remove: async (id) => { await delay(); _users = _users.filter(u => u.id !== id) },
    changeStatus: async (id, status) => { await delay(); _users = _users.map(u => u.id === id ? { ...u, status } : u) },
}

// ── Donations ──────────────────────────────────────────────
export const donationsService = {
    getList: async ({ page = 1, limit = 10, status = '', search = '' } = {}) => {
        await delay()
        let data = [..._donations]
        if (status) data = data.filter(d => d.status === status)
        if (search) data = data.filter(d => d.donorName.includes(search))
        return { data: data.slice((page - 1) * limit, page * limit), total: data.length }
    },
    getById: async (id) => { await delay(200); return _donations.find(d => d.id === id) },
    approve: async (id) => { await delay(); _donations = _donations.map(d => d.id === id ? { ...d, status: 'approved' } : d) },
    reject: async (id) => { await delay(); _donations = _donations.map(d => d.id === id ? { ...d, status: 'rejected' } : d) },
    create: async (payload) => { await delay(); const d = { ...payload, id: Date.now(), date: new Date().toISOString().split('T')[0] }; _donations.push(d); return d },
}

// ── Beneficiaries ──────────────────────────────────────────
export const beneficiariesService = {
    getList: async ({ page = 1, limit = 10, status = '', category = '', priority = '', search = '' } = {}) => {
        await delay()
        let data = [..._beneficiaries]
        if (status) data = data.filter(b => b.status === status)
        if (category) data = data.filter(b => b.category === category)
        if (priority) data = data.filter(b => b.priority === priority)
        if (search) data = data.filter(b => b.full_name?.includes(search) || b.name?.includes(search))
        return { data: data.slice((page - 1) * limit, page * limit), total: data.length }
    },
    getById: async (id) => { await delay(200); return _beneficiaries.find(b => b.id === id) },
    create: async (payload) => { await delay(); const b = { ...payload, id: Date.now() }; _beneficiaries.push(b); return b },
    update: async (id, payload) => { await delay(); _beneficiaries = _beneficiaries.map(b => b.id === id ? { ...b, ...payload } : b) },
    changeStatus: async (id, status) => { await delay(); _beneficiaries = _beneficiaries.map(b => b.id === id ? { ...b, status } : b) },
    archive: async (id) => { await delay(); _beneficiaries = _beneficiaries.map(b => b.id === id ? { ...b, status: 'archived' } : b) },
}

// ── Campaigns ──────────────────────────────────────────────
export const campaignsService = {
    getList: async ({ page = 1, limit = 10, status = '' } = {}) => {
        await delay()
        let data = [..._campaigns]
        if (status) data = data.filter(c => c.status === status)
        return { data: data.slice((page - 1) * limit, page * limit), total: data.length }
    },
    getById: async (id) => { await delay(200); return _campaigns.find(c => c.id === id) },
    create: async (payload) => { await delay(); const c = { ...payload, id: Date.now(), collectedAmount: 0 }; _campaigns.push(c); return c },
    update: async (id, payload) => { await delay(); _campaigns = _campaigns.map(c => c.id === id ? { ...c, ...payload } : c) },
    remove: async (id) => { await delay(); _campaigns = _campaigns.filter(c => c.id !== id) },
}

// ── Notifications ──────────────────────────────────────────
export const notificationsService = {
    getList: async () => { await delay(200); return _notifications },
    getUnread: async () => { await delay(200); return _notifications.filter(n => !n.read).length },
    markRead: async (id) => { await delay(100); _notifications = _notifications.map(n => n.id === id ? { ...n, read: true } : n) },
    markAllRead: async () => { await delay(100); _notifications = _notifications.map(n => ({ ...n, read: true })) },
}

// ── App Users ──────────────────────────────────────────────
import { mockAppUsers } from '../../data/data'  // ← عدّلي المسار إذا لازم

let _appUsers = [...mockAppUsers]

export const appUsersService = {
    getList: async ({ search = '', page = 1, limit = 10 } = {}) => {
        await delay()
        let data = [..._appUsers]
        if (search) data = data.filter(u =>
            u.name.includes(search) || u.phone.includes(search)
        )
        return { data: data.slice((page - 1) * limit, page * limit), total: data.length }
    },

    topUpBalance: async (id, amount) => {
        await delay()
        _appUsers = _appUsers.map(u =>
            u.id === id ? { ...u, balance: u.balance + Number(amount) } : u
        )
        return { balance: _appUsers.find(u => u.id === id)?.balance }
    },
}


import { volunteers as volunteersMock } from '../../data/data'

let volunteersData = [...volunteersMock]

export const volunteersService = {
    getList: async ({ search = '', status = '', skill = '', campaign = '', page = 1, limit = 10 } = {}) => {
        await delay()
        let list = [...volunteersData]

        if (search) list = list.filter(v => v.name.includes(search))
        if (status) list = list.filter(v => v.status === status)
        if (skill) list = list.filter(v => v.skill === skill)
        if (campaign) list = list.filter(v => v.campaignName.includes(campaign))

        const stats = {
            total: volunteersData.length,
            pending: volunteersData.filter(v => v.status === 'pending').length,
            approved: volunteersData.filter(v => v.status === 'approved').length,
            completed: volunteersData.filter(v => v.status === 'completed').length,
        }

        const total = list.length
        const start = (page - 1) * limit
        const data = list.slice(start, start + limit)

        return { data, total, stats }
    },

    // ✅ changeStatus: تقبل الحالة الجديدة مباشرة 'approved' | 'rejected' | 'pending' | 'completed'
    // متوافقة مع أزرار "قبول"/"رفض" الجديدة بعمود "القرار"
    // كما تدعم بالاستمرار القيم القديمة 'approve' | 'reject' | 'complete' لو وُجدت استدعاءات سابقة
    changeStatus: async (id, action) => {
        await delay()

        const legacyMap = { approve: 'approved', reject: 'rejected', complete: 'completed' }
        const newStatus = legacyMap[action] ?? action // إذا القيمة جاهزة (approved/rejected) تُستخدم كما هي

        const validStatuses = ['pending', 'approved', 'rejected', 'completed']
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${action}`)
        }

        volunteersData = volunteersData.map(v =>
            v.id === id ? { ...v, status: newStatus } : v
        )
        return volunteersData.find(v => v.id === id)
    },

    // ✅ جلب المتطوعين المشاركين بحملة معينة (لمودال "متطوعو الحملة")
    getByCampaign: async (campaignId) => {
        await delay()
        const data = volunteersData.filter((v) =>
            (v.campaignHours || []).some((c) => c.campaignId === campaignId)
        )
        return { data, total: data.length }
    },

    // ✅ تحديث/إضافة "الساعات المعتمدة" (hours) لمتطوع بحملة معينة
    // appReportedHours (من التطبيق) لا تُعدَّل من هنا - تبقى كما أدخلها المتطوع
    setCampaignHours: async (volunteerId, campaignId, campaignName, confirmedHours) => {
        await delay()

        volunteersData = volunteersData.map((v) => {
            if (v.id !== volunteerId) return v

            const list = [...(v.campaignHours || [])]
            const idx = list.findIndex((c) => c.campaignId === campaignId)

            if (idx !== -1) {
                list[idx] = { ...list[idx], hours: Number(confirmedHours) || 0 }
            } else {
                list.push({
                    campaignId,
                    campaignName,
                    appReportedHours: 0,
                    hours: Number(confirmedHours) || 0,
                })
            }

            return { ...v, campaignHours: list }
        })

        return volunteersData.find((v) => v.id === volunteerId)
    },

    remove: async (id) => {
        await delay()
        volunteersData = volunteersData.filter(v => v.id !== id)
        return { success: true }
    },
}

// ── دالة تأخير محاكاة الشبكة ─────────────────────────────────────────────────



import { MOCK_VOLUNTEERS, setCampaignHours, getTotalHours } from '../features/certificates/mockVolunteers'

export const volunteersServiceAdditions = {
    // جلب المتطوعين المشاركين بحملة معينة (أي عندهم entry بـ campaignHours لهذه الحملة)
    getByCampaign: async (campaignId) => {
        await new Promise((r) => setTimeout(r, 200))

        const data = MOCK_VOLUNTEERS.filter((v) =>
            (v.campaignHours || []).some((c) => c.campaignId === campaignId)
        )

        return { data, total: data.length }
    },

    // تحديث/إضافة ساعات متطوع لحملة معينة
    setCampaignHours: async (volunteerId, campaignId, campaignName, hours) => {
        await new Promise((r) => setTimeout(r, 200))

        const idx = MOCK_VOLUNTEERS.findIndex((v) => v.id === volunteerId)
        if (idx === -1) throw new Error('Volunteer not found')

        MOCK_VOLUNTEERS[idx] = setCampaignHours(MOCK_VOLUNTEERS[idx], campaignId, campaignName, hours)

        return MOCK_VOLUNTEERS[idx]
    },

    // إجمالي ساعات متطوع معين (يُستخدم في certificatesService)
    getTotalHours,
}

/* ─────────────────────────────────────────────────────────────────────────
   ✅ ملاحظة للربط مع certificatesService:
 
   عدّلي certificatesService.getList بحيث يحسب totalHours من
   getTotalHours(volunteer) بدل القيمة الثابتة، مثال:
 
   const volunteer = MOCK_VOLUNTEERS.find(v => v.id === c.volunteerId)
   const totalHours = getTotalHours(volunteer)
───────────────────────────────────────────────────────────────────────── */