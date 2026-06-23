import { useQuery } from '@tanstack/react-query'
import { getGovernorates, getRegions } from '../api/locations.api'

export const useGovernorates = () =>
    useQuery({
        queryKey: ['locations', 'governorates'],
        queryFn: getGovernorates,
    })

export const useRegions = (governorateId) =>
    useQuery({
        queryKey: ['locations', 'regions', governorateId],
        queryFn: () => getRegions(governorateId),
        enabled: !!governorateId,
    })