

/** أسماء الأدوار كـ constants لتجنب الأخطاء الإملائية */
export const ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    FIELD_WORKER: 'fieldWorker',
}

/**
 * جدول الصلاحيات الكامل
 * المفتاح  = اسم الصلاحية
 * القيمة  = مصفوفة الأدوار المسموح لها
 */
export const PERMISSIONS = {

    // ── لوحة التحكم ──────────────────────────
    'dashboard.view': [ROLES.ADMIN, ROLES.SUPERVISOR],

    // ── التبرعات ─────────────────────────────
    'donations.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'donations.add': [ROLES.ADMIN],
    'donations.edit': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'donations.delete': [ROLES.ADMIN],
    'donations.approve': [ROLES.ADMIN, ROLES.SUPERVISOR],

    // ── المستفيدون ────────────────────────────
    'beneficiaries.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'beneficiaries.add': [ROLES.ADMIN],
    'beneficiaries.edit': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'beneficiaries.delete': [ROLES.ADMIN],
    'beneficiaries.approve': [ROLES.ADMIN, ROLES.SUPERVISOR],

    // ── الحملات ───────────────────────────────
    'campaigns.view': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
    'campaigns.create': [ROLES.ADMIN],                  // المشرف لا يُنشئ
    'campaigns.edit': [ROLES.ADMIN],
    'campaigns.close': [ROLES.ADMIN],                  // المشرف لا يُغلق
    'campaigns.delete': [ROLES.ADMIN],

    // ── الخدمات ───────────────────────────────
    'services.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'services.add': [ROLES.ADMIN],
    'services.edit': [ROLES.ADMIN],
    'services.delete': [ROLES.ADMIN],

    // ── المتطوعون ─────────────────────────────
    'volunteers.view': [ROLES.ADMIN, ROLES.SUPERVISOR],
    'volunteers.add': [ROLES.ADMIN],
    'volunteers.edit': [ROLES.ADMIN],
    'volunteers.delete': [ROLES.ADMIN],
    'volunteers.approve': [ROLES.ADMIN, ROLES.SUPERVISOR],

    // ── المستخدمون ────────────────────────────
    'users.view': [ROLES.ADMIN],
    'users.add': [ROLES.ADMIN],
    'users.edit': [ROLES.ADMIN],
    'users.delete': [ROLES.ADMIN],

    // ── الإعدادات ─────────────────────────────
    'settings.view': [ROLES.ADMIN],
    'settings.edit': [ROLES.ADMIN],

    // ── الإشعارات والذكاء الاصطناعي ──────────
    'notifications.view': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
    'ai.use': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
}

/**
 * الصفحات المسموح بها لكل دور في السايدبار والـ Routes
 * key = مفتاح nav item / اسم الصفحة
 */
export const ROUTE_PERMISSIONS = {
    dashboard: [ROLES.ADMIN, ROLES.SUPERVISOR],
    donations: [ROLES.ADMIN, ROLES.SUPERVISOR],
    beneficiaries: [ROLES.ADMIN, ROLES.SUPERVISOR],
    campaigns: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
    services: [ROLES.ADMIN],
    users: [ROLES.ADMIN],
    volunteers: [ROLES.ADMIN, ROLES.SUPERVISOR],
    notifications: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
    settings: [ROLES.ADMIN],
    'ai-assistant': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.FIELD_WORKER],
}

/**
 * دالة مساعدة: هل هذا الدور يملك الصلاحية؟
 * @param {string} role  - دور المستخدم
 * @param {string} perm  - اسم الصلاحية
 * @returns {boolean}
 */
export function hasPermission(role, perm) {
    if (!role || !perm) return false
    const allowed = PERMISSIONS[perm]
    if (!allowed) return false
    return allowed.includes(role)
}

/**
 * دالة مساعدة: هل هذا الدور مسموح له بهذه الصفحة؟
 * @param {string} role      - دور المستخدم
 * @param {string} routeKey  - مفتاح الصفحة (مثل 'donations')
 * @returns {boolean}
 */
export function canAccessRoute(role, routeKey) {
    if (!role || !routeKey) return false
    const allowed = ROUTE_PERMISSIONS[routeKey]
    if (!allowed) return false
    return allowed.includes(role)
}