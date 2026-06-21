import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { beneficiariesService } from './beneficiariesService'

// ─── Query Keys Factory ─────────────────────────────────────────────────────────
// مركزية المفاتيح — بتضمن إنو الـ invalidate يشتغل صح دايماً
export const beneficiariesKeys = {
    all: () => ['beneficiaries'],
    lists: () => ['beneficiaries', 'list'],
    list: (filters) => ['beneficiaries', 'list', filters],
    detail: (id) => ['beneficiaries', 'detail', id],
}

// ─── useGetBeneficiaries ────────────────────────────────────────────────────────
/**
 * جلب قائمة المستفيدين مع فلترة وصفحات
 * الاستخدام في Beneficiaries.jsx:
 *   const { data, isLoading } = useGetBeneficiaries({ status, category, search, page })
 */
export function useGetBeneficiaries(filters = {}) {
    return useQuery({
        queryKey: beneficiariesKeys.list(filters),
        queryFn: () => beneficiariesService.getList(filters),
        keepPreviousData: true,   // ✅ يخلي البيانات القديمة ظاهرة وقت التصفح بين الصفحات
        staleTime: 1000 * 30, // 30 ثانية — بعدها بعيد refresh تلقائي
    })
}

// ─── useGetBeneficiary ──────────────────────────────────────────────────────────
/**
 * جلب مستفيد واحد بالـ id
 * الاستخدام في BeneficiaryCaseView.jsx:
 *   const { data } = useGetBeneficiary(caseData?.id)
 */
export function useGetBeneficiary(id) {
    return useQuery({
        queryKey: beneficiariesKeys.detail(id),
        queryFn: () => beneficiariesService.getById(id),
        enabled: !!id, // ✅ ما يشتغل إلا لما يكون عندنا id
    })
}

// ─── useCreateBeneficiary ───────────────────────────────────────────────────────
/**
 * إضافة مستفيد جديد
 * الاستخدام في BeneficiaryModal.jsx (handleSave):
 *   const createMut = useCreateBeneficiary()
 *   createMut.mutate(form)
 */
export function useCreateBeneficiary() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload) =>
            beneficiariesService.create({
                ...payload,
                status: 'pending',
                registrationDate: new Date().toISOString().split('T')[0],
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: beneficiariesKeys.lists() })
        },
    })
}

// ─── useUpdateBeneficiary ───────────────────────────────────────────────────────
/**
 * تعديل بيانات مستفيد
 * الاستخدام:
 *   const updateMut = useUpdateBeneficiary()
 *   updateMut.mutate({ id: editItem.id, ...form })
 */
export function useUpdateBeneficiary() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => beneficiariesService.update(id, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: beneficiariesKeys.lists() })
            qc.invalidateQueries({ queryKey: beneficiariesKeys.detail(id) })
        },
    })
}

// ─── useChangeBeneficiaryStatus ─────────────────────────────────────────────────
/**
 * تغيير حالة مستفيد (active / rejected / archived...)
 * الاستخدام:
 *   const changeStatus = useChangeBeneficiaryStatus()
 *   changeStatus.mutate({ id: row.id, status: 'rejected' })
 */
export function useChangeBeneficiaryStatus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }) => beneficiariesService.changeStatus(id, status),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: beneficiariesKeys.lists() })
            qc.invalidateQueries({ queryKey: beneficiariesKeys.detail(id) })
        },
    })
}

// ─── useArchiveBeneficiary ──────────────────────────────────────────────────────
/**
 * أرشفة مستفيد (soft delete)
 * الاستخدام:
 *   const archiveMut = useArchiveBeneficiary()
 *   archiveMut.mutate(row.id)
 */
export function useArchiveBeneficiary() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => beneficiariesService.archive(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: beneficiariesKeys.lists() })
        },
    })
}

// ─── useDeleteBeneficiary ───────────────────────────────────────────────────────
/**
 * حذف نهائي (hard delete)
 * الاستخدام:
 *   const deleteMut = useDeleteBeneficiary()
 *   deleteMut.mutate(row.id)
 */
export function useDeleteBeneficiary() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => beneficiariesService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: beneficiariesKeys.lists() })
        },
    })
}