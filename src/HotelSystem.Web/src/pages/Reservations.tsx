import { useEffect, useState } from 'react';
import { reservationService, Reservation, ReservationStatus } from '../services/api';
import {
    FaPlus, FaCalendarAlt, FaSearch, FaFileInvoiceDollar, FaCalendarTimes,
    FaFileExcel, FaFilePdf, FaTh, FaList, FaUserAltSlash
} from 'react-icons/fa';
import ReservationModal from '../components/reservations/ReservationModal';
import InvoiceModal from '../components/reservations/InvoiceModal';
import ReservationDetailsModal from '../components/reservations/ReservationDetailsModal';
import ReservationCard from '../components/reservations/ReservationCard';
import { useTranslation } from 'react-i18next';
import { generateReservationReportPDF } from '../utils/pdfExports';
import { exportReservationsToExcel } from '../utils/excelExports';
import { useSettings } from '../hooks/useSettings';
import SkeletonTable from '../components/common/SkeletonTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useCurrency } from '../hooks/useCurrency';

const Reservations = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [invoiceReservation, setInvoiceReservation] = useState<Reservation | null>(null);
    const [viewDetailsReservation, setViewDetailsReservation] = useState<Reservation | null>(null);
    const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);
    const [noShowReservation, setNoShowReservation] = useState<Reservation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => { fetchReservations(); }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await reservationService.getAll();
            setReservations(data);
        } catch (error) {
            console.error('Failed to fetch reservations', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReservations = reservations.filter(r => {
        const matchesSearch =
            r.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReservation(null);
    };

    const handleCancelReservation = async () => {
        if (!cancelReservation) return;
        try {
            await reservationService.cancel(cancelReservation.id);
            showSuccessToast(t('reservations.cancelledReservation', { room: cancelReservation.roomNumber }));
            fetchReservations();
        } catch (error) {
            showErrorToast(t('reservations.cancelError'));
        }
    };

    const handleNoShowReservation = async () => {
        if (!noShowReservation) return;
        try {
            await reservationService.markNoShow(noShowReservation.id);
            showSuccessToast('Reservation marked as No-Show');
            fetchReservations();
        } catch (error: any) {
            showErrorToast(error?.response?.data?.message || 'Failed to mark as No-Show');
        } finally {
            setNoShowReservation(null);
        }
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Pending:    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case ReservationStatus.Confirmed:  return 'bg-blue-100 text-blue-700 border-blue-200';
            case ReservationStatus.Cancelled:  return 'bg-red-100 text-red-700 border-red-200';
            case ReservationStatus.CheckedIn:  return 'bg-primary-100 text-primary-700 border-primary-200';
            case ReservationStatus.CheckedOut: return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels: Record<number, string> = {
            [ReservationStatus.Pending]:    t('reservations.status.pending'),
            [ReservationStatus.Confirmed]:  t('reservations.status.confirmed'),
            [ReservationStatus.CheckedIn]:  t('reservations.status.checkedIn'),
            [ReservationStatus.CheckedOut]: t('reservations.status.checkedOut'),
            [ReservationStatus.Cancelled]:  t('reservations.status.cancelled'),
            [ReservationStatus.NoShow]:     t('reservations.status.noShow'),
        };
        return labels[status] || 'Unknown';
    };

    /* ---- Status Filter Tabs ---- */
    const StatusTab = ({ status, label }: { status: ReservationStatus | 'all'; label: string }) => (
        <button
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                statusFilter === status
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* ---- Page Header ---- */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1">
                            {t('reservations.title')}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">{t('reservations.subtitle')}</p>
                    </div>

                    <div className="flex gap-2.5 flex-wrap justify-end">
                        {/* View Toggle */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-all font-semibold text-sm ${
                                    viewMode === 'cards'
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                                title="Vista de tarjetas"
                            >
                                <FaTh size={13} />
                                <span className="hidden sm:inline">{t('reservations.viewToggle.cards')}</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-all font-semibold text-sm ${
                                    viewMode === 'table'
                                        ? 'bg-primary-500 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                                title="Vista de tabla"
                            >
                                <FaList size={13} />
                                <span className="hidden sm:inline">{t('reservations.viewToggle.table')}</span>
                            </button>
                        </div>

                        {/* Excel */}
                        <button
                            onClick={() => exportReservationsToExcel(filteredReservations)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm font-semibold text-sm"
                            title="Export to Excel"
                        >
                            <FaFileExcel />
                            <span className="hidden xl:inline">Excel</span>
                        </button>

                        {/* PDF */}
                        <button
                            onClick={() => settings && generateReservationReportPDF(filteredReservations, settings)}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm font-semibold text-sm"
                            title="Export to PDF"
                        >
                            <FaFilePdf />
                            <span className="hidden xl:inline">PDF</span>
                        </button>

                        {/* New Reservation */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-md font-bold text-sm"
                        >
                            <FaPlus />
                            <span className="hidden md:inline">{t('reservations.newReservation')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ---- Filters ---- */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 md:p-5 space-y-4">
                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder={t('reservations.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap gap-2">
                    <StatusTab status="all"                          label={t('reservations.status.all')}       />
                    <StatusTab status={ReservationStatus.Pending}    label={t('reservations.status.pending')}   />
                    <StatusTab status={ReservationStatus.Confirmed}  label={t('reservations.status.confirmed')} />
                    <StatusTab status={ReservationStatus.CheckedIn}  label={t('reservations.status.checkedIn')} />
                    <StatusTab status={ReservationStatus.CheckedOut} label={t('reservations.status.checkedOut')}/>
                    <StatusTab status={ReservationStatus.Cancelled}  label={t('reservations.status.cancelled')} />
                </div>
            </div>

            {/* ---- Content ---- */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <SkeletonTable rows={8} />
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-slate-200">
                    <EmptyState
                        icon={<FaCalendarTimes />}
                        title={searchTerm || statusFilter !== 'all' ? t('reservations.noReservations') : 'No hay reservas registradas'}
                        description={
                            searchTerm || statusFilter !== 'all'
                                ? 'No se encontraron reservas que coincidan con los filtros seleccionados.'
                                : 'Comienza creando tu primera reserva para gestionar el alojamiento de huéspedes.'
                        }
                        action={!searchTerm && statusFilter === 'all' ? {
                            label: t('reservations.newReservation'),
                            onClick: () => setIsModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : viewMode === 'cards' ? (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredReservations.map((reservation, index) => (
                        <div key={reservation.id} className="animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                            <ReservationCard
                                reservation={reservation}
                                onViewInvoice={() => setInvoiceReservation(reservation)}
                                onCancel={() => setCancelReservation(reservation)}
                                onEdit={() => handleEditReservation(reservation)}
                                onViewDetails={() => setViewDetailsReservation(reservation)}
                                onNoShow={() => setNoShowReservation(reservation)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b-2 border-primary-200">
                                    {[t('reservations.guest'), t('reservations.room'), t('reservations.checkIn'), t('reservations.checkOut'), t('reservations.status'), t('reservations.total'), t('common.actions')]
                                        .map((header, i) => (
                                            <th
                                                key={i}
                                                className={`px-5 py-3.5 text-primary-700 font-bold uppercase tracking-wider text-xs whitespace-nowrap ${i === 5 ? 'text-right' : i === 6 ? 'text-center' : ''}`}
                                            >
                                                {header}
                                            </th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReservations.map(reservation => (
                                    <tr
                                        key={reservation.id}
                                        className="hover:bg-primary-50/50 transition-colors duration-150"
                                    >
                                        <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">{reservation.guestName}</td>
                                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap font-medium">{t('common.room')} {reservation.roomNumber}</td>
                                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-primary-400 text-xs" />
                                                <span className="font-medium text-sm">{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-slate-400 text-xs" />
                                                <span className="font-medium text-sm">{new Date(reservation.checkOutDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(reservation.status)}`}>
                                                {getStatusLabel(reservation.status)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-extrabold text-primary-700 whitespace-nowrap">
                                            {formatCurrency(reservation.totalPrice)}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex justify-center gap-1.5">
                                                <button
                                                    onClick={() => setInvoiceReservation(reservation)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title={t('reservations.viewInvoice')}
                                                >
                                                    <FaFileInvoiceDollar size={14} />
                                                </button>
                                                {reservation.status !== ReservationStatus.Cancelled && reservation.status !== ReservationStatus.CheckedOut && (
                                                    <button
                                                        onClick={() => setCancelReservation(reservation)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <FaCalendarTimes size={14} />
                                                    </button>
                                                )}
                                                {(reservation.status === ReservationStatus.Pending || reservation.status === ReservationStatus.Confirmed) && (
                                                    <button
                                                        onClick={() => setNoShowReservation(reservation)}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Mark as No-Show"
                                                    >
                                                        <FaUserAltSlash size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ---- Modals ---- */}
            <ReservationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchReservations}
                initialData={editingReservation}
            />
            <InvoiceModal
                isOpen={!!invoiceReservation}
                onClose={() => setInvoiceReservation(null)}
                reservation={invoiceReservation}
            />
            <ReservationDetailsModal
                isOpen={!!viewDetailsReservation}
                onClose={() => setViewDetailsReservation(null)}
                reservation={viewDetailsReservation}
            />
            <ConfirmDialog
                isOpen={!!cancelReservation}
                onClose={() => setCancelReservation(null)}
                onConfirm={handleCancelReservation}
                title="Cancelar Reservación"
                message={cancelReservation ? `¿Estás seguro de cancelar la reservación de ${cancelReservation.guestName} para la habitación ${cancelReservation.roomNumber}? Esta acción no se puede deshacer.` : ''}
                confirmText="Cancelar Reservación"
                cancelText="Volver"
                type="warning"
            />
            <ConfirmDialog
                isOpen={!!noShowReservation}
                onClose={() => setNoShowReservation(null)}
                onConfirm={handleNoShowReservation}
                title="Mark as No-Show"
                message={noShowReservation ? `Are you sure you want to mark ${noShowReservation.guestName}'s reservation as No-Show? This will release room ${noShowReservation.roomNumber}.` : ''}
                confirmText="Confirm No-Show"
                cancelText={t('common.cancel')}
                type="warning"
            />
        </div>
    );
};

export default Reservations;
