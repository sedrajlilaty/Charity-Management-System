import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { disburseApi } from '../api/disburseApi'

// ── الحملات المعلقة الصرف ──────────────────────────
export const usePendingCampaigns = () =>
    useQuery({
        queryKey: ['disburse', 'campaigns', 'pending'],
        queryFn: disburseApi.getPendingCampaigns,
    })

// ── الطلبات (الحالات) المعلقة الصرف ────────────────
export const usePendingRequests = () =>
    useQuery({
        queryKey: ['disburse', 'requests', 'pending'],
        queryFn: disburseApi.getPendingRequests,
    })

// ── تقرير الشهر الحالي (إجمالي المصروف + السجل) ────
export const useMonthlyDisbursementReport = (year, month) =>
    useQuery({
        queryKey: ['disburse', 'report', year, month],
        queryFn: () => disburseApi.getCompleteDisbursementReport(year, month),
    })

// ── صرف حملة واحدة ──────────────────────────────────
export const useDisburseCampaign = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (campaignId) => disburseApi.disburseCampaign(campaignId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['disburse'] })
            qc.invalidateQueries({ queryKey: ['campaigns'] })
        },
    })
}

// ── صرف طلب (حالة) واحد ──────────────────────────────
export const useDisburseRequest = () => {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (requestId) => disburseApi.disburseRequest(requestId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['disburse'] })
            qc.invalidateQueries({ queryKey: ['beneficiaries'] })
        },
    })
}