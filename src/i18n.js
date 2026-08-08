import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ═══════════════════════════════════════════════════════════════════════════════
// ARABIC
// ═══════════════════════════════════════════════════════════════════════════════
const ar = {
    translation: {
        brand:
        {
            name: "عطاء",
            subtitle: "منصة العمل الخيري"
        },
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
            wallet: 'المحفظة ',
            appUsers: "مستخدمو التطبيق"
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
            tabs: {
                login: 'تسجيل الدخول',
                register: 'إنشاء حساب',
            },
            fields: {
                email: 'البريد الإلكتروني',
                emailPlaceholder: 'ادخلي البريد الإلكتروني',
                password: 'كلمة المرور',
                passwordPlaceholder: 'ادخلي كلمة المرور',
            },
            forgotPassword: 'نسيت كلمة المرور؟',
            submit: 'تسجيل الدخول',
            orContinueWith: 'أو المتابعة عبر',
            noAccount: 'ليس لديك حساب؟',
            registerNow: 'سجّلي الآن',
            welcomeToast: 'أهلاً {{name}} 👋',
            showPassword: 'إظهار كلمة المرور',
            hidePassword: 'إخفاء كلمة المرور',
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
            tableTitle: 'قائمة التبرعات',
            tableSubtitle: 'متابعة وإدارة التبرعات الخاصة بالجمعية',

            summary: {
                total: 'إجمالي التبرعات',
                count: 'عدد التبرعات',
                avg: 'متوسط التبرع',
                max: 'أعلى تبرع',
            },

            filter: {
                search: 'ابحث باسم المتبرع...',
            },
        },

        // ── Beneficiaries ─────────────────────────────────────────────────────
        beneficiaries: {
            title: 'المستفيدون',
            subtitle: '{{count}} مستفيد مسجل',
            addBtn: 'إضافة مستفيد',

            tabs: {
                all: 'الكل',
                active: 'نشط',
                pending: 'قيد المراجعة',
                rejected: 'مرفوض',
                archived: 'مؤرشف',
            },

            categories: {
                all: 'كل الفئات',
                label: 'الفئة',
                patient: 'مريض',
                orphan: 'يتيم',
                school_student: 'طالب مدرسة',
                university_student: 'طالب جامعة',
            },

            priority: {
                label: 'الأولوية',
                high: 'عالية',
                medium: 'متوسطة',
                low: 'منخفضة',
            },

            table: {
                title: 'قائمة المستفيدين',
                subtitle: 'إدارة وعرض بيانات المستفيدين',
                beneficiary: 'المستفيد',
                category: 'الفئة',
                location: 'الموقع',
                priority: 'الأولوية',
                amount: 'المبلغ المطلوب',
                status: 'الحالة',
                actions: 'الإجراءات',
            },

            search: 'بحث بالاسم...',
            empty: { title: 'لا يوجد مستفيدون', description: 'ابدأ بإضافة أول مستفيد' },

            support: {
                laptop: 'دعم لابتوب',
                fees: 'رسوم دراسية',
            },

            caseView: {
                title: 'تفاصيل الحالة',
                publishTitle: 'قبول ونشر الحالة',
                caseNumber: 'رقم الحالة #{{id}}',
                publishSubtitle: 'أضف البيانات التي ستظهر للمتبرعين',
                close: 'إغلاق',
                reject: 'رفض',
                archive: 'أرشفة',
                approveAndPublish: 'قبول ونشر',
                confirmPublish: 'تأكيد القبول والنشر',
                back: 'رجوع',

                fields: {
                    phone: 'الهاتف',
                    email: 'البريد',
                    governorate: 'المحافظة',
                    region: 'المنطقة',
                    address: 'العنوان التفصيلي',
                    description: 'وصف الحالة',
                    amount: 'المبلغ المطلوب',
                    priority: 'أولوية',
                    publishedTitle: 'تفاصيل النشر',
                    grade: 'المرحلة الدراسية',
                    school: 'اسم المدرسة',
                    year: 'السنة الدراسية',
                    supportType: 'نوع الدعم',
                },

                files: {
                    picture: 'الصورة الشخصية',
                    medicalReport: 'التقرير الطبي',
                    nationalId: 'الهوية الوطنية',
                    familyBooklet: 'دفتر العائلة',
                    deathCert: 'وثيقة وفاة الوالد',
                    familyBook: 'صورة دفتر العائلة',
                    universityId: 'بطاقة الجامعة',
                    uploaded: 'تم رفع الملف',
                },

                publish: {
                    warning: 'هذه المعلومات ستظهر للمتبرعين — اختر عنواناً ووصفاً احترافياً دون الكشف عن بيانات حساسة',
                    caseTitle: 'عنوان الحالة',
                    caseTitleRequired: 'عنوان الحالة مطلوب',
                    caseDesc: 'وصف الحالة للعرض العام',
                    caseDescRequired: 'وصف الحالة مطلوب',
                    caseDescPlaceholder: 'وصف مختصر يوضح احتياج الحالة دون الكشف عن بيانات شخصية...',
                    caseImage: 'صورة الحالة',
                    imageOptional: '(اختياري)',
                    imageLabel: 'اضغط أو اسحب صورة الحالة',
                    placeholders: {
                        patient: 'مثال: مريض يحتاج دعماً طبياً عاجلاً',
                        orphan: 'مثال: كفالة أيتام — أسرة بحاجة للدعم',
                        school_student: 'مثال: دعم طالب متفوق في مدرسته',
                        university_student: 'مثال: طالب جامعي يحتاج لابتوب للدراسة',
                    },
                },
            },

            map: {
                allGov: 'كل المحافظات',
                allCat: 'كل الفئات',
                allPri: 'كل الأولويات',
                clearFilters: '✕ مسح الفلاتر',
                unmapped: '{{count}} مستفيد لم يُحدَّد موقعهم',
                unmappedTip: 'تأكد من وجود حقل المحافظة أو المنطقة في بيانات المستفيد',
                govLevel: 'موضوع على مستوى المحافظة',
                legend: { category: 'الفئة', sizeNote: '● حجم الدائرة = الأولوية' },
                counter: '{{filtered}} / {{total}} مستفيد',
            },
        },

        // ── Campaigns ─────────────────────────────────────────────────────────
        campaigns: {
            title: 'الحملات', subtitle: '{{count}} حملة', addBtn: 'حملة جديدة', total: 'الإجمالي',
            raised: 'تم جمعه', goal: 'الهدف', beneficiariesCount: 'مستفيد',
            empty: 'لا توجد حملات بعد', deleteConfirm: 'هل أنت متأكد من حذف هذه الحملة؟',
            actions: { edit: 'تعديل', delete: 'حذف', close: 'إغلاق الحملة' },

            types: { educational: 'تعليمية', medical: 'طبية', humanitarian: 'إنسانية', environmental: 'بيئية' },
            participationTypes: { donationOnly: 'تبرعات فقط', volunteerOnly: 'تطوع فقط', donationAndVolunteer: 'تبرعات وتطوع' },
            statuses: {
                open: 'مفتوحة', closed: 'مغلقة', paused: 'متوقفة مؤقتاً', cancelled: 'ملغاة', expired: 'منتهية',
                completedDonations: 'اكتمل التمويل', completedVolunteers: 'اكتمل المتطوعون', completedAll: 'مكتملة بالكامل',
            },

            filters: {
                searchPlaceholder: 'ابحث باسم الحملة...',
                allTypes: 'كل الأنواع', allStatuses: 'كل الحالات', allParticipationTypes: 'كل أنواع المشاركة',
                advanced: 'فلترة متقدمة', clear: 'مسح الفلاتر',
                minAmount: 'أقل مبلغ', maxAmount: 'أعلى مبلغ',
                startDateFrom: 'من تاريخ البداية', startDateTo: 'إلى تاريخ البداية',
                endDateFrom: 'من تاريخ النهاية', endDateTo: 'إلى تاريخ النهاية',
                sortDesc: 'تنازلي', sortAsc: 'تصاعدي',
                sort: {
                    newest: 'الأحدث', amountNeeded: 'المبلغ المطلوب', amountCollected: 'المبلغ المجموع',
                    startDate: 'تاريخ البداية', endDate: 'تاريخ النهاية', title: 'الاسم',
                },
            },

            modal: {
                titleAdd: 'إضافة حملة جديدة', titleEdit: 'تعديل الحملة',
                name: 'اسم الحملة', namePlaceholder: 'مثال: كسوة الشتاء 2026',
                description: 'الوصف', descPlaceholder: 'وصف مختصر عن الحملة...',
                type: 'نوع الحملة', selectType: 'اختر النوع',
                participationType: 'نوع المشاركة',
                targetAmount: 'المبلغ المطلوب (ل.س)', targetPlaceholder: '50000',
                volunteersNeeded: 'عدد المتطوعين المطلوب', volunteersPlaceholder: '20',
                status: 'حالة الحملة', systemManagedStatus: 'هذه الحالة ({{status}}) محددة تلقائياً من النظام ولا يمكن تعديلها يدوياً هون.',
                startDate: 'تاريخ البداية', startDateLocked: 'تاريخ البداية لا يمكن تعديله بعد إنشاء الحملة',
                endDate: 'تاريخ النهاية',
                media: 'صورة الحملة', newMedia: 'إضافة صورة جديدة (اختياري)', mediaUploadLabel: 'اضغط أو اسحب صورة للحملة',
                existingMedia: 'الصور الحالية', existingMediaNote: 'لا يمكن حذف الصور الحالية من الواجهة حالياً. أي صورة جديدة رح تُضاف معهن، مش تستبدلهن.',
                PermissionButtons: { cancel: 'إلغاء', create: 'إنشاء الحملة', update: 'حفظ التعديلات' },
                errors: {
                    nameRequired: 'اسم الحملة مطلوب',
                    descriptionRequired: 'وصف الحملة مطلوب',
                    typeRequired: 'الرجاء اختيار نوع الحملة',
                    statusRequired: 'الرجاء اختيار حالة الحملة',
                    amountRequired: 'المبلغ المطلوب إلزامي',
                    volunteersRequired: 'عدد المتطوعين مطلوب لهذا النوع من الحملات',
                    startDateRequired: 'تاريخ البداية مطلوب',
                    startDatePast: 'تاريخ البداية لا يمكن أن يكون بالماضي',
                    endDateRequired: 'تاريخ النهاية مطلوب',
                    endDateFuture: 'تاريخ النهاية يجب أن يكون تاريخاً مستقبلياً',
                    endDateAfterStart: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
                    mediaRequired: 'صورة واحدة على الأقل مطلوبة للحملة',
                },
            },
        },
        //محفظة
        wallet: {
            title: 'المحفظة',
            subtitle: 'الإدارة المالية وعمليات الصرف',
            disburseBtn: 'صرف من المحفظة',
            kpi: {
                balance: 'الرصيد الحالي',
                totalOut: 'إجمالي المصروف',
            },
            campaigns: 'الحملات',
            cases: 'حالات المستفيدين',
            raised: 'التبرعات',
            totalRaised: 'إجمالي التبرعات',
            disbursed: 'تم صرفه',
            remaining: 'المتبقي',
            disburse: 'صرف',
            fullyDisbursed: 'تم الصرف بالكامل',
            status: { completed: 'مكتملة', active: 'نشطة' },
            type: { campaign: 'حملة', case: 'حالة' },
            txTitle: 'سجل المصروفات',
            txSubtitle: 'جميع عمليات الصرف للحملات والحالات',
            table: { id: '#', target: 'الوجهة', type: 'النوع', amount: 'المبلغ', note: 'ملاحظة', date: 'التاريخ' },
            searchPlaceholder: 'ابحث بالاسم أو الملاحظة...',
            empty: 'لا توجد مصروفات',
            modal: {
                title: 'صرف من المحفظة',
                subtitle: 'اختر الوجهة وأدخل المبلغ',
                available: 'الرصيد المتاح',
                destination: 'وجهة الصرف',
                campaign: 'حملة',
                case: 'حالة مستفيد',
                selectCampaign: 'اختر الحملة',
                selectCase: 'اختر الحالة',
                choose: 'اختر',
                totalRaised: 'إجمالي التبرعات',
                disbursed: 'تم صرفه مسبقاً',
                remaining: 'المتبقي للصرف',
                amount: 'المبلغ (ر.س)',
                amountPlaceholder: 'أدخل المبلغ...',
                note: 'ملاحظة',
                notePlaceholder: 'ملاحظة اختيارية...',
                confirm: 'تأكيد الصرف',
                errors: {
                    noTarget: 'اختر الوجهة أولاً',
                    invalidAmt: 'أدخل مبلغاً صحيحاً',
                    noBalance: 'المبلغ يتجاوز رصيد المحفظة',
                    overRemain: 'المبلغ يتجاوز المتبقي لهذه الوجهة',
                },
            },
            toast: { success: 'تم الصرف بنجاح إلى' },
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
        //========= appUser
        appUsers: {
            title: "مستخدمو التطبيق",
            subtitle: "إجمالي {{count}} مستخدم مسجّل",
            searchPlaceholder: "ابحث بالاسم أو رقم الهاتف...",
            tableTitle: "قائمة المستخدمين",
            tableSubtitle: "إدارة أرصدة مستخدمي تطبيق التبرع",
            table: {
                user: "المستخدم",
                contact: "التواصل",
                balance: "الرصيد",
                status: "الحالة",
                joinedAt: "تاريخ الانضمام",
                actions: "الإجراءات"
            },
            actions: {
                topUp: "شحن رصيد"
            },
            empty: {
                title: "لا يوجد مستخدمون",
                description: "لم يسجّل أي مستخدم في التطبيق بعد"
            }
        },
        topUp: {
            title: "شحن الرصيد",
            subtitle: "إضافة رصيد للمحفظة الإلكترونية",
            currentBalance: "الرصيد الحالي",
            quickAmounts: "مبالغ سريعة",
            amountLabel: "المبلغ المراد إضافته",
            amountPlaceholder: "أدخل المبلغ",
            balanceAfter: "الرصيد بعد الشحن",
            confirmBtn: "تأكيد الشحن",
            errors: {
                invalidAmount: "يرجى إدخال مبلغ صحيح أكبر من صفر"
            }
        }
        ,
        // ── Services ──────────────────────────────────────────────────────────
        services: {
            title: 'الخدمات والبرامج', subtitle: '{{count}} مستفيد نشط',
            heroSubtitle: 'إدارة البرامج والخدمات المجتمعية',
            currentSupport: 'إجمالي الدعم الحالي',
            actions: { edit: 'تعديل' },
            stats: { active: 'حالات مستفيدة', pending: 'قيد الانتظار', totalActive: 'المستفيدون النشطون' },
            types: {
                orphan: { title: 'كفالة يتيم', description: 'دعم شهري ثابت للأيتام وأسرهم لتأمين احتياجاتهم الأساسية' },
                medical: { title: 'حالات طبية', description: 'تغطية التكاليف الطبية والأدوية للحالات المرضية المحتاجة' },
                schoolStudent: { title: 'طالب مدرسي', description: 'دعم الطلاب بالمرحلة المدرسية بالمستلزمات والرسوم الدراسية' },
                universityStudent: { title: 'طالب جامعي', description: 'منح ودعم مالي للطلاب الجامعيين المتفوقين المحتاجين' },
            },
            modal: {
                titleEdit: 'تعديل الخدمة',
                description: 'الوصف', descPlaceholder: 'وصف مختصر للخدمة...',
                amount: 'مبلغ الدعم الشهري (ل.س)',
                buttons: { cancel: 'إلغاء', save: 'حفظ التعديلات' },
                errors: { descRequired: 'الوصف مطلوب' },
            },
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
                PermissionButtons: { cancel: 'إلغاء', create: 'إنشاء المستخدم', update: 'حفظ التعديلات' },
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
                PermissionButtons: { cancel: 'إلغاء', create: 'إنشاء الطلب', update: 'حفظ التعديلات' },
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
        brand:
        {
            name: "Ataa",
            subtitle: "Charity Platform"
        },

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
            ai: 'AI Assistant',
            wallet: 'Wallet',
            appUsers: "App Users"
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
            tabs: {
                login: 'Login',
                register: 'Create Account',
            },
            fields: {
                email: 'Email',
                emailPlaceholder: 'Enter your email',
                password: 'Password',
                passwordPlaceholder: 'Enter your password',
            },
            forgotPassword: 'Forgot password?',
            submit: 'Login',
            orContinueWith: 'Or continue with',
            noAccount: "Don't have an account?",
            registerNow: 'Register now',
            welcomeToast: 'Welcome {{name}} 👋',
            showPassword: 'Show password',
            hidePassword: 'Hide password',
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
            tableTitle: 'Donations List',
            tableSubtitle: 'Track and manage all charity donations',

            summary: {
                total: 'Total Donations',
                count: 'Count',
                avg: 'Average Donation',
                max: 'Highest Donation',
            },

            filter: {
                search: 'Search by donor name...',
            },
        },

        // ── Beneficiaries ─────────────────────────────────────────────────────

        beneficiaries: {
            title: 'Beneficiaries',
            subtitle: '{{count}} registered cases',
            addBtn: 'Add Case',

            tabs: {
                all: 'All',
                active: 'Active',
                pending: 'Under Review',
                rejected: 'Rejected',
                archived: 'Archived',
            },

            categories: {
                all: 'All Categories',
                label: 'Category',
                patient: 'Patient',
                orphan: 'Orphan',
                school_student: 'School Student',
                university_student: 'University Student',
            },

            priority: {
                label: 'Priority',
                high: 'High',
                medium: 'Medium',
                low: 'Low',
            },

            table: {
                title: 'Beneficiaries List',
                subtitle: 'Manage and view beneficiary data',
                beneficiary: 'Beneficiary',
                category: 'Category',
                location: 'Location',
                priority: 'Priority',
                amount: 'Required Amount',
                status: 'Status',
                actions: 'Actions',
            },

            search: 'Search by name...',
            empty: { title: 'No beneficiaries found', description: 'Start by adding the first case' },

            support: {
                laptop: 'Laptop Support',
                fees: 'Tuition Fees',
            },

            caseView: {
                title: 'Case Details',
                publishTitle: 'Approve & Publish Case',
                caseNumber: 'Case #{{id}}',
                publishSubtitle: 'Add details that will be shown to donors',
                close: 'Close',
                reject: 'Reject',
                archive: 'Archive',
                approveAndPublish: 'Approve & Publish',
                confirmPublish: 'Confirm Approval & Publishing',
                back: 'Back',

                fields: {
                    phone: 'Phone',
                    email: 'Email',
                    governorate: 'Governorate',
                    region: 'Region',
                    address: 'Detailed Address',
                    description: 'Case Description',
                    amount: 'Required Amount',
                    priority: 'Priority',
                    publishedTitle: 'Publishing Details',
                    grade: 'Academic Grade',
                    school: 'School Name',
                    year: 'Academic Year',
                    supportType: 'Support Type',
                },

                files: {
                    picture: 'Personal Photo',
                    medicalReport: 'Medical Report',
                    nationalId: 'National ID',
                    familyBooklet: 'Family Booklet',
                    deathCert: 'Father Death Certificate',
                    familyBook: 'Family Book Photo',
                    universityId: 'University ID',
                    uploaded: 'File uploaded',
                },

                publish: {
                    warning: 'This information will be visible to donors — choose a professional title and description without revealing sensitive personal data',
                    caseTitle: 'Case Title',
                    caseTitleRequired: 'Case title is required',
                    caseDesc: 'Public Case Description',
                    caseDescRequired: 'Case description is required',
                    caseDescPlaceholder: 'Brief description of the case need without revealing personal data...',
                    caseImage: 'Case Image',
                    imageOptional: '(optional)',
                    imageLabel: 'Click or drag a case image',
                    placeholders: {
                        patient: 'e.g. Patient in urgent need of medical support',
                        orphan: 'e.g. Orphan sponsorship — family in need',
                        school_student: 'e.g. Supporting a high-achieving school student',
                        university_student: 'e.g. University student needs a laptop for studies',
                    },
                },
            },

            map: {
                allGov: 'All Governorates',
                allCat: 'All Categories',
                allPri: 'All Priorities',
                clearFilters: '✕ Clear Filters',
                unmapped: '{{count}} beneficiaries with no location',
                unmappedTip: 'Make sure governorate or region fields are filled in the beneficiary data',
                govLevel: 'Placed at governorate level',
                legend: { category: 'Category', sizeNote: '● Circle size = Priority' },
                counter: '{{filtered}} / {{total}} beneficiaries',
            },
        },

        // ── Campaigns ─────────────────────────────────────────────────────────
        campaigns: {
            title: 'Campaigns', subtitle: '{{count}} campaigns', addBtn: 'New campaign', total: 'Total',
            raised: 'Raised', goal: 'Goal', beneficiariesCount: 'beneficiaries',
            empty: 'No campaigns yet', deleteConfirm: 'Are you sure you want to delete this campaign?',
            actions: { edit: 'Edit', delete: 'Delete', close: 'Close campaign' },

            types: { educational: 'Educational', medical: 'Medical', humanitarian: 'Humanitarian', environmental: 'Environmental' },
            participationTypes: { donationOnly: 'Donations only', volunteerOnly: 'Volunteering only', donationAndVolunteer: 'Donations & volunteering' },
            statuses: {
                open: 'Open', closed: 'Closed', paused: 'Paused', cancelled: 'Cancelled', expired: 'Expired',
                completedDonations: 'Donations completed', completedVolunteers: 'Volunteers completed', completedAll: 'Fully completed',
            },

            filters: {
                searchPlaceholder: 'Search by campaign name...',
                allTypes: 'All types', allStatuses: 'All statuses', allParticipationTypes: 'All participation types',
                advanced: 'Advanced filters', clear: 'Clear filters',
                minAmount: 'Min amount', maxAmount: 'Max amount',
                startDateFrom: 'Start date from', startDateTo: 'Start date to',
                endDateFrom: 'End date from', endDateTo: 'End date to',
                sortDesc: 'Descending', sortAsc: 'Ascending',
                sort: {
                    newest: 'Newest', amountNeeded: 'Amount needed', amountCollected: 'Amount collected',
                    startDate: 'Start date', endDate: 'End date', title: 'Name',
                },
            },

            modal: {
                titleAdd: 'New Campaign', titleEdit: 'Edit Campaign',
                name: 'Campaign name', namePlaceholder: 'Example: Winter Clothing 2026',
                description: 'Description', descPlaceholder: 'Short campaign description...',
                type: 'Campaign type', selectType: 'Select a type',
                participationType: 'Participation type',
                targetAmount: 'Target amount (SAR)', targetPlaceholder: '50000',
                volunteersNeeded: 'Volunteers needed', volunteersPlaceholder: '20',
                status: 'Status', systemManagedStatus: "This status ({{status}}) is set automatically by the system and can't be edited manually here.",
                startDate: 'Start date', startDateLocked: "Start date can't be changed after the campaign is created",
                endDate: 'End date',
                media: 'Campaign image', newMedia: 'Add a new image (optional)', mediaUploadLabel: 'Click or drag an image for the campaign',
                existingMedia: 'Current images', existingMediaNote: "Current images can't be deleted from the interface yet. Any new image will be added, not replace them.",
                PermissionButtons: { cancel: 'Cancel', create: 'Create campaign', update: 'Save changes' },
                errors: {
                    nameRequired: 'Campaign name is required',
                    descriptionRequired: 'Campaign description is required',
                    typeRequired: 'Please select a campaign type',
                    statusRequired: 'Please select a campaign status',
                    amountRequired: 'Target amount is required',
                    volunteersRequired: 'Volunteers needed is required for this campaign type',
                    startDateRequired: 'Start date is required',
                    startDatePast: "Start date can't be in the past",
                    endDateRequired: 'End date is required',
                    endDateFuture: 'End date must be in the future',
                    endDateAfterStart: 'End date must be after the start date',
                    mediaRequired: 'At least one image is required for the campaign',
                },
            },
        },
        //wallet
        wallet: {
            title: 'Wallet',
            subtitle: 'Financial management & disbursements',
            disburseBtn: 'Disburse',
            kpi: { balance: 'Current Balance', totalOut: 'Total Disbursed' },
            campaigns: 'CAMPAIGNS',
            cases: 'BENEFICIARY CASES',
            raised: 'Raised',
            totalRaised: 'Total raised',
            disbursed: 'Disbursed',
            remaining: 'Remaining',
            disburse: 'Disburse',
            fullyDisbursed: 'Fully Disbursed',
            status: { completed: 'Completed', active: 'Active' },
            type: { campaign: 'Campaign', case: 'Case' },
            txTitle: 'Disbursement History',
            txSubtitle: 'All outgoing disbursements to campaigns and cases',
            table: { id: '#', target: 'Destination', type: 'Type', amount: 'Amount', note: 'Note', date: 'Date' },
            searchPlaceholder: 'Search by name or note...',
            empty: 'No disbursements found',
            modal: {
                title: 'Disburse from Wallet',
                subtitle: 'Choose destination and enter amount',
                available: 'Available balance',
                destination: 'Destination type',
                campaign: 'Campaign',
                case: 'Case',
                selectCampaign: 'Select campaign',
                selectCase: 'Select case',
                choose: 'Select',
                totalRaised: 'Total raised',
                disbursed: 'Already disbursed',
                remaining: 'Remaining',
                amount: 'Amount (SAR)',
                amountPlaceholder: 'Enter amount...',
                note: 'Note',
                notePlaceholder: 'Optional note...',
                confirm: 'Confirm Disbursement',
                errors: {
                    noTarget: 'Please select a destination',
                    invalidAmt: 'Please enter a valid amount',
                    noBalance: 'Amount exceeds wallet balance',
                    overRemain: 'Amount exceeds remaining for this destination',
                },
            },
            toast: { success: 'Successfully disbursed to' },
        },

        ///====appUser
        appUsers: {
            title: "App Users",
            subtitle: "{{count}} registered users total",
            searchPlaceholder: "Search by name or phone...",
            tableTitle: "Users List",
            tableSubtitle: "Manage donation app users' wallets",
            table: {
                user: "User",
                contact: "Contact",
                balance: "Balance",
                status: "Status",
                joinedAt: "Joined At",
                actions: "Actions"
            },
            actions: {
                topUp: "Top Up"
            },
            empty: {
                title: "No users found",
                description: "No users have registered in the app yet"
            }
        },
        topUp: {
            title: "Top Up Balance",
            subtitle: "Add funds to the e-wallet",
            currentBalance: "Current Balance",
            quickAmounts: "Quick Amounts",
            amountLabel: "Amount to Add",
            amountPlaceholder: "Enter amount",
            balanceAfter: "Balance After Top Up",
            confirmBtn: "Confirm Top Up",
            errors: {
                invalidAmount: "Please enter a valid amount greater than zero"
            }
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
            title: 'Services & Programs', subtitle: '{{count}} active beneficiaries',
            heroSubtitle: 'Managing community programs and services',
            currentSupport: 'Total current support',
            actions: { edit: 'Edit' },
            stats: { active: 'Active cases', pending: 'Pending', totalActive: 'Active beneficiaries' },
            types: {
                orphan: { title: 'Orphan Sponsorship', description: 'Fixed monthly support for orphans and their families to secure basic needs' },
                medical: { title: 'Medical Cases', description: 'Covering medical costs and medication for needy patients' },
                schoolStudent: { title: 'School Student', description: 'Supporting school students with supplies and tuition fees' },
                universityStudent: { title: 'University Student', description: 'Scholarships and financial support for outstanding needy university students' },
            },
            modal: {
                titleEdit: 'Edit Service',
                description: 'Description', descPlaceholder: 'Short service description...',
                amount: 'Monthly support amount (SAR)',
                buttons: { cancel: 'Cancel', save: 'Save changes' },
                errors: { descRequired: 'Description is required' },
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
                PermissionButtons: { cancel: 'Cancel', create: 'Create user', update: 'Save changes' },
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
                PermissionButtons: { cancel: 'Cancel', create: 'Create request', update: 'Save changes' },
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