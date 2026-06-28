import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema, RoomFormData } from '../../utils/validations';
import { RoomType, roomService, Room, RoomStatus } from '../../services/api';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
import { useUpdateRoom } from '../../hooks/useRooms';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | null;
}

const EditRoomModal = ({ isOpen, onClose, room }: EditRoomModalProps) => {
    const { t } = useTranslation();
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const updateRoomMutation = useUpdateRoom();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
        reset,
        setValue,
    } = useForm<RoomFormData>({
        resolver: zodResolver(roomSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen && room) {
            loadRoomTypes();
            // Pre-fill form with room data
            setValue('number', room.number);
            setValue('roomTypeId', room.roomTypeId);
            setValue('floor', room.floor);
        }
    }, [isOpen, room, setValue]);

    const loadRoomTypes = async () => {
        try {
            const types = await roomService.getTypes();
            setRoomTypes(types);
        } catch (error) {
            console.error('Failed to load room types', error);
            showErrorToast(t('rooms.errors.loadTypes') || 'No se pudieron cargar los tipos de habitación');
        }
    };

    const handleStatusChange = async (newStatus: RoomStatus) => {
        if (!room) return;

        try {
            await roomService.updateStatus(room.id, newStatus);
            showSuccessToast(t('rooms.updateSuccess') || 'Estado actualizado exitosamente');
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        } catch (error) {
            console.error('Failed to update room status', error);
            showErrorToast('No se pudo actualizar el estado de la habitación');
        }
    };

    const onSubmit = async (data: RoomFormData) => {
        if (!room) return;

        try {
            await updateRoomMutation.mutateAsync({
                id: room.id,
                data: {
                    id: room.id,
                    ...data
                }
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to update room', error);
            // Error toast is handled by the hook
        }
    };

    const isFieldValid = (fieldName: keyof RoomFormData) => {
        return touchedFields[fieldName] && !errors[fieldName];
    };

    const isFieldInvalid = (fieldName: keyof RoomFormData) => {
        return touchedFields[fieldName] && errors[fieldName];
    };

    if (!isOpen || !room) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{t('rooms.editRoom')}</h2>
                    <button
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Room Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('rooms.fields.number')} *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register('number')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('number')
                                    ? 'border-red-300 bg-red-50'
                                    : isFieldValid('number')
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-300'
                                    }`}
                                placeholder={t('rooms.placeholders.number')}
                            />
                            {isFieldValid('number') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {isFieldInvalid('number') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {errors.number && (
                            <p className="text-xs text-red-600 mt-1">{errors.number.message}</p>
                        )}
                    </div>

                    {/* Room Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('rooms.fields.type')} *
                        </label>
                        <div className="relative">
                            <select
                                {...register('roomTypeId')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white ${isFieldInvalid('roomTypeId')
                                    ? 'border-red-300 bg-red-50'
                                    : isFieldValid('roomTypeId')
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-300'
                                    }`}
                            >
                                <option value="">{t('common.select') || 'Seleccione un tipo'}</option>
                                {roomTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} (Capacidad: {type.capacity})
                                    </option>
                                ))}
                            </select>
                            {isFieldValid('roomTypeId') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                            )}
                            {isFieldInvalid('roomTypeId') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                            )}
                        </div>
                        {errors.roomTypeId && (
                            <p className="text-xs text-red-600 mt-1">{errors.roomTypeId.message}</p>
                        )}
                    </div>

                    {/* Floor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('rooms.fields.floor')} *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                {...register('floor', { valueAsNumber: true })}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('floor')
                                    ? 'border-red-300 bg-red-50'
                                    : isFieldValid('floor')
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-300'
                                    }`}
                                placeholder="1"
                                min="0"
                            />
                            {isFieldValid('floor') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {isFieldInvalid('floor') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {errors.floor && (
                            <p className="text-xs text-red-600 mt-1">{errors.floor.message}</p>
                        )}
                    </div>

                    {/* Room Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('rooms.fields.status')} *
                        </label>
                        <div className="relative">
                            <select
                                value={room.status}
                                onChange={(e) => handleStatusChange(parseInt(e.target.value) as RoomStatus)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white"
                            >
                                <option value={RoomStatus.Available}>{t('rooms.status.available')}</option>
                                <option value={RoomStatus.Occupied}>{t('rooms.status.occupied')}</option>
                                <option value={RoomStatus.Cleaning}>{t('rooms.status.cleaning')}</option>
                                <option value={RoomStatus.Maintenance}>{t('rooms.status.maintenance')}</option>
                            </select>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            💡 Cambia el estado de la habitación manualmente. Útil para marcar como "Mantenimiento" cuando se requieren reparaciones.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={updateRoomMutation.isPending}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateRoomMutation.isPending ? t('common.saving') || 'Guardando...' : t('common.saveChanges') || 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default EditRoomModal;

