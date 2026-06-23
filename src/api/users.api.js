// src/api/users.api.js
import axiosInstance from './axiosInstance'

// ── جلب المستخدمين ──────────────────────────────────────────
export const getAllUsers = () =>
    axiosInstance.get('/getAllUsers').then(r => r.data)

export const getUserById = (id) =>
    axiosInstance.get(`/getUserById/${id}`).then(r => r.data)

export const listByRole = (role) =>
    axiosInstance.get(`/listByRole/${role}`).then(r => r.data)

export const getAllPendingUsers = () =>
    axiosInstance.get('/getAllPendingUsers').then(r => r.data)

export const getAllNonUserAccounts = () =>
    axiosInstance.get('/getAllNonUserAccounts').then(r => r.data)

// ── إجراءات على المستخدمين ──────────────────────────────────

// ⚠️ لازم FormData لأن فيه profile_image (file upload)
// data: { first_name, last_name, email, phone, password, password_confirmation, role, profile_image?: File }
export const createEmployee = (data) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value)
        }
    })

    return axiosInstance.post('/createEmployee', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
}

export const approveUser = (id) =>
    axiosInstance.post(`/approveUser/${id}`).then(r => r.data)

export const setPending = (id) =>
    axiosInstance.post(`/setPending/${id}`).then(r => r.data)

export const promoteUser = (id, role) =>
    axiosInstance.post(`/promoteUser/${id}`, { role }).then(r => r.data)

export const demoteUser = (id) =>
    axiosInstance.post(`/demoteUser/${id}`).then(r => r.data)

export const changePassword = (data) =>
    axiosInstance.post('/changePassword', data).then(r => r.data)

export const addBalanceToUser = (userId, data) =>
    axiosInstance.post(`/addBalanceToUser/${userId}`, data).then(r => r.data)