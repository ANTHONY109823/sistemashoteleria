import { useState, useEffect, useMemo } from 'react';
import { roomService } from '../services/api';
import { RoomType } from '../types';
import { FaBed, FaEdit, FaPowerOff, FaUsers, FaCheck, FaFileExcel, FaFilePdf, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import RoomTypeModal from '../components/roomtypes/RoomTypeModal';
import { generateRoomTypesPDF } from '../utils/pdfExports';
import { exportRoomTypesToExcel } from '../utils/excelExports';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import { useCurrency } from '../hooks/useCurrency';


const RoomTypes = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();
    const [types, setTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<RoomType | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await roomService.getTypes();
            setTypes(data);
        } catch (error) {
            console.error('Failed to fetch room types', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: RoomType) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (type: RoomType) => {
        if (!confirm(t('common.confirm') + '?')) return;
        try {
            await roomService.toggleTypeStatus(type.id);
            await fetchTypes();
        } catch (error) {
            console.error('Failed to toggle status', error);
            alert('Failed to update status');
        }
    };

    const openCreateModal = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    // Pagination Logic
    const totalPages = Math.ceil(types.length / itemsPerPage);
    const paginatedTypes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return types.slice(start, start + itemsPerPage);
    }, [types, currentPage]);

    // Enhanced gradient colors for different room types
    // Now using custom colors from database


    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">{t('roomTypes.title')}</h1>
                        <p className="text-slate-500 text-sm font-medium">{t('roomTypes.subtitle')}</p>
                    </div>
                    <div className="flex gap-2.5 flex-wrap justify-end">
                        <button
                            onClick={() => exportRoomTypesToExcel(types)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title={t('common.exportToExcel') || "Export to Excel"}
                        >
                            <FaFileExcel />
                            <span className="hidden sm:inline">{t('common.excel') || "Excel"}</span>
                        </button>
                        <button
                            onClick={() => settings && generateRoomTypesPDF(types, settings)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title={t('common.exportToPDF') || "Export to PDF"}
                        >
                            <FaFilePdf />
                            <span className="hidden sm:inline">{t('common.pdf') || "PDF"}</span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg shadow-md font-bold text-sm transition-all"
                        >
                            <FaPlus />
                            <span>{t('roomTypes.addRoomType')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <RoomTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTypes}
                initialData={editingType}
            />

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-500"></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedTypes.map((type, index) => (
                            <div
                                key={type.id}
                                className="group bg-white rounded-xl shadow-md border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* Abstract top line */}
                                <div className="h-1.5 w-full" style={{ backgroundColor: type.color }}></div>
                                
                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 flex-shrink-0">
                                                <FaBed className="text-2xl" style={{ color: type.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
                                                    {type.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            {type.isActive !== false ? (
                                                <div className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                                                    <FaCheck size={10} /> {t('common.active')}
                                                </div>
                                            ) : (
                                                <div className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                                                    {t('common.inactive')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 flex-grow">
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {type.description || t('roomTypes.noDescription')}
                                        </p>
                                    </div>

                                    {/* Price & Capacity */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            <FaUsers className="text-slate-400" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('roomTypes.maxCapacity')}</span>
                                                <span className="text-base font-extrabold text-slate-700 leading-tight">{type.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Precio Base</span>
                                            <span className="text-xl font-extrabold" style={{ color: type.color }}>{formatCurrency(type.basePrice)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="flex-1 text-white font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all duration-300 bg-primary-500 hover:bg-primary-600 shadow-sm text-sm"
                                            title={t('common.edit') || "Edit"}
                                        >
                                            <FaEdit />
                                            <span>{t('common.edit')}</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(type)}
                                            className={`px-3 py-2.5 rounded-lg shadow-sm transition-all duration-300 text-white flex items-center border border-transparent hover:opacity-90 ${type.isActive !== false ? 'bg-red-500' : 'bg-green-600'}`}
                                            title={type.isActive !== false ? t('users.deactivate') : t('users.activate')}
                                        >
                                            <FaPowerOff />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {types.length === 0 && (
                            <div className="col-span-full p-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="bg-slate-50 p-5 rounded-full border border-slate-100">
                                        <FaBed className="text-4xl text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">{t('roomTypes.noRoomTypes')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    <span className="text-sm font-bold text-slate-600 px-4 py-1.5 bg-white rounded-lg border border-slate-200">
                        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomTypes;
