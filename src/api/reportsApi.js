import axiosInstance from '../api/axiosInstance'

export const reportsApi = {
    getMonthlyBeneficiaries: async (year, month) => {
        const { data } = await axiosInstance.get(`/reports/beneficiaries/${year}/${month}`)
        return data
    },
    getMonthlyDonations: async (year, month) => {
        const { data } = await axiosInstance.get(`/reports/donations/${year}/${month}`)
        return data
    },
}