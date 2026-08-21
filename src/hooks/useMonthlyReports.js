import { useMutation } from '@tanstack/react-query'
import { reportsApi } from '../api/reportsApi'

export function useMonthlyBeneficiariesReport() {
    return useMutation({
        mutationFn: ({ year, month }) => reportsApi.getMonthlyBeneficiaries(year, month),
    })
}

export function useMonthlyDonationsReport() {
    return useMutation({
        mutationFn: ({ year, month }) => reportsApi.getMonthlyDonations(year, month),
    })
}