import { useState, useMemo } from 'react';
import { Guest } from '../services/api';
import { FaPlus, FaEnvelope, FaPhone, FaIdCard, FaEdit, FaHistory, FaSearch, FaUserFriends, FaFileExcel, FaFilePdf, FaChevronLeft, FaChevronRight, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import CreateGuestModal from '../components/guests/CreateGuestModal';
import EditGuestModal from '../components/guests/EditGuestModal';
import GuestHistoryModal from '../components/guests/GuestHistoryModal';
import { useTranslation } from 'react-i18next';
import SkeletonTable from '../components/common/SkeletonTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useGuests, useToggleGuestActive } from '../hooks/useGuests';
import { exportGuestsToExcel } from '../utils/excelExports';
import { generateGuestListPDF } from '../utils/pdfExports';
import { useSettings } from '../hooks/useSettings';


const Guests = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();

    // React Query hooks
    const { data: guests = [], isLoading: loading, error } = useGuests();

    const toggleGuestActiveMutation = useToggleGuestActive();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // CRM Modal States
    const [editGuest, setEditGuest] = useState<Guest | null>(null);
    const [historyGuest, setHistoryGuest] = useState<Guest | null>(null);

    // Toggle Confirmation
    const [guestToToggle, setGuestToToggle] = useState<Guest | null>(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Memoized filtered guests for performance
    const filteredGuests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return guests.filter((guest: Guest) =>
            guest.firstName.toLowerCase().includes(term) ||
            guest.lastName.toLowerCase().includes(term) ||
            guest.email.toLowerCase().includes(term) ||
            guest.identificationNumber.toLowerCase().includes(term)
        );
    }, [guests, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    const paginatedGuests = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredGuests.slice(start, start + itemsPerPage);
    }, [filteredGuests, currentPage]);

    // Reset to page 1 when search changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleToggle = () => {
        if (!guestToToggle) return;
        toggleGuestActiveMutation.mutate(guestToToggle.id);
        setGuestToToggle(null);
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Avatar solid colors per index
    const getAvatarColor = (index: number) => {
        const colors = [
            'bg-primary-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-400',
            'bg-rose-500', 'bg-yellow-500', 'bg-teal-600', 'bg-indigo-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">{t('guests.title')}</h1>
                        <p className="text-slate-500 text-sm font-medium">{t('guests.subtitle')}</p>
                    </div>
                    <div className="flex gap-2.5 flex-wrap justify-end">
                        <button
                            onClick={() => exportGuestsToExcel(filteredGuests)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title="Export to Excel"
                        >
                            <FaFileExcel />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                        <button
                            onClick={() => settings && generateGuestListPDF(filteredGuests, settings)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-sm font-semibold text-sm transition-all"
                            title="Export to PDF"
                        >
                            <FaFilePdf />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg shadow-md font-bold text-sm transition-all"
                        >
                            <FaPlus />
                            <span>{t('guests.registerGuest')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder={t('guests.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
                    />
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={8} />
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
                    <p className="font-semibold">Error loading guests</p>
                    <p className="text-sm mt-1">{(error as any)?.message || 'Unknown error occurred'}</p>
                    {(error as any)?.response?.status === 401 && (
                        <p className="text-sm mt-2 font-mono bg-red-100 inline-block px-2 py-1 rounded">Status: 401 Unauthorized - Check your login session</p>
                    )}
                </div>
            ) : filteredGuests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-slate-200">
                    <EmptyState
                        icon={<FaUserFriends />}
                        title={searchTerm ? t('guests.noGuests') : t('guests.noGuestsStart')}
                        description={searchTerm ? t('guests.noGuestsFiltered') : t('guests.noGuestsDescription')}
                        action={!searchTerm ? {
                            label: t('guests.registerGuest'),
                            onClick: () => setIsCreateModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {paginatedGuests.map((guest: Guest, index: number) => (
                            <div
                                key={guest.id}
                                className="group bg-white rounded-xl shadow-md border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* Colored top bar */}
                                <div className={`h-1.5 w-full ${getAvatarColor(index)}`} />

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    {/* Avatar + Name */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl ${getAvatarColor(index)} flex items-center justify-center text-white font-extrabold text-base flex-shrink-0`}>
                                            {getInitials(guest.firstName, guest.lastName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-slate-800 text-base truncate group-hover:text-primary-600 transition-colors">
                                                {guest.firstName} {guest.lastName}
                                            </h3>
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${guest.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {guest.isActive ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaEnvelope className="text-primary-400 flex-shrink-0 text-xs" />
                                            <span className="truncate text-xs">{guest.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaPhone className="text-primary-400 flex-shrink-0 text-xs" />
                                            <span className="text-xs">{guest.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaIdCard className="text-primary-400 flex-shrink-0 text-xs" />
                                            <span className="font-mono font-semibold text-xs">{guest.identificationNumber}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                                        <button
                                            onClick={() => setEditGuest(guest)}
                                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold text-xs"
                                            title={t('common.edit') || 'Editar'}
                                        >
                                            <FaEdit />
                                            <span>{t('common.edit')}</span>
                                        </button>
                                        <button
                                            onClick={() => setHistoryGuest(guest)}
                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-slate-200 hover:border-primary-200"
                                            title={t('guests.actions.viewHistory') || 'Ver Historial'}
                                        >
                                            <FaHistory size={14} />
                                        </button>
                                        <button
                                            onClick={() => setGuestToToggle(guest)}
                                            className={`p-2 rounded-lg transition-colors border text-xs font-bold ${guest.isActive
                                                ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                                                : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                            }`}
                                            title={t('rooms.toggleActive') || 'Activar/Desactivar'}
                                        >
                                            {guest.isActive ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            <span className="text-sm font-bold text-slate-600 px-3 py-1.5 bg-white rounded-lg border border-slate-200">
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
                </>
            )
            }

            {/* Modals */}
            <CreateGuestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            <EditGuestModal
                isOpen={!!editGuest}
                onClose={() => setEditGuest(null)}
                onSuccess={() => { }} // React Query handles refetching automatically
                guest={editGuest}
            />

            <GuestHistoryModal
                isOpen={!!historyGuest}
                onClose={() => setHistoryGuest(null)}
                guest={historyGuest}
            />

            <ConfirmDialog
                isOpen={!!guestToToggle}
                onClose={() => setGuestToToggle(null)}
                onConfirm={handleToggle}
                title={t('guests.actions.toggleActive')}
                message={guestToToggle?.isActive
                    ? t('guests.confirmDeactivate')
                    : t('guests.confirmActivate')}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type={guestToToggle?.isActive ? "warning" : "info"}
            />
        </div>
    );
};

export default Guests;
