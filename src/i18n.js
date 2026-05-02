import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const ar = {
    translation: {
        // Navigation
        nav: {
            dashboard: 'لوحة التحكم',
            users: 'المستخدمون',
            donations: 'التبرعات',
            beneficiaries: 'المستفيدون',
            campaigns: 'الحملات',
            services: 'الخدمات',
            settings: 'الإعدادات',
            notifications: 'الإشعارات',
        },
        // Dashboard
        dashboard: {
            title: 'لوحة التحكم',
            subtitle: 'نظرة عامة على نشاط الجمعية',
            totalDonations: 'إجمالي التبرعات',
            activeCases: 'الحالات النشطة',
            activeCampaigns: 'الحملات الجارية',
            beneficiaries: 'المستفيدون',
            thisMonth: 'هذا الشهر',
            vsLastMonth: 'مقارنة بالشهر الماضي',
            recentDonations: 'أحدث التبرعات',
            topCampaigns: 'أبرز الحملات',
            donationsTrend: 'مسار التبرعات',
            casesByStatus: 'الحالات حسب الحالة',
        },
        // Common
        common: {
            search: 'بحث...',
            filter: 'تصفية',
            export: 'تصدير',
            add: 'إضافة',
            edit: 'تعديل',
            delete: 'حذف',
            save: 'حفظ',
            cancel: 'إلغاء',
            confirm: 'تأكيد',
            loading: 'جاري التحميل...',
            noData: 'لا توجد بيانات',
            viewAll: 'عرض الكل',
            approve: 'قبول',
            reject: 'رفض',
            archive: 'أرشفة',
            pending: 'قيد الانتظار',
            approved: 'مقبول',
            rejected: 'مرفوض',
            active: 'نشط',
            inactive: 'غير نشط',
            SAR: 'ر.س',
            actions: 'الإجراءات',
            status: 'الحالة',
            date: 'التاريخ',
            name: 'الاسم',
            phone: 'الهاتف',
            email: 'البريد الإلكتروني',
        },
        // Auth
        auth: {
            login: 'تسجيل الدخول',
            logout: 'تسجيل الخروج',
            username: 'اسم المستخدم',
            password: 'كلمة المرور',
            welcome: 'مرحباً بك',
        },
        // Roles
        roles: {
            admin: 'مدير النظام',
            moderator: 'مشرف',
            fieldWorker: 'موظف ميداني',
        },
    },
}

const en = {
    translation: {
        nav: {
            dashboard: 'Dashboard',
            users: 'Users',
            donations: 'Donations',
            beneficiaries: 'Beneficiaries',
            campaigns: 'Campaigns',
            services: 'Services',
            settings: 'Settings',
            notifications: 'Notifications',
        },
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Overview of charity activity',
            totalDonations: 'Total Donations',
            activeCases: 'Active Cases',
            activeCampaigns: 'Active Campaigns',
            beneficiaries: 'Beneficiaries',
            thisMonth: 'This month',
            vsLastMonth: 'vs last month',
            recentDonations: 'Recent Donations',
            topCampaigns: 'Top Campaigns',
            donationsTrend: 'Donations Trend',
            casesByStatus: 'Cases by Status',
        },
        common: {
            search: 'Search...',
            filter: 'Filter',
            export: 'Export',
            add: 'Add',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
            loading: 'Loading...',
            noData: 'No data available',
            viewAll: 'View all',
            approve: 'Approve',
            reject: 'Reject',
            archive: 'Archive',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            active: 'Active',
            inactive: 'Inactive',
            SAR: 'SAR',
            actions: 'Actions',
            status: 'Status',
            date: 'Date',
            name: 'Name',
            phone: 'Phone',
            email: 'Email',
        },
        auth: {
            login: 'Login',
            logout: 'Logout',
            username: 'Username',
            password: 'Password',
            welcome: 'Welcome',
        },
        roles: {
            admin: 'Admin',
            moderator: 'Moderator',
            fieldWorker: 'Field Worker',
        },
    },
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { ar, en },
        fallbackLng: 'en',
        lng: localStorage.getItem('charity-lang') || 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'charity-lang',
        },
    })

const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en'
document.documentElement.lang = lang
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'

export default i18n