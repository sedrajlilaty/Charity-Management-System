// hooks/useDonations.js
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { donationsApi } from '../api/donationsApi'

export function useDonations({ donationableType = 'all', sortBy = 'created_at', sortDir = 'desc' } = {}) {
    return useQuery({
        queryKey: ['donations', donationableType, sortBy, sortDir],
        queryFn: () => donationsApi.getAll({ donationableType, sortBy, sortDir }),
        placeholderData: keepPreviousData,
        select: (res) => {
            // ✅ قراءة القائمة مباشرة من res.donations
            const list = Array.isArray(res?.donations) ? res.donations : []

            return {
                donations: list,
                totalDonatedGlobal: Number(res?.total_donated) || 0,
                donationsCount: res?.donations_count ?? list.length,
            }
        },
    })
}