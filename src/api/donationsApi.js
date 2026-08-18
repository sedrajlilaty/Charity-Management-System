// api/donationsApi.js
import axiosInstance from './axiosInstance'

export const donationsApi = {
    // api/donationsApi.js
    getAll: ({ donationableType, sortBy = 'created_at', sortDir = 'desc' } = {}) =>
        axiosInstance
            .get('/donations/all', {
                params: {
                    donationable_type: donationableType && donationableType !== 'all' ? donationableType : undefined,
                    sort_by: sortBy,
                    sort_dir: sortDir,
                    // per_page: 10, // 👈 جيبي كل شي دفعة وحدة
                },
            })
            .then((res) => res.data),
}