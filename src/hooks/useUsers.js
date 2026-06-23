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