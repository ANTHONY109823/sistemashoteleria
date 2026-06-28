import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService, RoomStatus, UpdateRoomRequest } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// Query keys
export const roomKeys = {
    all: ['rooms'] as const,
    types: ['roomTypes'] as const,
    detail: (id: string) => ['rooms', id] as const,
};

// Fetch all rooms
export const useRooms = () => {
    return useQuery({
        queryKey: roomKeys.all,
        queryFn: roomService.getAll,
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
};

// Fetch room types (static data, longer cache)
export const useRoomTypes = () => {
    return useQuery({
        queryKey: roomKeys.types,
        queryFn: roomService.getTypes,
        staleTime: 30 * 60 * 1000, // 30 minutes (static data)
    });
};

// Create room mutation
export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => roomService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            showSuccessToast('Room created successfully');
        },
        onError: (error: any) => {
            console.error('Failed to create room:', error);
            showErrorToast('Failed to create room');
        },
    });
};

// Delete room mutation
export const useDeleteRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => roomService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            showSuccessToast('Room deleted successfully');
        },
        onError: (error: any) => {
            console.error('Failed to delete room:', error);
            showErrorToast('Failed to delete room');
        },
    });
};

// Update room mutation
export const useUpdateRoom = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateRoomRequest }) => roomService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            showSuccessToast('Room updated successfully');
        },
        onError: (error: any) => {
            console.error('Failed to update room:', error);
            showErrorToast('Failed to update room');
        },
    });
};

// Toggle room active status mutation
export const useToggleRoomActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => roomService.toggleActive(id),
        onSuccess: (_data, _id) => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            // showSuccessToast('Room status toggled successfully'); // Optional: toast on success
        },
        onError: (error: any) => {
            console.error('Failed to toggle room status:', error);
            showErrorToast('Failed to toggle room status');
        },
    });
};

// Update room status mutation (for housekeeping)
export const useUpdateRoomStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: RoomStatus; successMessage?: string }) =>
            roomService.updateStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: roomKeys.all });
            showSuccessToast(variables.successMessage || 'Room status updated successfully');
        },
        onError: (error: any) => {
            console.error('Failed to update room status:', error);
            showErrorToast('Failed to update room status');
        },
    });
};
