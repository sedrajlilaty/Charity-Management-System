// src/hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query'
import {
    getKpis,
    getMonthlyDonations,
    getCasesByStatus,
    getRecentDonations,
    getTopCampaigns,
    getCasesByGovernorate,
} from '../api/dashboard.api'

const STALE = 5 * 60 * 1000

// بيرجع: { total_users, total_campaigns, total_donated_usd, pending_requests, accepted_requests, rejected_requests }
export const useKpis = () =>
    useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: getKpis,
        staleTime: STALE,
        select: (data) => data.data,
    })

// بيرجع array: [{ month, amount_usd }]
export const useMonthlyDonations = () =>
    useQuery({
        queryKey: ['dashboard', 'monthly-donations'],
        queryFn: getMonthlyDonations,
        staleTime: STALE,
        select: (data) => data.donations ?? [],
    })

// بيرجع array جاهز للـ PieChart: [{ name, value, color }]
export const useCasesByStatus = () =>
    useQuery({
        queryKey: ['dashboard', 'cases'],
        queryFn: getCasesByStatus,
        staleTime: STALE,
        select: (data) => {
            const s = data.cases_by_status ?? {}
            return [
                { name: 'معلق', value: s.pending ?? 0, color: '#eab308' },
                { name: 'مقبول', value: s.accepted ?? 0, color: '#16a34a' },
                { name: 'مرفوض', value: s.rejected ?? 0, color: '#ef4444' },
            ]
        },
    })

// بيرجع array: [{ donation_id, amount_usd, donor, target, created_at }]
export const useRecentDonations = () =>
    useQuery({
        queryKey: ['dashboard', 'recent-donations'],
        queryFn: getRecentDonations,
        staleTime: STALE,
        select: (data) => data.recent_donations ?? [],
    })

// بيرجع array: [{ id, title, status, amount_needed, amount_collected, progress }]
export const useTopCampaigns = () =>
    useQuery({
        queryKey: ['dashboard', 'top-campaigns'],
        queryFn: getTopCampaigns,
        staleTime: STALE,
        select: (data) => data.top_campaigns ?? [],
    })

export const useCasesByGovernorate = () =>
    useQuery({
        queryKey: ['dashboard', 'cases-by-governorate'],
        queryFn: getCasesByGovernorate,
        staleTime: STALE,
        select: (data) => data.cases_by_governorate ?? [],
    })