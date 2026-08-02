// src/api/users.api.js
import axiosInstance from './axiosInstance'
import { dataURLtoFile } from '../../src/utlis/fileHelpers' // ✅ جديد

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

export const deleteUser = (id) =>
    axiosInstance.delete(`/deleteUser/${id}`).then(r => r.data)

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

// ══════════════════════════════════════════════════════════════
// ✅ تعديل "معلوماتي أنا" (اليوزر المسجّل دخول حالياً) — النسخة المصلحة
// ══════════════════════════════════════════════════════════════
//
// data: { first_name, last_name, email, phone, address, password?, password_confirmation?,
//         profile_image?: base64|File|null, national_id?: base64|File|null, international_passport?: base64|File|null }
//
// ✅ الفيكس: الحقول الثلاثة (profile_image, national_id, international_passport) عم توصل
// كـ base64 string من مكوّن ImageUpload — لو انبعتت متل ما هي، الباك اند ما رح يشوفها
// كملف (hasFile() بترجع false)، فعم نحوّلها لـ File حقيقي هون قبل الإرسال.
//
// ⚠️ Laravel ما بيقرأ multipart/form-data صح مع PUT مباشرة، فبنستخدم POST + _method='PUT' (method spoofing).
// ✏️ عدّلي المسار '/profile' تحت إذا كان مختلف عندك بالباك اند.
const FILE_FIELDS = ['profile_image', 'national_id', 'international_passport']

export const updateProfile = (data) => {
    const formData = new FormData()
    // ✅ ما في داعي لـ _method spoofing — الراوت أصلاً معرّف كـ POST بالباك اند
    // (كنت حاطة PUT سابقاً افتراضاً غلط، وهاد كان رح يمنع الطلب يوصل للراوت أصلاً)

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return

        if (FILE_FIELDS.includes(key)) {
            const file = dataURLtoFile(value, `${key}.png`) // ✅ التحويل الأساسي
            formData.append(key, file)
        } else {
            formData.append(key, value)
        }
    })

    // ✅ المسار الصحيح — أكدناه من routes/api.php
    return axiosInstance.post('/userprofile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
}

