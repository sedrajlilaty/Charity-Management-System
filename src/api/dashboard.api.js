import axiosInstance from './axiosInstance'

export const getKpis = () =>
    axiosInstance.get('/dashboard/kpis').then(r => r.data)

export const getMonthlyDonations = () =>
    axiosInstance.get('/dashboard/monthly-donations').then(r => r.data)

export const getCasesByStatus = () =>
    axiosInstance.get('/dashboard/cases').then(r => r.data)

export const getRecentDonations = () =>
    axiosInstance.get('/dashboard/recent-donations').then(r => r.data)

export const getTopCampaigns = () =>
    axiosInstance.get('/dashboard/top-campaigns').then(r => r.data)

export const getCasesByGovernorate = () =>
    axiosInstance.get('/dashboard/cases-by-governorate').then(r => r.data)