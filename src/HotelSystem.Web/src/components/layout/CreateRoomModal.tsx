import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema, RoomFormData } from '../../utils/validations';
import { RoomType, roomService } from '../../services/api';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useCreateRoom } from '../../hooks/useRooms';
import { useTranslation } from 'react-i18next';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateRoomModal = ({ isOpen, onClose, onSuccess }: CreateRoomModalProps) => {
    const { t } = useTranslation();
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const createRoomMutation = useCreateRoom();

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
        reset,
        setValue,
    } = useForm<RoomFormData>({
        resolver: zodResolver(roomSchema),
        mode: 'onChange',
        defaultValues: {
            number: '',
            roomTypeId: '',
            floor: 1,
        }
    });

    useEffect(() => {
        if (isOpen) {
            loadRoomTypes();
        }
    }, [isOpen]);

    const loadRoomTypes = async () => {
        try {
            const types = await roomService.getTypes();
            setRoomTypes(types);
            if (types.length > 0) {
                setValue('roomTypeId', types[0].id);
            }
        } catch (error) {
            console.error('Failed to load room types', error);
            showErrorToast('No se pudieron cargar los tipos de habitación');
        }
    };

    const onSubmit = async (data: RoomFormData) => {
        try {
            await createRoomMutation.mutateAsync(data);
            showSuccessToast(`Habitación ${data.number} creada exitosamente`);
            onSuccess();
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create room', error);
            showErrorToast('No se pudo crear la habitación');
        }
    };

    const isFieldValid = (fieldName: keyof RoomFormData) => {
        return touchedFields[fieldName] && !errors[fieldName];
    };

    const isFieldInvalid = (fieldName: keyof RoomFormData) => {
        return touchedFields[fieldName] && errors[fieldName];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{t('rooms.addRoom')}</h2>
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
                                <option value="">{t('common.select')}</option>
                                {roomTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} ({t('rooms.fields.capacity')}: {type.capacity})
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
                            disabled={createRoomMutation.isPending}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createRoomMutation.isPending ? t('common.saving') : t('rooms.addRoom')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
