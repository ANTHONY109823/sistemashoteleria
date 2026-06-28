import { useState, useEffect } from 'react';
import { CreateRoomTypeRequest, roomService } from '../../services/api';
import { FaTimes } from 'react-icons/fa';
import { RoomType } from '../../types';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';

interface RoomTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: RoomType | null;
}

const RoomTypeModal = ({ isOpen, onClose, onSuccess, initialData }: RoomTypeModalProps) => {
    const { t } = useTranslation();
    const { currencySymbol } = useCurrency();
    const [data, setData] = useState<CreateRoomTypeRequest>({
        name: '',
        description: '',
        basePrice: 0,
        capacity: 1,
        color: '#2563eb'
    });

    // Predefined premium colors
    const colors = [
        { hex: '#9333ea', name: 'Purple' },
        { hex: '#2563eb', name: 'Blue' },
        { hex: '#06b6d4', name: 'Cyan' },
        { hex: '#10b981', name: 'Emerald' },
        { hex: '#f97316', name: 'Orange' },
        { hex: '#ec4899', name: 'Pink' },
        { hex: '#ef4444', name: 'Red' },
        { hex: '#4f46e5', name: 'Indigo' },
    ];
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setData({
                name: initialData.name,
                description: initialData.description,
                basePrice: initialData.basePrice,
                capacity: initialData.capacity,
                color: initialData.color || '#2563eb'
            });
        } else {
            setData({ name: '', description: '', basePrice: 0, capacity: 1, color: '#2563eb' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                await roomService.updateType(initialData.id, data);
            } else {
                await roomService.createType(data);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(JSON.stringify(err.response?.data) || err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {initialData ? t('roomTypes.editType') : t('roomTypes.newType')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('roomTypes.fields.name')}</label>
                        <input
                            type="text"
                            required
                            placeholder={t('roomTypes.placeholders.name')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('roomTypes.fields.description')}</label>
                        <textarea
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            rows={3}
                            value={data.description}
                            onChange={e => setData({ ...data, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('roomTypes.fields.basePrice')} ({currencySymbol})</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                value={data.basePrice}
                                onChange={e => setData({ ...data, basePrice: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('roomTypes.fields.capacity')}</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                value={data.capacity}
                                onChange={e => setData({ ...data, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('roomTypes.fields.color')}</label>
                        <div className="grid grid-cols-4 gap-3">
                            {colors.map((colorOption) => (
                                <button
                                    key={colorOption.hex}
                                    type="button"
                                    onClick={() => setData({ ...data, color: colorOption.hex })}
                                    className={`group relative h-12 rounded-xl transition-all duration-300 ${data.color === colorOption.hex
                                        ? 'ring-4 ring-offset-2 scale-110 shadow-lg'
                                        : 'hover:scale-105 shadow-sm hover:shadow-md'
                                        }`}
                                    style={{
                                        backgroundColor: colorOption.hex
                                    }}
                                    title={colorOption.name}
                                >
                                    {data.color === colorOption.hex && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{t('roomTypes.colorHelp')}</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            {loading ? t('common.saving') : (initialData ? t('common.saveChanges') : t('common.create'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomTypeModal;
