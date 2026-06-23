import axiosInstance from './axiosInstance'

// ── إنشاء طلبات ─────────────────────────────────
export const storePatient = (data) =>
    axiosInstance.post('/storepatient', data).then(r => r.data)

export const storeOrphan = (data) =>
    axiosInstance.post('/storeorphan', data).then(r => r.data)

export const storeSchool = (data) =>
    axiosInstance.post('/storeschool', data).then(r => r.data)

export const storeUniversity = (data) =>
    axiosInstance.post('/storeuniversity', data).then(r => r.data)

// ── جلب الطلبات المعلقة ──────────────────────────
export const getPendingRequests = () =>
    axiosInstance.get('/getpendingrequests').then(r => r.data)

export const getPendingPatients = () =>
    axiosInstance.get('/getpendingpatients').then(r => r.data)

export const getPendingOrphans = () =>
    axiosInstance.get('/getpendingorphans').then(r => r.data)

export const getPendingSchools = () =>
    axiosInstance.get('/getpendingschools').then(r => r.data)

export const getPendingUniversities = () =>
    axiosInstance.get('/getpendinguniversities').then(r => r.data)

// ── إجراءات على الطلبات ──────────────────────────
export const closeRequest = (id) =>
    axiosInstance.put(`/closeRequest/${id}`).then(r => r.data)

export const acceptRequest = (id) =>
    axiosInstance.put(`/acceptRequest/${id}`).then(r => r.data)