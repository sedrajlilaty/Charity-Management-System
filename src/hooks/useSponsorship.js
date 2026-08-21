import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sponsorshipApi } from '../api/sponsorshipApi'
import toast from 'react-hot-toast' // ⚠️ بدّليها إذا عندك مكتبة توست مختلفة

export function useSponsoredOrphans() {
    return useQuery({
        queryKey: ['sponsorships', 'sponsored'],
        queryFn: () => sponsorshipApi.getSponsoredOrphans(),
    })
}

export function useCancelSponsorship() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orphanId) => sponsorshipApi.cancelSponsorship(orphanId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            toast.success('تم إلغاء الكفالة بنجاح')
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'صار خطأ بإلغاء الكفالة'
            toast.error(msg)
        },
    })
}