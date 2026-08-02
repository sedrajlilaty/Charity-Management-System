// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAllUsers,
    getUserById,
    listByRole,
    getAllPendingUsers,
    getAllNonUserAccounts,
    createEmployee,
    approveUser,
    setPending,
    promoteUser,
    demoteUser,
    changePassword,
    addBalanceToUser,
    deleteUser,
    updateProfile, // ✅ جديد
} from '../api/users.api'

// ── Queries ──────────────────────────────────────────────────

// كل المستخدمين — بيرجع { success, count, users }
export const useAllUsers = () =>
    useQuery({
        queryKey: ['users', 'all'],
        queryFn: getAllUsers,
        select: (data) => data.users, // نرجع المصفوفة مباشرة
    })

// مستخدم واحد
export const useUserById = (id) =>
    useQuery({
        queryKey: ['users', id],
        queryFn: () => getUserById(id),
        enabled: !!id,
        select: (data) => data.user,
    })

// حسب الرول — الأرول الحقيقية من الباك اند
// 'admin' | 'sub_admin' | 'field_worker' | 'user'
export const useListByRole = (role) =>
    useQuery({
        queryKey: ['users', 'role', role],
        queryFn: () => listByRole(role),
        enabled: !!role,
        select: (data) => data.data, // هاد الـ endpoint بيرجع data مش users
    })

// مستخدمي التطبيق (role = 'user') — عندهم أرصدة وشحن
// ⚠️ عم نستخدم getAllUsers مش listByRole لأنو listByRole بالباك اند بتقص عمود balances بالـ select()
export const useAppUsers = () =>
    useQuery({
        queryKey: ['users', 'all'],
        queryFn: getAllUsers,
        select: (data) => data.users.filter(u => u.role === 'user'),
    })
// المستخدمين المعلقين
export const useAllPendingUsers = () =>
    useQuery({
        queryKey: ['users', 'pending'],
        queryFn: getAllPendingUsers,
        select: (data) => data.users,
    })

// موظفي الداشبورد (sub_admin + field_worker)
export const useAllNonUserAccounts = () =>
    useQuery({
        queryKey: ['users', 'nonUser'],
        queryFn: getAllNonUserAccounts,
        select: (data) => data.users,
    })

// ── Mutations ─────────────────────────────────────────────────

export const useCreateEmployee = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createEmployee,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

export const useApproveUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: approveUser, // (id)
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

export const useSetPending = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: setPending, // (id)
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

// الاستخدام: promoteUserMut.mutate({ id, role: 'sub_admin' })
export const usePromoteUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, role }) => promoteUser(id, role),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

export const useDemoteUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: demoteUser, // (id)
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

export const useChangePassword = () =>
    useMutation({ mutationFn: changePassword })

// الاستخدام: addBalanceMut.mutate({ userId, currency: 'USD', amount: 100 })
export const useAddBalanceToUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, ...data }) => addBalanceToUser(userId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

export const useDeleteUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteUser, // (id)
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    })
}

// ══════════════════════════════════════════════════════════════
// ✅ تعديل معلوماتي أنا (البروفايل الشخصي لليوزر المسجّل دخول)
// اسم الـ hook هون matching تماماً مع الاستيراد بـ ProfileEditModal.jsx: useUpdateProfile
// ══════════════════════════════════════════════════════════════
export const useUpdateProfile = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
        // ✅ تحديث الـ AuthContext (updateUser) عم يصير جوا ProfileEditModal.jsx نفسه
        // بعد نجاح mutateAsync، مش هون — حتى الـ hook يضل عام وممكن يُستخدم بأي مكان
    })
}