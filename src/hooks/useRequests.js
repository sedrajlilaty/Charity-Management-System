// src/hooks/useRequests.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fileUrl,
    getPendingRequests, getPendingPatients, getPendingOrphans,
    getPendingSchools, getPendingUniversities,
    getOpenAcceptedRequests, getOpenAcceptedPatients,
    getOpenAcceptedOrphans, getOpenAcceptedSchools, getOpenAcceptedUniversities,
    closeRequest, acceptRequest,
    storePatient, storeOrphan, storeSchool, storeUniversity,
} from '../api/requests.api'

// ── مساعد: يحول request من الباك اند لشكل موحد للفرونت ──────
export const normalizeRequest = (req) => {
    const b = req.beneficiary ?? {}
    const type = req.request_type

    const specific = {}
    if (type === 'patient' && req.patient) {
        specific.medical_report = fileUrl(req.patient.medical_report)
        specific.national_id_document = fileUrl(req.patient.national_id_document)
    }
    if (type === 'orphan' && req.orphan) {
        specific.family_booklet = fileUrl(req.orphan.family_booklet)
        specific.father_death_certificate = fileUrl(req.orphan.father_death_certificate)
    }
    if (type === 'school' && req.schoolStudent) {
        specific.academic_grade = req.schoolStudent.academic_grade
        specific.school_name = req.schoolStudent.school_name
        specific.family_book_photo = fileUrl(req.schoolStudent.family_book_photo)
    }
    if (type === 'university' && req.universityStudent) {
        specific.academic_year = req.universityStudent.academic_year
        specific.support_type = req.universityStudent.support_type
        specific.university_id_photo = fileUrl(req.universityStudent.university_id_photo)
    }

    const categoryMap = {
        patient: 'patient',
        orphan: 'orphan',
        school: 'school_student',
        university: 'university_student',
    }

    return {
        id: req.id,
        category: categoryMap[type] ?? type,
        request_type: type,
        status: req.status,
        status_request: req.status_request,
        title: req.title,
        description: req.description,
        required_amount: req.required_amount,
        personal_picture: fileUrl(req.personal_picture),
        created_at: req.created_at,
        full_name: b.full_name,
        phone: b.phone,
        email: b.email,
        national_id: b.national_id,
        governorate: b.governorate?.name ?? b.governorate,
        region: b.region?.name ?? b.region,
        governorate_id: b.governorate_id,
        region_id: b.region_id,
        ...specific,
        donated_amount: req.donated_amount,
        remaining_amount: req.remaining_amount,
        progress_percentage: req.progress_percentage,
    }
}

// ── مفاتيح الـ cache ──────────────────────────────────────
export const requestKeys = {
    allPending: ['requests', 'pending', 'all'],
    pendingPatients: ['requests', 'pending', 'patients'],
    pendingOrphans: ['requests', 'pending', 'orphans'],
    pendingSchools: ['requests', 'pending', 'schools'],
    pendingUniversities: ['requests', 'pending', 'universities'],
    openAccepted: ['requests', 'open-accepted', 'all'],
    openAcceptedPatients: ['requests', 'open-accepted', 'patients'],
    openAcceptedOrphans: ['requests', 'open-accepted', 'orphans'],
    openAcceptedSchools: ['requests', 'open-accepted', 'schools'],
    openAcceptedUnis: ['requests', 'open-accepted', 'universities'],
}

// ── مساعد normalize ───────────────────────────────────────
const normalizeList = (data) =>
    (data?.data ?? []).map(normalizeRequest)

// الـ endpoints اللي بترجع array مباشرة (بدون wrapper)
const normalizeRaw = (data) => {
    const arr = Array.isArray(data) ? data : (data?.data ?? [])
    return arr.map(normalizeRequest)
}

// ── Queries: Pending ─────────────────────────────────────
export const usePendingRequests = () =>
    useQuery({ queryKey: requestKeys.allPending, queryFn: getPendingRequests, select: normalizeList })

export const usePendingPatients = () =>
    useQuery({ queryKey: requestKeys.pendingPatients, queryFn: getPendingPatients, select: normalizeList })

export const usePendingOrphans = () =>
    useQuery({ queryKey: requestKeys.pendingOrphans, queryFn: getPendingOrphans, select: normalizeList })

export const usePendingSchools = () =>
    useQuery({ queryKey: requestKeys.pendingSchools, queryFn: getPendingSchools, select: normalizeList })

export const usePendingUniversities = () =>
    useQuery({ queryKey: requestKeys.pendingUniversities, queryFn: getPendingUniversities, select: normalizeList })

// ── Queries: Open Accepted ───────────────────────────────
export const useOpenAcceptedRequests = () =>
    useQuery({ queryKey: requestKeys.openAccepted, queryFn: getOpenAcceptedRequests, select: normalizeList })

export const useOpenAcceptedPatients = () =>
    useQuery({ queryKey: requestKeys.openAcceptedPatients, queryFn: getOpenAcceptedPatients, select: normalizeRaw })

export const useOpenAcceptedOrphans = () =>
    useQuery({ queryKey: requestKeys.openAcceptedOrphans, queryFn: getOpenAcceptedOrphans, select: normalizeRaw })

export const useOpenAcceptedSchools = () =>
    useQuery({ queryKey: requestKeys.openAcceptedSchools, queryFn: getOpenAcceptedSchools, select: normalizeRaw })

export const useOpenAcceptedUniversities = () =>
    useQuery({ queryKey: requestKeys.openAcceptedUnis, queryFn: getOpenAcceptedUniversities, select: normalizeRaw })

// ── Mutations ─────────────────────────────────────────────
const invalidateAll = (qc) =>
    Object.values(requestKeys).forEach(k => qc.invalidateQueries({ queryKey: k }))

export const useCloseRequest = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: closeRequest,
        onSuccess: () => invalidateAll(qc),
    })
}

export const useAcceptRequest = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }) => acceptRequest(id, data),
        onSuccess: () => invalidateAll(qc),
    })
}

export const useStorePatient = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: storePatient,
        onSuccess: () => invalidateAll(qc),
    })
}

export const useStoreOrphan = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: storeOrphan,
        onSuccess: () => invalidateAll(qc),
    })
}

export const useStoreSchool = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: storeSchool,
        onSuccess: () => invalidateAll(qc),
    })
}

export const useStoreUniversity = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: storeUniversity,
        onSuccess: () => invalidateAll(qc),
    })
}