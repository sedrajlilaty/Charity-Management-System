import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ═══════════════════════════════════════════════════════════════════════════════
// ARABIC
// ═══════════════════════════════════════════════════════════════════════════════
const ar = {
    translation: {

        // ── Navigation ────────────────────────────────────────────────────────
        nav: {
            dashboard: 'لوحة التحكم',
            users: 'المستخدمون',
            donations: 'التبرعات',
            beneficiaries: 'المستفيدون',
            campaigns: 'الحملات',
            services: 'الخدمات',
            settings: 'الإعدادات',
            notifications: 'الإشعارات',
            volunteers: 'المتطوعون',
            ai: 'المساعد الذكي',
        },

        // ── Common ────────────────────────────────────────────────────────────
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
            completed: 'مكتمل',
            active: 'نشط',
            inactive: 'غير نشط',
            SAR: 'ر.س',
            actions: 'الإجراءات',
            status: 'الحالة',
            date: 'التاريخ',
            name: 'الاسم',
            phone: 'الهاتف',
            email: 'البريد الإلكتروني',
            yes: 'نعم',
            no: 'لا',
            all: 'الكل',
            exportPDF: 'تصدير PDF',
        },

        // ── Auth ──────────────────────────────────────────────────────────────
        auth: {
            login: 'تسجيل الدخول',
            logout: 'تسجيل الخروج',
            username: 'اسم المستخدم',
            password: 'كلمة المرور',
            welcome: 'مرحباً بك',
        },

        // ── Roles ─────────────────────────────────────────────────────────────
        roles: {
            admin: 'مدير النظام',
            moderator: 'مشرف',
            fieldWorker: 'موظف ميداني',
        },

        // ── Dashboard ─────────────────────────────────────────────────────────
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
            raised: 'تم جمعه',
            goal: 'الهدف',
            viewAll: 'عرض الكل',
            year: '2024',
            beneficiariesCount: 'مستفيد',
        },

        // ── Donations ─────────────────────────────────────────────────────────
        donations: {
            title: 'التبرعات',
            subtitle: '{{count}} تبرع',
            addBtn: 'تبرع جديد',
            tabs: {
                all: 'الكل',
                pending: 'قيد الانتظار',
                approved: 'مقبولة',
                rejected: 'مرفوضة',
            },
            table: {
                id: '#',
                donor: 'المتبرع',
                amount: 'المبلغ',
                type: 'النوع',
                campaign: 'الحملة',
                recurring: 'متكرر',
                date: 'التاريخ',
                status: 'الحالة',
                actions: 'الإجراءات',
                yes: 'نعم',
                no: 'لا',
            },
            types: {
                cash: 'نقدي',
                inkind: 'عيني',
                transfer: 'تحويل',
            },
            actions: {
                approve: 'قبول',
                reject: 'رفض',
            },
            empty: {
                title: 'لا توجد تبرعات',
                description: 'لا توجد سجلات مطابقة لهذا الفلتر.',
            },
            modal: {
                titleAdd: 'إضافة تبرع جديد',
                titleEdit: 'تعديل التبرع',
                donorName: 'اسم المتبرع',
                donorPlaceholder: 'أدخل اسم المتبرع',
                amount: 'المبلغ',
                type: 'نوع التبرع',
                campaign: 'الحملة',
                campaignPlaceholder: 'اسم الحملة (اختياري)',
                recurring: 'متكرر',
                recurringLabel: 'نعم، تبرع متكرر شهري',
                save: 'حفظ التبرع',
                cancel: 'إلغاء',
                types: { cash: 'نقدي', transfer: 'تحويل بنكي', inkind: 'عيني' },
                errors: {
                    donorRequired: 'اسم المتبرع مطلوب',
                    amountInvalid: 'المبلغ يجب أن يكون أكبر من صفر',
                },
            },
        },

        // ── Beneficiaries ─────────────────────────────────────────────────────
        beneficiaries: {
            title: 'المستفيدون',
            subtitle: '{{count}} حالة',
            addBtn: 'إضافة حالة',
            tabs: {
                all: 'الكل',
                active: 'نشطة',
                pending: 'قيد الانتظار',
                rejected: 'مرفوضة',
                archived: 'مؤرشفة',
            },
            filters: {
                searchPlaceholder: 'ابحث بالاسم أو الهاتف...',
                allCategories: 'كل الفئات',
                allCampaigns: 'كل الحملات',
            },
            categories: {
                orphan: 'كفالة يتيم',
                educational: 'دعم تعليمي',
                medical: 'دعم طبي',
                widow: 'دعم أرملة',
                poor: 'أسرة محدودة الدخل',
            },
            campaigns: {
                camp_1: 'كسوة الشتاء',
                camp_2: 'كفالة أيتام',
                camp_3: 'سلة غذائية',
                camp_4: 'دعم الأرامل',
                camp_5: 'العودة للمدرسة',
                camp_6: 'الإغاثة الطبية',
            },
            priority: { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' },
            table: {
                beneficiary: 'المستفيد',
                location: 'الموقع الجغرافي',
                governorate: 'المحافظة',
                region: 'المنطقة',
                category: 'الفئة',
                priority: 'الأولوية',
                support: 'الدعم',
                status: 'الحالة',
                actions: 'الإجراءات',
                noAddress: 'غير محدد',
            },
            empty: { title: 'لا توجد بيانات', description: 'لا توجد حالات مطابقة للفلتر المحدد.' },
            deleteConfirm: 'هل أنت متأكد من حذف هذا المستفيد؟',
            modal: {
                titleAdd: 'طلب دعم جديد',
                titleEdit: 'تعديل بيانات الحالة',
                fields: {
                    category: 'الفئة',
                    priority: 'الأولوية',
                    fullName: 'الاسم الكامل',
                    fullNamePlaceholder: 'أدخل الاسم الكامل',
                    phone: 'رقم التواصل',
                    phonePlaceholder: '+966 XXXXXXXX',
                    governorate: 'المحافظة',
                    region: 'المنطقة / الحي',
                    governoratePlaceholder: 'اختر المحافظة',
                    regionPlaceholder: 'مثال: الميدان، الحمدانية...',
                    address: 'العنوان التفصيلي',
                    membersCount: 'عدد أفراد الأسرة',
                    monthlySupport: 'الدعم الشهري (ر.س)',
                    needDescription: 'وصف الاحتياج',
                    needPlaceholder: 'اشرح باختصار سبب طلب الدعم...',
                },
                categories: { orphan: 'كفالة يتيم', educational: 'دعم تعليمي', medical: 'دعم طبي' },
                priority: { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' },
                educational: {
                    sectionTitle: 'التفاصيل الأكاديمية',
                    academicYear: 'السنة / الصف الدراسي',
                    academicPlaceholder: 'مثال: الصف الثاني الثانوي',
                    supportType: 'نوع الدعم التعليمي',
                    supportOptions: { laptop: 'دعم بجهاز حاسوب', tuition: 'مساعدة في الرسوم', stationary: 'قرطاسية ومستلزمات' },
                },
                medical: {
                    sectionTitle: 'الوضع الطبي',
                    condition: 'وصف الحالة المرضية',
                    conditionPlaceholder: 'اشرح الوضع الصحي باختصار...',
                    requiredAmount: 'المبلغ المطلوب (ر.س)',
                },
                buttons: { cancel: 'إلغاء', submit: 'إرسال الطلب', update: 'حفظ التعديلات' },
                errors: {
                    nameRequired: 'الاسم الكامل مطلوب',
                    phoneRequired: 'رقم التواصل مطلوب',
                    addressRequired: 'العنوان السكني مطلوب',
                },
                governorates: {
                    damascus: 'دمشق',
                    rif_dimashq: 'ريف دمشق',
                    aleppo: 'حلب',
                    homs: 'حمص',
                    hama: 'حماة',
                    latakia: 'اللاذقية',
                    tartus: 'طرطوس',
                    idlib: 'إدلب',
                    deir_ez_zor: 'دير الزور',
                    raqqa: 'الرقة',
                    hasakah: 'الحسكة',
                    daraa: 'درعا',
                    sweida: 'السويداء',
                    quneitra: 'القنيطرة',
                },
            },
        },

        // ── Campaigns ─────────────────────────────────────────────────────────
        campaigns: {
            title: 'الحملات',
            subtitle: '{{count}} حملة',
            addBtn: 'حملة جديدة',
            raised: 'تم جمعه',
            goal: 'الهدف',
            beneficiariesCount: 'مستفيد',
            empty: 'لا توجد حملات حتى الآن',
            deleteConfirm: 'هل أنت متأكد من حذف هذه الحملة؟',
            actions: { edit: 'تعديل', delete: 'حذف' },
            modal: {
                titleAdd: 'حملة جديدة',
                titleEdit: 'تعديل الحملة',
                name: 'اسم الحملة',
                namePlaceholder: 'مثال: كسوة الشتاء 2026',
                description: 'الوصف',
                descPlaceholder: 'وصف مختصر للحملة...',
                targetAmount: 'المبلغ المستهدف (ر.س)',
                targetPlaceholder: '50000',
                status: 'الحالة',
                startDate: 'تاريخ البداية',
                endDate: 'تاريخ الانتهاء',
                statuses: { active: 'نشطة', draft: 'مسودة', completed: 'مكتملة' },
                buttons: { cancel: 'إلغاء', create: 'إنشاء الحملة', update: 'حفظ التعديلات' },
                errors: { nameRequired: 'اسم الحملة مطلوب', amountRequired: 'المبلغ المستهدف مطلوب' },
            },
        },

        // ── Notifications ─────────────────────────────────────────────────────
        notifications: {
            title: 'الإشعارات',
            unread: '{{count}} إشعار غير مقروء',
            allRead: 'جميع الإشعارات مقروءة',
            markAllRead: 'تعيين الكل كمقروء',
            markRead: 'تعيين كمقروء',
            unreadLabel: 'غير مقروء ({{count}})',
            readLabel: 'مقروء ({{count}})',
            empty: 'لا توجد إشعارات',
            types: { donation: 'تبرع', case: 'حالة', campaign: 'حملة', system: 'نظام' },
        },

        // ── Services ──────────────────────────────────────────────────────────
        services: {
            title: 'الخدمات والبرامج',
            subtitle: '{{count}} خدمة',
            addBtn: 'خدمة جديدة',
            empty: 'لا توجد خدمات في هذا التصنيف.',
            addFirst: 'أضف خدمة',
            amount: 'قيمة الخدمة',
            beneficiaries: 'المستفيدون',
            free: 'مجانية',
            categories: { all: 'الكل', education: 'التعليم', orphan: 'الأيتام', medical: 'الطبي', food: 'الغذاء', housing: 'السكن' },
            modal: {
                titleAdd: 'إضافة خدمة جديدة',
                titleEdit: 'تعديل خدمة',
                name: 'اسم الخدمة',
                namePlaceholder: 'مثال: كفالة اليتيم',
                category: 'التصنيف',
                amount: 'قيمة الخدمة (ر.س)',
                description: 'الوصف',
                descPlaceholder: 'وصف مختصر للخدمة...',
                status: 'الحالة',
                active: 'نشطة',
                inactive: 'موقوفة',
                buttons: { cancel: 'إلغاء', save: 'حفظ التغييرات', add: 'إضافة الخدمة' },
                errors: { nameRequired: 'اسم الخدمة مطلوب' },
            },
            stats: {
                "total": "الخدمات",
                "beneficiaries": "المستفيدون"
            }
        },

        // ── Settings ──────────────────────────────────────────────────────────
        settings: {
            title: 'الإعدادات',
            subtitle: 'تفضيلات النظام وإعداداته',
            save: 'حفظ الإعدادات',
            saved: 'تم الحفظ بنجاح',
            financial: {
                title: 'الإعدادات المالية',
                orphanAmount: 'مبلغ كفالة اليتيم الشهرية',
                orphanDesc: 'يُستخدم كمبلغ افتراضي لإدخالات الكفالة الجديدة.',
                currency: 'عملة النظام',
                currencyDesc: 'العملة المستخدمة في جميع العمليات المالية.',
            },
            beneficiary: {
                title: 'قواعد المستفيدين',
                maxMembers: 'الحد الأقصى لأفراد الأسرة',
                maxMembersDesc: 'الحد الأعلى المسموح به عند تسجيل حالة جديدة.',
                reviewCycle: 'دورة مراجعة الحالة (أشهر)',
                reviewDesc: 'عدد الأشهر قبل تحديث مراجعة حالة المستفيد.',
            },
            appearance: {
                title: 'المظهر واللغة',
                darkMode: 'الوضع الداكن',
                darkDesc: 'التبديل بين المظهر الفاتح والداكن.',
                language: 'لغة النظام',
                langDesc: 'اللغة الحالية: {{lang}}',
                switchLang: 'التبديل إلى الإنجليزية',
            },
            notifications: {
                title: 'الإشعارات',
                donation: 'تنبيهات التبرعات',
                donationDesc: 'إشعار عند تقديم تبرع جديد.',
                case: 'تنبيهات الحالات',
                caseDesc: 'إشعار عند تقديم حالة مستفيد جديدة.',
                campaign: 'تنبيهات الحملات',
                campaignDesc: 'إشعار عند اكتمال حملة أو بلوغ هدفها.',
            },
            security: {
                title: 'الأمان والجلسة',
                autoSignOut: 'تسجيل الخروج التلقائي',
                autoSignOutDesc: 'تسجيل الخروج تلقائياً بعد فترة خمول.',
                timeout: 'مهلة الجلسة (دقائق)',
                timeoutDesc: 'مدة بقاء المستخدم مسجلاً دون نشاط.',
            },
        },

        // ── Users ─────────────────────────────────────────────────────────────
        users: {
            title: 'المستخدمون',
            subtitle: '{{count}} مستخدم',
            addBtn: 'إضافة مستخدم',
            searchPlaceholder: 'البحث بالاسم أو البريد الإلكتروني...',
            tabs: { all: 'الكل', admin: 'مدير', fieldWorker: 'موظف ميداني' },
            table: { user: 'المستخدم', role: 'الدور', phone: 'الهاتف', status: 'الحالة', joinedAt: 'تاريخ الانضمام', actions: 'الإجراءات' },
            empty: { title: 'لا يوجد مستخدمون', description: 'ابدأ بإضافة مستخدم جديد.' },
            actions: { edit: 'تعديل', delete: 'حذف' },
            modal: {
                titleAdd: 'مستخدم جديد',
                titleEdit: 'تعديل المستخدم',
                fullName: 'الاسم الكامل',
                namePlaceholder: 'أحمد محمد',
                email: 'البريد الإلكتروني',
                emailPlaceholder: 'user@charity.org',
                phone: 'رقم الهاتف',
                phonePlaceholder: '05XXXXXXXX',
                role: 'الدور',
                status: 'الحالة',
                photo: 'الصورة الشخصية',
                uploadPhoto: 'رفع صورة',
                changePhoto: 'تغيير الصورة',
                removePhoto: 'إزالة الصورة',
                roles: { admin: 'مدير النظام', fieldWorker: 'موظف ميداني' },
                statuses: { active: 'نشط', inactive: 'غير نشط' },
                buttons: { cancel: 'إلغاء', create: 'إنشاء المستخدم', update: 'حفظ التعديلات' },
                errors: { nameRequired: 'الاسم مطلوب', emailRequired: 'البريد الإلكتروني مطلوب', phoneRequired: 'رقم الهاتف مطلوب' },
            },
            deleteModal: {
                title: 'تأكيد الحذف',
                message: 'هل أنت متأكد من حذف المستخدم',
                warning: 'لا يمكن التراجع عن هذا الإجراء.',
                cancel: 'إلغاء',
                confirm: 'نعم، احذف',
            },
        },

        // ── Volunteers ────────────────────────────────────────────────────────
        volunteers: {
            title: 'طلبات التطوع',
            subtitle: '{{count}} طلب',
            addBtn: 'إضافة متطوع',
            searchPlaceholder: 'البحث بالاسم...',
            tabs: { all: 'الكل', pending: 'قيد الانتظار', approved: 'مقبولة', completed: 'مكتملة', rejected: 'مرفوضة' },
            table: { name: 'المتطوع', campaign: 'الحملة', status: 'الحالة', actions: 'الإجراءات' },
            kanban: {
                title: 'عرض لوحة كانبان',
                listView: 'عرض القائمة',
                boardView: 'عرض اللوحة',
                columns: {
                    pending: 'قيد الانتظار',
                    approved: 'مقبول',
                    completed: 'مكتمل',
                    rejected: 'مرفوض',
                },
            },
            empty: 'لا توجد بيانات',
            modal: {
                titleAdd: 'طلب تطوع جديد',
                titleEdit: 'تعديل طلب التطوع',
                name: 'اسم المتطوع',
                namePlaceholder: 'الاسم الكامل',
                phone: 'رقم الهاتف',
                phonePlaceholder: '05XXXXXXXX',
                email: 'البريد الإلكتروني',
                campaign: 'الحملة',
                campaignPlaceholder: 'اختر الحملة',
                skill: 'المهارة',
                skillPlaceholder: 'اختر المهارة',
                availability: 'وقت الإتاحة',
                availabilityPlaceholder: 'اختر الوقت',
                experience: 'الخبرة',
                experiencePlaceholder: 'اختر الخبرة',
                notes: 'ملاحظات',
                notesPlaceholder: 'أي معلومات إضافية...',
                skills: { medical: 'طبي / صحي', teaching: 'تعليمي', logistics: 'لوجستي', social: 'اجتماعي', technical: 'تقني', other: 'أخرى' },
                availability_options: { morning: 'صباحي', evening: 'مسائي', weekend: 'نهاية الأسبوع', flexible: 'مرن' },
                experience_options: { none: 'لا يوجد', '1_2': '1 - 2 سنة', '3_5': '3 - 5 سنوات', '5_plus': 'أكثر من 5 سنوات' },
                buttons: { cancel: 'إلغاء', create: 'إنشاء الطلب', update: 'حفظ التعديلات' },
                errors: {
                    nameRequired: 'الاسم مطلوب',
                    phoneRequired: 'الهاتف مطلوب',
                    campaignRequired: 'يرجى اختيار الحملة',
                    skillRequired: 'يرجى اختيار المهارة',
                    availabilityRequired: 'يرجى اختيار وقت الإتاحة',
                },
            },
        },

        // ── PDF Export ────────────────────────────────────────────────────────
        pdf: {
            exportBtn: 'تصدير PDF',
            generating: 'جاري التصدير...',
            title: 'تقرير {{section}}',
            generatedAt: 'تاريخ التصدير: {{date}}',
            totalRecords: 'إجمالي السجلات: {{count}}',
            charityName: 'نظام إدارة الجمعية الخيرية',
        },

        // ── Map ───────────────────────────────────────────────────────────────
        map: {
            title: 'خريطة المستفيدين',
            subtitle: 'توزيع الحالات الجغرافي',
            total: 'إجمالي الحالات',
            byCategory: 'حسب الفئة',
            byPriority: 'حسب الأولوية',
            noLocation: 'لا توجد بيانات موقع',
        },
    },
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH
// ═══════════════════════════════════════════════════════════════════════════════
const en = {
    translation: {

        // ── Navigation ────────────────────────────────────────────────────────
        nav: {
            dashboard: 'Dashboard',
            users: 'Users',
            donations: 'Donations',
            beneficiaries: 'Beneficiaries',
            campaigns: 'Campaigns',
            services: 'Services',
            settings: 'Settings',
            notifications: 'Notifications',
            volunteers: 'Volunteers',
            ai: 'AI Assistant'
        },

        // ── Common ────────────────────────────────────────────────────────────
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
            completed: 'Completed',
            active: 'Active',
            inactive: 'Inactive',
            SAR: 'SAR',
            actions: 'Actions',
            status: 'Status',
            date: 'Date',
            name: 'Name',
            phone: 'Phone',
            email: 'Email',
            yes: 'Yes',
            no: 'No',
            all: 'All',
            exportPDF: 'Export PDF',
        },

        // ── Auth ──────────────────────────────────────────────────────────────
        auth: {
            login: 'Login',
            logout: 'Logout',
            username: 'Username',
            password: 'Password',
            welcome: 'Welcome',
        },

        // ── Roles ─────────────────────────────────────────────────────────────
        roles: {
            admin: 'Admin',
            moderator: 'Moderator',
            fieldWorker: 'Field Worker',
        },

        // ── Dashboard ─────────────────────────────────────────────────────────
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
            raised: 'Raised',
            goal: 'Goal',
            viewAll: 'View all',
            year: '2024',
            beneficiariesCount: 'beneficiaries',
        },

        // ── Donations ─────────────────────────────────────────────────────────
        donations: {
            title: 'Donations',
            subtitle: '{{count}} donations',
            addBtn: 'New donation',
            tabs: { all: 'All', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
            table: {
                id: '#', donor: 'Donor', amount: 'Amount', type: 'Type', campaign: 'Campaign',
                recurring: 'Recurring', date: 'Date', status: 'Status', actions: 'Actions', yes: 'Yes', no: 'No',
            },
            types: { cash: 'Cash', inkind: 'In-kind', transfer: 'Transfer' },
            actions: { approve: 'Approve', reject: 'Reject' },
            empty: { title: 'No donations found', description: 'No records match this filter.' },
            modal: {
                titleAdd: 'New Donation',
                titleEdit: 'Edit Donation',
                donorName: 'Donor Name',
                donorPlaceholder: 'Enter donor name',
                amount: 'Amount',
                type: 'Donation Type',
                campaign: 'Campaign',
                campaignPlaceholder: 'Campaign name (optional)',
                recurring: 'Recurring',
                recurringLabel: 'Yes, monthly recurring donation',
                save: 'Save Donation',
                cancel: 'Cancel',
                types: { cash: 'Cash', transfer: 'Bank Transfer', inkind: 'In-kind' },
                errors: { donorRequired: 'Donor name is required', amountInvalid: 'Amount must be greater than zero' },
            },
        },

        // ── Beneficiaries ─────────────────────────────────────────────────────

        beneficiaries: {
            title: 'Beneficiaries',
            subtitle: '{{count}} cases',
            addBtn: 'Add Case',
            tabs: {
                all: 'All',
                active: 'Active',
                pending: 'Pending',
                rejected: 'Rejected',
                archived: 'Archived'
            },
            filters: {
                searchPlaceholder: 'Search by name or phone...',
                allCategories: 'All Categories',
                allCampaigns: 'All Campaigns'
            },
            categories: {
                orphan: 'Orphan Care',
                educational: 'Educational Assistance',
                medical: 'Medical Assistance',
                widow: 'Widow Support',
                poor: 'Low-income Family'
            },
            campaigns: {
                camp_1: 'Winter Clothing',
                camp_2: 'Orphan Sponsorship',
                camp_3: 'Food Basket',
                camp_4: 'Widows Support',
                camp_5: 'Back to School',
                camp_6: 'Medical Aid'
            },
            priority: {
                high: 'High',
                medium: 'Medium',
                low: 'Low'
            },
            table: {
                beneficiary: 'Beneficiary',
                location: 'Geographic Location',
                category: 'Category',
                priority: 'Priority',
                support: 'Support',
                status: 'Status',
                actions: 'Actions',
                noAddress: 'Not specified'
            },
            empty: {
                title: 'No Data',
                description: 'No matching cases found for the selected filters.'
            },
            deleteConfirm: 'Are you sure you want to delete this beneficiary?',
            modal: {
                titleAdd: 'New Support Request',
                titleEdit: 'Edit Case Info',
                fields: {
                    category: 'Category',
                    priority: 'Priority',
                    fullName: 'Full Name (Legal)',
                    fullNamePlaceholder: 'Enter full name',
                    phone: 'Contact Number',
                    phonePlaceholder: '09XXXXXXXX',
                    governorate: 'Governorate',
                    governoratePlaceholder: 'Select Governorate',
                    region: 'Region / District',
                    regionPlaceholder: 'e.g., Al-Midan, Al-Hamadaniyah...',
                    address: 'Detailed Address',
                    addressPlaceholder: 'Street, Building, Floor...',
                    membersCount: 'Family Members',
                    monthlySupport: 'Monthly Support',
                    needDescription: 'Description of Need',
                    needPlaceholder: 'Briefly describe why this support is requested...'
                },
                governorates: {
                    damascus: 'Damascus',
                    rif_dimashq: 'Rif Dimashq',
                    aleppo: 'Aleppo',
                    homs: 'Homs',
                    hama: 'Hama',
                    latakia: 'Latakia',
                    tartus: 'Tartus',
                    idlib: 'Idlib',
                    deir_ez_zor: 'Deir ez-Zor',
                    raqqa: 'Raqqa',
                    hasakah: 'Al-Hasakah',
                    daraa: 'Daraa',
                    sweida: 'As-Suwayda',
                    quneitra: 'Quneitra'
                },
                educational: {
                    sectionTitle: 'Academic Details',
                    academicYear: 'Academic Year / Grade',
                    academicPlaceholder: 'e.g., 2nd Year University',
                    supportType: 'Support Type',
                    supportOptions: {
                        laptop: 'Laptop Support',
                        tuition: 'Tuition Assistance',
                        stationary: 'Stationery / Supplies'
                    }
                },
                medical: {
                    sectionTitle: 'Medical Situation',
                    condition: 'Condition Description',
                    conditionPlaceholder: 'Briefly describe the medical situation...',
                    requiredAmount: 'Required Amount'
                },
                buttons: {
                    cancel: 'Cancel',
                    submit: 'Submit Request',
                    update: 'Update Case'
                },
                errors: {
                    nameRequired: 'Full name is required',
                    phoneRequired: 'Contact number is required',
                    addressRequired: 'Address is required',
                    required: 'This field is required'
                }
            }
        }
        ,
        // ── Campaigns ─────────────────────────────────────────────────────────
        campaigns: {
            title: 'Campaigns', subtitle: '{{count}} campaigns', addBtn: 'New campaign',
            raised: 'Raised', goal: 'Goal', beneficiariesCount: 'beneficiaries',
            empty: 'No campaigns yet', deleteConfirm: 'Are you sure you want to delete this campaign?',
            actions: { edit: 'Edit', delete: 'Delete' },
            modal: {
                titleAdd: 'New Campaign', titleEdit: 'Edit Campaign',
                name: 'Campaign name', namePlaceholder: 'Example: Winter Clothing 2026',
                description: 'Description', descPlaceholder: 'Short campaign description...',
                targetAmount: 'Target amount (SAR)', targetPlaceholder: '50000',
                status: 'Status', startDate: 'Start date', endDate: 'End date',
                statuses: { active: 'Active', draft: 'Draft', completed: 'Completed' },
                buttons: { cancel: 'Cancel', create: 'Create campaign', update: 'Save changes' },
                errors: { nameRequired: 'Campaign name is required', amountRequired: 'Target amount is required' },
            },
        },

        // ── Notifications ─────────────────────────────────────────────────────
        notifications: {
            title: 'Notifications', unread: '{{count}} unread notifications', allRead: 'All notifications are read',
            markAllRead: 'Mark all as read', markRead: 'Mark as read',
            unreadLabel: 'Unread ({{count}})', readLabel: 'Read ({{count}})', empty: 'No notifications',
            types: { donation: 'Donation', case: 'Case', campaign: 'Campaign', system: 'System' },
        },

        // ── Services ──────────────────────────────────────────────────────────
        services: {
            title: 'Services & Programs', subtitle: '{{count}} services', addBtn: 'New service',
            empty: 'No services in this category.', addFirst: 'Add service',
            amount: 'Service amount', beneficiaries: 'Beneficiaries', free: 'Free',
            categories: { all: 'All', education: 'Education', orphan: 'Orphans', medical: 'Medical', food: 'Food', housing: 'Housing' },
            modal: {
                titleAdd: 'New Service', titleEdit: 'Edit Service',
                name: 'Service name', namePlaceholder: 'e.g. Orphan Sponsorship',
                category: 'Category', amount: 'Service amount (SAR)',
                description: 'Description', descPlaceholder: 'Short service description...',
                status: 'Status', active: 'Active', inactive: 'Inactive',
                buttons: { cancel: 'Cancel', save: 'Save changes', add: 'Add service' },
                errors: { nameRequired: 'Service name is required' },
            },
        },

        // ── Settings ──────────────────────────────────────────────────────────
        settings: {
            title: 'Settings', subtitle: 'System preferences and app behavior',
            save: 'Save settings', saved: 'Saved successfully',
            financial: {
                title: 'Financial Settings',
                orphanAmount: 'Monthly orphan sponsorship amount', orphanDesc: 'Used as the default amount for new sponsorship entries.',
                currency: 'System currency', currencyDesc: 'Currency used across all financial operations.',
            },
            beneficiary: {
                title: 'Beneficiary Rules',
                maxMembers: 'Maximum family members', maxMembersDesc: 'Upper limit allowed while registering a new case.',
                reviewCycle: 'Case review cycle (months)', reviewDesc: 'Months before beneficiary case review refresh.',
            },
            appearance: {
                title: 'Appearance & Language', darkMode: 'Dark mode', darkDesc: 'Switch between light and dark themes.',
                language: 'System language', langDesc: 'Current language: {{lang}}', switchLang: 'Switch to Arabic',
            },
            notifications: {
                title: 'Notifications',
                donation: 'Donation alerts', donationDesc: 'Notify when a new donation is submitted.',
                case: 'Case alerts', caseDesc: 'Notify when a new beneficiary case is submitted.',
                campaign: 'Campaign alerts', campaignDesc: 'Notify when campaign reaches goal or completes.',
            },
            security: {
                title: 'Security & Session',
                autoSignOut: 'Auto sign-out', autoSignOutDesc: 'Automatically sign out after inactivity.',
                timeout: 'Session timeout (minutes)', timeoutDesc: 'How long user stays signed in without activity.',
            },
        },

        // ── Users ─────────────────────────────────────────────────────────────
        users: {
            title: 'Users', subtitle: '{{count}} users', addBtn: 'Add user',
            searchPlaceholder: 'Search by name or email...',
            tabs: { all: 'All', admin: 'Admin', fieldWorker: 'Field Worker' },
            table: { user: 'User', role: 'Role', phone: 'Phone', status: 'Status', joinedAt: 'Joined At', actions: 'Actions' },
            empty: { title: 'No users found', description: 'Start by adding a new user.' },
            actions: { edit: 'Edit', delete: 'Delete' },
            modal: {
                titleAdd: 'New User', titleEdit: 'Edit User',
                fullName: 'Full name', namePlaceholder: 'John Smith',
                email: 'Email address', emailPlaceholder: 'user@charity.org',
                phone: 'Phone number', phonePlaceholder: '05XXXXXXXX',
                role: 'Role', status: 'Status', photo: 'Profile photo',
                uploadPhoto: 'Upload photo', changePhoto: 'Change photo', removePhoto: 'Remove photo',
                roles: { admin: 'Admin', fieldWorker: 'Field Worker' },
                statuses: { active: 'Active', inactive: 'Inactive' },
                buttons: { cancel: 'Cancel', create: 'Create user', update: 'Save changes' },
                errors: { nameRequired: 'Name is required', emailRequired: 'Email is required', phoneRequired: 'Phone is required' },
            },
            deleteModal: {
                title: 'Confirm deletion', message: 'Are you sure you want to delete user',
                warning: 'This action cannot be undone.', cancel: 'Cancel', confirm: 'Yes, delete',
            },
        },

        // ── Volunteers ────────────────────────────────────────────────────────
        volunteers: {
            title: 'Volunteers', subtitle: '{{count}} volunteers', addBtn: 'Add Volunteer',
            searchPlaceholder: 'Search by name...',
            tabs: { all: 'All', pending: 'Pending', approved: 'Approved', completed: 'Completed', rejected: 'Rejected' },
            table: { name: 'Name', campaign: 'Campaign', status: 'Status', actions: 'Actions' },
            kanban: {
                title: 'Kanban Board', listView: 'List View', boardView: 'Board View',
                columns: { pending: 'Pending', approved: 'Approved', completed: 'Completed', rejected: 'Rejected' },
            },
            empty: 'No data',
            modal: {
                titleAdd: 'New Volunteer Request', titleEdit: 'Edit Volunteer Request',
                name: 'Volunteer name', namePlaceholder: 'Full name',
                phone: 'Phone number', phonePlaceholder: '05XXXXXXXX',
                email: 'Email', campaign: 'Campaign', campaignPlaceholder: 'Select campaign',
                skill: 'Skill', skillPlaceholder: 'Select skill',
                availability: 'Availability', availabilityPlaceholder: 'Select availability',
                experience: 'Experience', experiencePlaceholder: 'Select experience',
                notes: 'Notes', notesPlaceholder: 'Any additional information...',
                skills: { medical: 'Medical / Health', teaching: 'Education', logistics: 'Logistics', social: 'Social', technical: 'Technical', other: 'Other' },
                availability_options: { morning: 'Morning', evening: 'Evening', weekend: 'Weekend', flexible: 'Flexible' },
                experience_options: { none: 'No experience', '1_2': '1 - 2 years', '3_5': '3 - 5 years', '5_plus': '5+ years' },
                buttons: { cancel: 'Cancel', create: 'Create request', update: 'Save changes' },
                errors: {
                    nameRequired: 'Name is required', phoneRequired: 'Phone is required',
                    campaignRequired: 'Please select a campaign', skillRequired: 'Please select a skill',
                    availabilityRequired: 'Please select availability',
                },
            },
        },

        // ── PDF Export ────────────────────────────────────────────────────────
        pdf: {
            exportBtn: 'Export PDF',
            generating: 'Generating...',
            title: '{{section}} Report',
            generatedAt: 'Generated: {{date}}',
            totalRecords: 'Total records: {{count}}',
            charityName: 'Charity Management System',
        },

        // ── Map ───────────────────────────────────────────────────────────────
        map: {
            title: 'Beneficiaries Map',
            subtitle: 'Geographic distribution of cases',
            total: 'Total Cases',
            byCategory: 'By Category',
            byPriority: 'By Priority',
            noLocation: 'No location data',
        },
    },
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { ar, en },
        defaultNS: 'translation',
        fallbackLng: 'en',
        lng: localStorage.getItem('charity-lang') || 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'charity-lang',
        },
    })

// ── Direction sync ────────────────────────────────────────────────────────────
const applyDirection = (lng) => {
    const lang = lng?.startsWith('ar') ? 'ar' : 'en'
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

applyDirection(i18n.language)
i18n.on('languageChanged', applyDirection)

export default i18n