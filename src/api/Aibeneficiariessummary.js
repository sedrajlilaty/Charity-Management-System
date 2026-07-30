// api/aiBeneficiariesSummary.js
// ⚠️ عدّلي مسار الـ import تحت حسب مكان الملف يلي فيه getPendingPatients وأخواتها عندك فعلياً
import {
    getPendingPatients,
    getPendingOrphans,
    getPendingSchools,
    getPendingUniversities,
    getOpenAcceptedPatients,
    getOpenAcceptedOrphans,
    getOpenAcceptedSchools,
    getOpenAcceptedUniversities,
} from './requests.api' // ⚠️ عدّلي هاد المسار لاسم الملف الحقيقي عندك

// الـ endpoints ممكن ترجع array مباشرة، أو { data: [...] }، أو { count: n } — هاي بتتعامل مع الحالات الثلاث
const countOf = (res) => {
    if (Array.isArray(res)) return res.length
    if (Array.isArray(res?.data)) return res.data.length
    if (typeof res?.count === 'number') return res.count
    if (typeof res?.total === 'number') return res.total
    return 0
}

// بيرجع ملخص عدد المستفيدين حسب الفئة والحالة (معلق/مقبول) — يُستخدم بسياق الـ AI
export const getBeneficiariesAISummary = async () => {
    const [
        pendingPatients, pendingOrphans, pendingSchools, pendingUniversities,
        acceptedPatients, acceptedOrphans, acceptedSchools, acceptedUniversities,
    ] = await Promise.all([
        getPendingPatients(), getPendingOrphans(), getPendingSchools(), getPendingUniversities(),
        getOpenAcceptedPatients(), getOpenAcceptedOrphans(), getOpenAcceptedSchools(), getOpenAcceptedUniversities(),
    ])

    const pending = {
        patients: countOf(pendingPatients),
        orphans: countOf(pendingOrphans),
        schoolStudents: countOf(pendingSchools),
        universityStudents: countOf(pendingUniversities),
    }
    const accepted = {
        patients: countOf(acceptedPatients),
        orphans: countOf(acceptedOrphans),
        schoolStudents: countOf(acceptedSchools),
        universityStudents: countOf(acceptedUniversities),
    }

    const totalPending = Object.values(pending).reduce((a, b) => a + b, 0)
    const totalAccepted = Object.values(accepted).reduce((a, b) => a + b, 0)

    return { pending, accepted, totalPending, totalAccepted, total: totalPending + totalAccepted }
}