import { useState, useMemo } from 'react';
import { Room, RoomStatus, RoomType } from '../types';
import { FaPlus, FaBed, FaEdit, FaSearch, FaDoorOpen, FaFileExcel, FaFilePdf, FaChevronLeft, FaChevronRight, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import EditRoomModal from '../components/layout/EditRoomModal';
import CreateRoomModal from '../components/layout/CreateRoomModal';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useRooms, useRoomTypes, useToggleRoomActive } from '../hooks/useRooms';
import { exportRoomsToExcel } from '../utils/excelExports';
import { generateRoomListPDF } from '../utils/pdfExports';
import { useSettings } from '../hooks/useSettings';
import { useCurrency } from '../hooks/useCurrency';


const Rooms = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();

    // React Query hooks - replaces manual state management!
    const { data: rooms = [], isLoading: loading } = useRooms();
    const { data: roomTypes = [] } = useRoomTypes();
    const toggleRoomActiveMutation = useToggleRoomActive();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<Room | null>(null);

    // Toggle Confirmation State
    const [toggleRoom, setToggleRoom] = useState<Room | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Memoized filtering for performance
    const filteredRooms = useMemo(() => {
        return rooms.filter((room: Room) => {
            const matchesSearch = room.number.toString().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
            const matchesType = typeFilter === 'all' || room.roomTypeId === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [rooms, searchTerm, statusFilter, typeFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const paginatedRooms = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRooms.slice(start, start + itemsPerPage);
    }, [filteredRooms, currentPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    const handleToggleActive = async () => {
        if (!toggleRoom) return;
        try {
            await toggleRoomActiveMutation.mutateAsync(toggleRoom.id);
            setToggleRoom(null);
        } catch (error) {
            console.error('Failed to toggle room status', error);
        }
    };


    const getStatusLabel = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Available: return t('rooms.status.available');
            case RoomStatus.Occupied: return t('rooms.status.occupied');
            case RoomStatus.Cleaning: return t('rooms.status.cleaning');
            case RoomStatus.Maintenance: return t('rooms.status.maintenance');
            default: return 'Unknown';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">{t('rooms.title')}</h1>
                        <p className="text-slate-500 text-sm font-medium">{t('rooms.subtitle')}</p>
                    </div>
                    <div className="flex gap-2.5 flex-wrap justify-end">
                        <button
                            onClick={() => exportRoomsToExcel(filteredRooms)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title={t('common.exportToExcel')}
                        >
                            <FaFileExcel />
                            <span className="hidden sm:inline">{t('common.excel')}</span>
                        </button>
                        <button
                            onClick={() => settings && generateRoomListPDF(filteredRooms, settings)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title={t('common.exportToPDF')}
                        >
                            <FaFilePdf />
                            <span className="hidden sm:inline">{t('common.pdf')}</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg shadow-md font-bold text-sm transition-all"
                        >
                            <FaPlus />
                            <span>{t('rooms.addRoom')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('rooms.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStatusFilter(value === 'all' ? 'all' : parseInt(value) as RoomStatus);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
                    >
                        <option value="all">{t('rooms.allStatuses')}</option>
                        <option value={RoomStatus.Available}>{t('rooms.status.available')}</option>
                        <option value={RoomStatus.Occupied}>{t('rooms.status.occupied')}</option>
                        <option value={RoomStatus.Cleaning}>{t('rooms.status.cleaning')}</option>
                        <option value={RoomStatus.Maintenance}>{t('rooms.status.maintenance')}</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
                    >
                        <option value="all">{t('rooms.allTypes')}</option>
                        {roomTypes.map((type: RoomType) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-500"></div>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                    <EmptyState
                        icon={<FaDoorOpen />}
                        title={searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? t('rooms.noRooms') : t('rooms.noRoomsRegistered')}
                        description={searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ?
                            t('rooms.noRoomsFiltered') :
                            t('rooms.noRoomsDescription')
                        }
                        action={!searchTerm && typeFilter === 'all' && statusFilter === 'all' ? {
                            label: t('rooms.addRoom'),
                            onClick: () => setIsModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedRooms.map((room: Room, index: number) => {
                            // Get the room type to access its color
                            const roomType = roomTypes.find((rt: RoomType) => rt.id === room.roomTypeId);
                            const roomColor = roomType?.color || '#2563eb'; // Default blue if not found

                            return (
                                <div
                                    key={room.id}
                                    className="group bg-white rounded-xl shadow-md border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    {/* Abstract top line */}
                                    <div className="h-1.5 w-full" style={{ backgroundColor: roomColor }}></div>
                                    
                                    <div className="p-5 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 flex-shrink-0"
                                                >
                                                    <FaBed className="text-2xl" style={{ color: roomColor }} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
                                                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">{t('common.room')}</span>
                                                        {room.number}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span 
                                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                        room.status === RoomStatus.Available ? 'text-green-700 bg-green-50 border-green-200' : 
                                                        room.status === RoomStatus.Occupied ? 'text-red-700 bg-red-50 border-red-200' : 
                                                        room.status === RoomStatus.Cleaning ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 
                                                        'text-slate-700 bg-slate-50 border-slate-200'
                                                    }`}
                                                >
                                                    {getStatusLabel(room.status)}
                                                </span>
                                                {!room.isActive && (
                                                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-red-500 border border-red-100 bg-red-50">
                                                        {t('rooms.inactive', 'Inactive')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                    {/* Content */}
                                        <div className="mb-4">
                                            <p className="text-slate-500 text-sm font-medium">{room.roomTypeName || t('rooms.standardRoom')}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t('common.floor')}</span>
                                                    <span className="text-base font-extrabold text-slate-700 text-center">{room.floor}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{t('common.night')}</span>
                                                <span className="text-xl font-extrabold text-slate-800">{formatCurrency(room.pricePerNight)}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                                            <button
                                                onClick={() => setEditRoom(room)}
                                                className="flex-1 text-white font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all duration-300 bg-primary-500 hover:bg-primary-600 shadow-sm text-sm"
                                                title={t('common.edit') || "Editar"}
                                            >
                                                <FaEdit />
                                                <span>{t('common.edit')}</span>
                                            </button>
                                            <button
                                                onClick={() => setToggleRoom(room)}
                                                className={`px-3 py-2.5 rounded-lg shadow-sm transition-all duration-300 text-white flex items-center border border-transparent hover:opacity-90 ${room.isActive
                                                    ? 'bg-red-500'
                                                    : 'bg-green-600'
                                                    }`}
                                                title={t('rooms.toggleActive') || "Activar/Desactivar"}
                                            >
                                                {room.isActive ? <FaToggleOff size={18} /> : <FaToggleOn size={18} />}
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            );
                        })}
                    </div>

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
                                Página {currentPage} de {totalPages}
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
                </>
            )}

            {/* Modals */}
            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            <EditRoomModal
                isOpen={!!editRoom}
                onClose={() => setEditRoom(null)}
                room={editRoom}
            />

            <ConfirmDialog
                isOpen={!!toggleRoom}
                onClose={() => setToggleRoom(null)}
                onConfirm={handleToggleActive}
                title={toggleRoom?.isActive ? t('rooms.inactive') : t('rooms.active')}
                message={toggleRoom ? (toggleRoom.isActive ? t('rooms.confirmDeactivate') : t('rooms.confirmActivate')) : ''}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type={toggleRoom?.isActive ? "danger" : "info"}
            />
        </div>
    );
};

export default Rooms;
