import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    campaignsApi,
    normalizeCampaign,
    normalizePaginatedCampaigns,
} from '../api/campaignsApi'; // ⚠️ عدّلي المسار حسب بنية المشروع

export const CAMPAIGNS_KEY = ['campaigns'];

/* ============================================================
   Queries
   ============================================================ */

// List أساسي (نفس نمط useBeneficiariesQuery)
export const useCampaignsQuery = (params = {}) => {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, 'list', params],
        queryFn: () => campaignsApi.getCampaigns(params),
        select: (data) => normalizePaginatedCampaigns(data.campaigns),
        keepPreviousData: true,
    });
};

// فلترة متقدمة (تفعّل فقط لما المستخدم يطبّق فلتر فعلي)
export const useCampaignsFilterQuery = (params = {}, options = {}) => {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, 'filter', params],
        queryFn: () => campaignsApi.filterCampaigns(params),
        select: (data) => normalizePaginatedCampaigns(data.campaigns),
        keepPreviousData: true,
        enabled: options.enabled ?? true,
    });
};

// تفاصيل حملة وحدة (لازم تستخدميها بالـ edit modal، مش بيانات الـ list)
export const useCampaignQuery = (id) => {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, 'detail', id],
        queryFn: () => campaignsApi.getCampaignDetails(id),
        select: (data) => normalizeCampaign(data.campaign),
        enabled: !!id,
    });
};

// أنواع الحملات (educational, medical, humanitarian, environmental) — ثابتة
export const useCampaignTypesQuery = () => {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, 'types'],
        queryFn: () => campaignsApi.getCampaignTypes(),
        select: (data) => data.types,
        staleTime: Infinity,
    });
};

// أنواع المشاركة (donation_only, volunteer_only, donation_and_volunteer) — ثابتة
export const useParticipationTypesQuery = () => {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, 'participation-types'],
        queryFn: () => campaignsApi.getParticipationTypes(),
        select: (data) => data.participation_types,
        staleTime: Infinity,
    });
};

/* ============================================================
   Mutations
   ============================================================ */

export const useCreateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => campaignsApi.createCampaign(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
        },
    });
};

export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData }) => campaignsApi.updateCampaign({ id, formData }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
            queryClient.invalidateQueries({
                queryKey: [...CAMPAIGNS_KEY, 'detail', variables.id],
            });
        },
    });
};

export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => campaignsApi.deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
        },
    });
};

export const useCloseCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => campaignsApi.closeCampaign(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY });
            queryClient.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, 'detail', id] });
        },
    });
};