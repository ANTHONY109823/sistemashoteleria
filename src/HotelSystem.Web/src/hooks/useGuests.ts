import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestService } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// Query key factory for better organization
export const guestKeys = {
    all: ['guests'] as const,
    detail: (id: string) => ['guests', id] as const,
};

// Fetch all guests
export const useGuests = () => {
    return useQuery({
        queryKey: guestKeys.all,
        queryFn: guestService.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create guest mutation
export const useCreateGuest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => guestService.create(data),
        onSuccess: () => {
            // Invalidate and refetch guests list
            queryClient.invalidateQueries({ queryKey: guestKeys.all });
            showSuccessToast(`Guest created successfully`);
        },
        onError: (error: any) => {
            console.error('Failed to create guest:', error);
            showErrorToast('Failed to create guest');
        },
    });
};

// Delete guest mutation
export const useDeleteGuest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => guestService.delete(id),
        onSuccess: () => {
            // Invalidate guests list
            queryClient.invalidateQueries({ queryKey: guestKeys.all });
            showSuccessToast('Guest deleted successfully');
        },
        onError: (error) => {
            console.error('Failed to delete guest:', error);
            showErrorToast('Failed to delete guest');
        },
    });
};

// Toggle guest active status
export const useToggleGuestActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => guestService.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: guestKeys.all });
            showSuccessToast('Guest status updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update guest status:', error);
            showErrorToast('Failed to update guest status');
        },
    });
};

// Update guest mutation (if needed in future)
export const useUpdateGuest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            guestService.update(id, data),
        onSuccess: (_: any, variables: any) => {
            // Invalidate both the list and the specific guest
            queryClient.invalidateQueries({ queryKey: guestKeys.all });
            queryClient.invalidateQueries({ queryKey: guestKeys.detail(variables.id) });
            showSuccessToast('Guest updated successfully');
        },
        onError: (error) => {
            console.error('Failed to update guest:', error);
            showErrorToast('Failed to update guest');
        },
    });
};
