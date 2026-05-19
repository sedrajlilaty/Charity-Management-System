import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import arCommon from './locales/ar/common.json'
import arDonations from './locales/ar/donations.json'
import arBeneficiaries from './locales/ar/beneficiaries.json'
// import arCampaigns  from './locales/ar/campaigns.json'
// import arVolunteers from './locales/ar/volunteers.json'
// import arUsers      from './locales/ar/users.json'
// import arSettings   from './locales/ar/settings.json'

import enCommon from './locales/en/common.json'
import enDonations from './locales/en/donations.json'
import enBeneficiaries from './locales/en/beneficiaries.json'
// import enCampaigns  from './locales/en/campaigns.json'
// import enVolunteers from './locales/en/volunteers.json'
// import enUsers      from './locales/en/users.json'
// import enSettings   from './locales/en/settings.json'

// ─── تطبيق الاتجاه على الـ DOM ───────────────────────────────────────────────
// دالة مستقلة تُستدعى عند التهيئة وعند كل تغيير للغة
const applyDirection = (lng) => {
    const lang = lng?.startsWith('ar') ? 'ar' : 'en'
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ar: {
                common: arCommon,
                donations: arDonations,
                beneficiaries: arBeneficiaries,
            },
            en: {
                common: enCommon,
                donations: enDonations,
                beneficiaries: enBeneficiaries,
            },
        },

        defaultNS: 'common',
        fallbackLng: 'en',
        lng: localStorage.getItem('charity-lang') || 'ar',

        interpolation: { escapeValue: false },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'charity-lang',
        },
    })

// تطبيق الاتجاه عند التهيئة الأولى
applyDirection(i18n.language)

// ✅ الإصلاح الجوهري — الاستماع لكل تغيير لغة لاحق وتحديث الـ DOM
i18n.on('languageChanged', applyDirection)

export default i18n