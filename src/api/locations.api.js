import axiosInstance from './axiosInstance'

export const getGovernorates = () =>
    axiosInstance.get('/governorates').then(r => r.data)

export const getRegions = (governorateId) =>
    axiosInstance.get(`/governorates/${governorateId}/regions`).then(r => r.data)