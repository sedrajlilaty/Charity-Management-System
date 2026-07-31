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

export const deleteUser = (id) =>
    axiosInstance.delete(`/deleteUser/${id}`).then(r => r.data)

// ── تحديث البروفايل الشخصي ──────────────────────────────────
// تحويل base64 (الجاي من ImageUpload) لـ File حقيقي قابل للرفع
const base64ToFile = (base64, filename = 'upload.png') => {
    const [header, data] = base64.split(',')
    const mimeMatch = header.match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new File([bytes], filename, { type: mime })
}

const FILE_FIELDS = ['profile_image', 'national_id', 'international_passport']

// ⚠️ أسماء الحقول (name/first_name.../إلخ) لسا لازم تتأكد من UpdateProfileRequest
// data: { name?, email?, phone?, password?, password_confirmation?, profile_image?: base64|File, national_id?: base64|File, international_passport?: base64|File }
export const updateProfile = (data) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return

        if (FILE_FIELDS.includes(key)) {
            const file = typeof value === 'string' && value.startsWith('data:')
                ? base64ToFile(value, `${key}-${Date.now()}.png`)
                : value
            formData.append(key, file)
        } else {
            formData.append(key, value)
        }
    })

    return axiosInstance.post('/userprofile/update', formData, {
        headers: { 'Content-Type': undefined }, // ⚠️ لازم فاضي حتى أكسيوس يحط multipart boundary لحاله (نفس مشكلة الحملات)
    }).then(r => r.data)
}

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
        headers: { 'Content-Type': undefined }, // ⚠️ نفس الإصلاح (كان "multipart/form-data" يدوي وهاد غلط بدون boundary)
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