import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, Settings } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// Query keys
export const settingsKeys = {
    all: ['settings'] as const,
};

// Fetch settings (singleton)
export const useSettings = () => {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: settingsService.get,
        staleTime: 60 * 60 * 1000, // 1 hour (settings rarely change)
    });
};

// Update settings mutation
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: Settings) => settingsService.update(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.all });
            showSuccessToast('Settings updated successfully');
        },
        onError: (error: any) => {
            console.error('Failed to update settings:', error);
            showErrorToast('Failed to update settings');
        },
    });
};
