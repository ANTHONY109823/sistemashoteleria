import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// Query keys
export const reservationKeys = {
    all: ['reservations'] as const,
    detail: (id: string) => ['reservations', id] as const,
};

// Fetch all reservations
export const useReservations = () => {
    return useQuery({
        queryKey: reservationKeys.all,
        queryFn: reservationService.getAll,
        staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });
};

// Create reservation mutation
export const useCreateReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => reservationService.create(data),
        onSuccess: () => {
            // Invalidate both reservations and rooms (availability changed)
            queryClient.invalidateQueries({ queryKey: reservationKeys.all });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            showSuccessToast('Reservation created successfully');
        },
        onError: (error: any) => {
            console.error('Failed to create reservation:', error);
            showErrorToast('Failed to create reservation');
        },
    });
};

// Cancel reservation mutation
export const useCancelReservation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reservationService.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reservationKeys.all });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            showSuccessToast('Reservation cancelled successfully');
        },
        onError: (error: any) => {
            console.error('Failed to cancel reservation:', error);
            showErrorToast('Failed to cancel reservation');
        },
    });
};
