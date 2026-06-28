import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSchema, ReservationFormData } from '../../utils/validations';
import { Guest, Room, guestService, roomService, reservationService, Reservation } from '../../services/api';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Reservation | null;
}

const ReservationModal = ({ isOpen, onClose, onSuccess, initialData }: ReservationModalProps) => {
    const { t } = useTranslation();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const { data: settings } = useSettings();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, touchedFields },
        reset,
        setValue,
    } = useForm<ReservationFormData>({
        resolver: zodResolver(reservationSchema),
        mode: 'onChange',
        defaultValues: {
            guestId: '',
            roomId: '',
            checkInDate: '',
            checkOutDate: '',
            adults: 1,
            children: 0,
            notes: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && initialData) {
            // Populate form with initial data
            setValue('guestId', initialData.guestId);
            setValue('roomId', initialData.roomId);
            setValue('checkInDate', new Date(initialData.checkInDate).toISOString().split('T')[0]);
            setValue('checkOutDate', new Date(initialData.checkOutDate).toISOString().split('T')[0]);
            setValue('adults', initialData.adults);
            setValue('children', initialData.children);
            setValue('notes', initialData.notes || '');
        } else if (isOpen && !initialData) {
            reset({
                guestId: '',
                roomId: '',
                checkInDate: '',
                checkOutDate: '',
                adults: 1,
                children: 0,
                notes: '',
            });
            if (guests.length > 0) setValue('guestId', guests[0].id);
            if (rooms.length > 0) setValue('roomId', rooms[0].id);
        }
    }, [isOpen, initialData, setValue, reset, guests, rooms]);

    const loadData = async () => {
        try {
            const [guestsData, roomsData] = await Promise.all([
                guestService.getAll(),
                roomService.getAll()
            ]);
            setGuests(guestsData);
            setRooms(roomsData);

            if (!initialData) {
                if (guestsData.length > 0) setValue('guestId', guestsData[0].id);
                if (roomsData.length > 0) setValue('roomId', roomsData[0].id);
            }
        } catch (error) {
            console.error('Failed to load data', error);
            showErrorToast('No se pudieron cargar los datos');
        }
    };

    const onSubmit = async (data: ReservationFormData) => {
        try {
            if (initialData) {
                await reservationService.update(initialData.id, data);
                showSuccessToast('Reservación actualizada correctamente');
            } else {
                await reservationService.create(data);
                const guest = guests.find(g => g.id === data.guestId);
                const room = rooms.find(r => r.id === data.roomId);
                showSuccessToast(`Reservación creada para ${guest?.firstName || 'huésped'} en habitación ${room?.number || ''}`);
            }
            onSuccess();
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to save reservation', error);
            showErrorToast(initialData ? 'No se pudo actualizar la reservación' : 'No se pudo crear la reservación');
        }
    };

    const isFieldValid = (fieldName: keyof ReservationFormData) => {
        return touchedFields[fieldName] && !errors[fieldName];
    };

    const isFieldInvalid = (fieldName: keyof ReservationFormData) => {
        return touchedFields[fieldName] && errors[fieldName];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl scale-100 transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {initialData ? 'Editar Reservación' : 'Nueva Reservación'}
                    </h2>
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
                    {/* Guest & Room */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Huésped *
                            </label>
                            <div className="relative">
                                <select
                                    {...register('guestId')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white ${isFieldInvalid('guestId')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('guestId')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                    disabled={false}
                                >
                                    <option value="">Seleccione</option>
                                    {guests.map(guest => (
                                        <option key={guest.id} value={guest.id}>
                                            {guest.firstName} {guest.lastName}
                                        </option>
                                    ))}
                                </select>
                                {isFieldValid('guestId') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                                )}
                                {isFieldInvalid('guestId') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                )}
                            </div>
                            {errors.guestId && (
                                <p className="text-xs text-red-600 mt-1">{errors.guestId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Habitación *
                            </label>
                            <div className="relative">
                                <select
                                    {...register('roomId')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all bg-white ${isFieldInvalid('roomId')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('roomId')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                >
                                    <option value="">Seleccione</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.number} - {room.roomTypeName} ({settings?.currencySymbol || '$'}{room.pricePerNight})
                                        </option>
                                    ))}
                                </select>
                                {isFieldValid('roomId') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                                )}
                                {isFieldInvalid('roomId') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                                )}
                            </div>
                            {errors.roomId && (
                                <p className="text-xs text-red-600 mt-1">{errors.roomId.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Fecha de Entrada *
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    {...register('checkInDate')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('checkInDate')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('checkInDate')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                />
                                {isFieldValid('checkInDate') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('checkInDate') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.checkInDate && (
                                <p className="text-xs text-red-600 mt-1">{errors.checkInDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Fecha de Salida *
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    {...register('checkOutDate')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('checkOutDate')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('checkOutDate')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                />
                                {isFieldValid('checkOutDate') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('checkOutDate') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.checkOutDate && (
                                <p className="text-xs text-red-600 mt-1">{errors.checkOutDate.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Adults & Children */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('reservations.fields.adults')} *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('adults', { valueAsNumber: true })}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('adults')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('adults')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                    min="1"
                                />
                                {isFieldValid('adults') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('adults') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.adults && (
                                <p className="text-xs text-red-600 mt-1">{errors.adults.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('reservations.fields.children')}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('children', { valueAsNumber: true })}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('children')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('children')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                        }`}
                                    min="0"
                                />
                                {isFieldValid('children') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('children') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.children && (
                                <p className="text-xs text-red-600 mt-1">{errors.children.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notas
                        </label>
                        <textarea
                            {...register('notes')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                            rows={3}
                            placeholder="Indicaciones especiales o preferencias del huésped..."
                        />
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
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Reservación')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
