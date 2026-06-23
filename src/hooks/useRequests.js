import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getPendingRequests,
    getPendingPatients,
    getPendingOrphans,
    getPendingSchools,
    getPendingUniversities,
    storePatient,
    storeOrphan,
    storeSchool,
    storeUniversity,
    closeRequest,
    acceptRequest,
} from '../api/requests.api'

// ── Queries ─────────────────────────────────────────────────

export const usePendingRequests = () =>
    useQuery({
        queryKey: ['requests', 'pending'],
        queryFn: getPendingRequests,
    })

export const usePendingPatients = () =>
    useQuery({
        queryKey: ['requests', 'patients'],
        queryFn: getPendingPatients,
    })

export const usePendingOrphans = () =>
    useQuery({
        queryKey: ['requests', 'orphans'],
        queryFn: getPendingOrphans,
    })

export const usePendingSchools = () =>
    useQuery({
        queryKey: ['requests', 'schools'],
        queryFn: getPendingSchools,
    })

export const usePendingUniversities = () =>
    useQuery({
        queryKey: ['requests', 'universities'],
        queryFn: getPendingUniversities,
    })

// ── Mutations ────────────────────────────────────────────────

export const useStorePatient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: storePatient,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}

export const useStoreOrphan = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: storeOrphan,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}

export const useStoreSchool = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: storeSchool,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}

export const useStoreUniversity = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: storeUniversity,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}

export const useCloseRequest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: closeRequest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}

export const useAcceptRequest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: acceptRequest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
    })
}