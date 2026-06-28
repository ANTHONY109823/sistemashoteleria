import { useState, useEffect } from 'react';
import { Guest, UpdateGuestRequest } from '../../services/api';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useUpdateGuest } from '../../hooks/useGuests';
import { useTranslation } from 'react-i18next';

interface EditGuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    guest: Guest | null;
}

const EditGuestModal = ({ isOpen, onClose, onSuccess, guest }: EditGuestModalProps) => {
    const { t } = useTranslation();
    const updateGuestMutation = useUpdateGuest();

    const [formData, setFormData] = useState<UpdateGuestRequest>({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        identificationNumber: ''
    });

    useEffect(() => {
        if (guest) {
            setFormData({
                id: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phone: guest.phone,
                identificationNumber: guest.identificationNumber
            });
        }
    }, [guest]);

    if (!isOpen || !guest) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateGuestMutation.mutateAsync({ id: guest.id, data: formData });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update guest', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{t('guests.actions.edit')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guests.fields.firstName')}</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guests.fields.lastName')}</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('guests.fields.email')}</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('guests.fields.phone')}</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('guests.fields.idNumber')}</label>
                        <input
                            type="text"
                            required
                            value={formData.identificationNumber}
                            onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={updateGuestMutation.isPending}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        >
                            {updateGuestMutation.isPending ? t('common.saving') : <><FaSave /> {t('common.saveChanges')}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGuestModal;
