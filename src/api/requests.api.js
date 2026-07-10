// src/api/requests.api.js
import axiosInstance from './axiosInstance'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:8000/storage'

export const fileUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const clean = path.replace(/^\/+/, '')
    return `${STORAGE_URL}/${clean}`
}

// ════════════════════════════════════════════════
//  جلب الطلبات المعلقة
// ════════════════════════════════════════════════
export const getPendingRequests = () => axiosInstance.get('/getpendingrequests').then(r => r.data)
export const getPendingPatients = () => axiosInstance.get('/getpendingpatients').then(r => r.data)
export const getPendingOrphans = () => axiosInstance.get('/getpendingorphans').then(r => r.data)
export const getPendingSchools = () => axiosInstance.get('/getpendingschools').then(r => r.data)
export const getPendingUniversities = () => axiosInstance.get('/getpendinguniversities').then(r => r.data)

// ════════════════════════════════════════════════
//  جلب الطلبات المقبولة والمفتوحة
// ════════════════════════════════════════════════
export const getOpenAcceptedRequests = () => axiosInstance.get('/getopenacceptedrequests').then(r => r.data)
export const getOpenAcceptedPatients = () => axiosInstance.get('/getopenacceptedpatients').then(r => r.data)
export const getOpenAcceptedOrphans = () => axiosInstance.get('/getopenacceptedorphans').then(r => r.data)
export const getOpenAcceptedSchools = () => axiosInstance.get('/getopenacceptedschools').then(r => r.data)
export const getOpenAcceptedUniversities = () => axiosInstance.get('/getopenaccepteduniversities').then(r => r.data)

// ════════════════════════════════════════════════
//  إجراءات
// ════════════════════════════════════════════════
export const closeRequest = (id) =>
    axiosInstance.put(`/closeRequest/${id}`).then(r => r.data)

export const acceptRequest = (id, data = {}) => {
    const hasFile = data.personal_picture instanceof File
    if (hasFile) {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        Object.entries(data).forEach(([k, v]) => {
            if (v !== null && v !== undefined) formData.append(k, v)
        })
        return axiosInstance.post(`/acceptRequest/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data)
    }
    return axiosInstance.put(`/acceptRequest/${id}`, data).then(r => r.data)
}

// ════════════════════════════════════════════════
//  إنشاء الطلبات
// ════════════════════════════════════════════════
const toFormData = (data) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v)
    })
    return fd
}

export const storePatient = (data) => axiosInstance.post('/storepatient', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const storeOrphan = (data) => axiosInstance.post('/storeorphan', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const storeSchool = (data) => axiosInstance.post('/storeschool', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const storeUniversity = (data) => axiosInstance.post('/storeuniversity', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)