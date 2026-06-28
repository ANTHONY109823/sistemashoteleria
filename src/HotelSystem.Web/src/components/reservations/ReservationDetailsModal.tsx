import { Reservation, ReservationStatus } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { FaTimes, FaUser, FaBed, FaCalendarAlt, FaUsers, FaChild, FaCalendarCheck, FaStickyNote } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface ReservationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

const ReservationDetailsModal = ({ isOpen, onClose, reservation }: ReservationDetailsModalProps) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    if (!isOpen || !reservation) return null;

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Pending: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case ReservationStatus.Confirmed: return 'bg-blue-100 text-blue-700 border-blue-200';
            case ReservationStatus.Cancelled: return 'bg-red-100 text-red-700';
            case ReservationStatus.CheckedIn: return 'bg-green-100 text-green-700 border-green-200';
            case ReservationStatus.CheckedOut: return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels: Record<number, string> = {
            [ReservationStatus.Pending]: t('reservations.status.pending'),
            [ReservationStatus.Confirmed]: t('reservations.status.confirmed'),
            [ReservationStatus.CheckedIn]: t('reservations.status.checkedIn'),
            [ReservationStatus.CheckedOut]: t('reservations.status.checkedOut'),
            [ReservationStatus.Cancelled]: t('reservations.status.cancelled'),
            [ReservationStatus.NoShow]: t('reservations.status.noShow')
        };
        return labels[status] || 'Unknown';
    };

    const nights = Math.ceil((new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                            <FaCalendarCheck className="text-primary-500" />
                            {t('reservations.detailsTitle', 'Detalles de la Reservación')}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">ID: {reservation.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all border border-slate-200"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* Status Section */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                        <div>
                            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block mb-1">
                                {t('reservations.status')}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${getStatusColor(reservation.status)}`}>
                                {getStatusLabel(reservation.status)}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider block mb-1">
                                {t('reservations.totalPrice')}
                            </span>
                            <span className="text-3xl font-extrabold text-primary-600">
                                {formatCurrency(reservation.totalPrice)}
                            </span>
                        </div>
                    </div>

                    {/* Guest & Room Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Guest Info */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <FaUser className="text-primary-500" />
                                {t('reservations.guest')}
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Nombre</p>
                                    <Link
                                        className="text-lg font-bold text-primary-600 hover:text-primary-700 hover:underline"
                                        title="Ver perfil del huésped"
                                    >
                                        {reservation.guestName}
                                    </Link>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{t('reservations.fields.adults')}</p>
                                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                                            <FaUsers className="text-slate-400" /> {reservation.adults}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{t('reservations.fields.children')}</p>
                                        <p className="font-semibold text-slate-700 flex items-center gap-2">
                                            <FaChild className="text-slate-400" /> {reservation.children}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Info */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <FaBed className="text-primary-500" />
                                {t('reservations.room')}
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">{t('common.room')}</p>
                                    <p className="text-lg font-semibold text-slate-700">
                                        {reservation.roomNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Noches</p>
                                    <p className="font-semibold text-slate-700">
                                        {nights} {nights === 1 ? 'Noche' : 'Noches'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates Timeline */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <FaCalendarAlt className="text-primary-500" />
                            Fechas
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('reservations.checkIn')}</p>
                                <p className="text-base font-bold text-slate-700">
                                    {new Date(reservation.checkInDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="h-0.5 flex-1 mx-4 bg-slate-200 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white bg-slate-400 shadow-sm"></div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white bg-slate-400 shadow-sm"></div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">{t('reservations.checkOut')}</p>
                                <p className="text-base font-bold text-slate-700">
                                    {new Date(reservation.checkOutDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                            <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                                <FaStickyNote className="text-yellow-500" />
                                {t('reservations.notes', 'Notas')}
                            </h3>
                            <p className="text-slate-700 italic">
                                "{reservation.notes}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:shadow-md transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailsModal;
