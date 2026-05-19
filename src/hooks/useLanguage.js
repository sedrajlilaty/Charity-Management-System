import { useTranslation } from 'react-i18next'

/**
 * useLanguage — hook موحّد لتغيير اللغة في كل التطبيق
 *
 * الاستخدام:
 *   const { language, isRTL, toggleLanguage } = useLanguage()
 */
export function useLanguage() {
    const { i18n } = useTranslation()

    const language = i18n.language?.startsWith('ar') ? 'ar' : 'en'
    const isRTL = language === 'ar'

    const toggleLanguage = () => {
        const next = language === 'ar' ? 'en' : 'ar'

        // 1. إخبار i18next بالتغيير — هذا يُعيد رسم كل مكوّن يستخدم useTranslation تلقائياً
        i18n.changeLanguage(next)

        // 2. حفظ الاختيار في localStorage
        localStorage.setItem('charity-lang', next)

        // 3. تحديث اتجاه الصفحة فوراً
        document.documentElement.lang = next
        document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
        document.body.dir = next === 'ar' ? 'rtl' : 'ltr'
    }

    return { language, isRTL, toggleLanguage }
}