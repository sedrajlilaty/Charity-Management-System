import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sponsorshipApi } from '../api/sponsorshipApi'
// ⚠️ إذا عندك مكتبة توست مختلفة (مثلاً react-hot-toast أو مكون خاص فيكي) بدّليها هون
import toast from 'react-hot-toast'

export function useSponsorships(filters = {}) {
    return useQuery({
        queryKey: ['sponsorships', filters],
        queryFn: () => sponsorshipApi.getOrphansWithSponsors(filters),
    })
}

export function useCancelSponsorship() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (sponsorshipId) => sponsorshipApi.cancelSponsorship(sponsorshipId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sponsorships'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // متل ما بتعملي بباقي الأماكن
            toast.success('تم إلغاء الكفالة بنجاح')
        },
        onError: () => {
            toast.error('صار خطأ بإلغاء الكفالة، حاولي كمان مرة')
        },
    })
}