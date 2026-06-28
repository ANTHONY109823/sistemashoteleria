import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestSchema, GuestFormData } from '../../utils/validations';
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useCreateGuest } from '../../hooks/useGuests';
import { useTranslation } from 'react-i18next';

interface CreateGuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateGuestModal = ({ isOpen, onClose, onSuccess }: CreateGuestModalProps) => {
    const { t } = useTranslation();
    const createGuestMutation = useCreateGuest();

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
        reset
    } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
        mode: 'onChange', // Real-time validation
    });

    const onSubmit = async (data: GuestFormData) => {
        try {
            await createGuestMutation.mutateAsync(data);
            // Toast is handled by the hook
            onSuccess();
            reset();
            onClose();
        } catch (error) {
            // Error handling is managed by the hook
            console.error('Failed to create guest', error);
        }
    };

    // Helper to check if field is valid
    const isFieldValid = (fieldName: keyof GuestFormData) => {
        return touchedFields[fieldName] && !errors[fieldName];
    };

    const isFieldInvalid = (fieldName: keyof GuestFormData) => {
        return touchedFields[fieldName] && errors[fieldName];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{t('guests.registerGuest')}</h2>
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
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('guests.fields.firstName')} *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('firstName')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('firstName')
                                            ? 'border-red-300 bg-red-50'
                                            : isFieldValid('firstName')
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-slate-300'
                                        }`}
                                    placeholder="Juan"
                                />
                                {isFieldValid('firstName') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('firstName') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.firstName && (
                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('guests.fields.lastName')} *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('lastName')}
                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('lastName')
                                            ? 'border-red-300 bg-red-50'
                                            : isFieldValid('lastName')
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-slate-300'
                                        }`}
                                    placeholder="Pérez"
                                />
                                {isFieldValid('lastName') && (
                                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                                {isFieldInvalid('lastName') && (
                                    <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                )}
                            </div>
                            {errors.lastName && (
                                <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('guests.fields.email')} *
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('email')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('email')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                    }`}
                                placeholder="juan.perez@example.com"
                            />
                            {isFieldValid('email') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {isFieldInvalid('email') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('guests.fields.phone')} *
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                {...register('phone')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('phone')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('phone')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                    }`}
                                placeholder="+1 234 567 8900"
                            />
                            {isFieldValid('phone') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {isFieldInvalid('phone') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Identification Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('guests.fields.idNumber')} *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register('identificationNumber')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isFieldInvalid('identificationNumber')
                                        ? 'border-red-300 bg-red-50'
                                        : isFieldValid('identificationNumber')
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-slate-300'
                                    }`}
                                placeholder="DNI o Pasaporte"
                            />
                            {isFieldValid('identificationNumber') && (
                                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {isFieldInvalid('identificationNumber') && (
                                <FaTimesCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        {errors.identificationNumber && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.identificationNumber.message}
                            </p>
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
                            disabled={createGuestMutation.isPending}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createGuestMutation.isPending ? t('common.saving') : t('guests.registerGuest')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGuestModal;
