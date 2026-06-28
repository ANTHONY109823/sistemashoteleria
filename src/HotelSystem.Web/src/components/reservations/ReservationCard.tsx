import { Reservation, ReservationStatus } from '../../services/api';
import {
    FaUser, FaBed, FaCalendarCheck, FaCalendarAlt, FaUsers, FaChild,
    FaFileInvoiceDollar, FaSuitcase, FaSignOutAlt, FaCheckCircle,
    FaEdit, FaTimesCircle, FaEye, FaClock, FaArrowRight, FaUserAltSlash
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { Link } from 'react-router-dom';

interface ReservationCardProps {
    reservation: Reservation;
    onViewInvoice: () => void;
    onCancel: () => void;
    onEdit: () => void;
    onViewDetails: () => void;
    onNoShow?: () => void;
}

// --- Guest Avatar ---
const GuestAvatar = ({ name, status }: { name: string; status: ReservationStatus }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getBg = () => {
        switch (status) {
            case ReservationStatus.CheckedIn:   return 'bg-primary-500';
            case ReservationStatus.Confirmed:   return 'bg-blue-500';
            case ReservationStatus.Cancelled:   return 'bg-red-400';
            case ReservationStatus.CheckedOut:  return 'bg-slate-400';
            default:                            return 'bg-yellow-400';
        }
    };

    return (
        <div className={`w-14 h-14 rounded-xl ${getBg()} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
            <span className="text-lg font-extrabold tracking-tight">{initials}</span>
        </div>
    );
};

// --- Timeline Progress ---
const TimelineProgress = ({ checkInDate, checkOutDate }: { checkInDate: string; checkOutDate: string }) => {
    const { t } = useTranslation();
    const checkIn  = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today    = new Date();

    const totalDays  = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
    const daysElapsed = Math.max(0, Math.ceil((today.getTime() - checkIn.getTime()) / 86400000));
    const progress   = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    const isActive   = today >= checkIn && today <= checkOut;

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 relative">
                {/* Start */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
                        <FaCalendarCheck className="text-white text-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('reservations.checkIn')}</span>
                </div>

                {/* Progress Line */}
                <div className="absolute left-9 right-9 top-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    {isActive && (
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    )}
                </div>

                {/* End */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center shadow-sm">
                        <FaCalendarAlt className="text-white text-sm" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('reservations.checkOut')}</span>
                </div>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-slate-600">{checkIn.toLocaleDateString()}</span>
                <div className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 px-3 py-1 rounded-lg">
                    <FaClock className="text-primary-500 text-xs" />
                    <span className="text-xs font-extrabold text-primary-700">
                        {totalDays} {totalDays === 1 ? t('reservations.card.night') : t('reservations.card.nights')}
                    </span>
                </div>
                <span className="text-xs font-bold text-slate-600">{checkOut.toLocaleDateString()}</span>
            </div>
        </div>
    );
};

// --- Status Badge ---
const StatusBadge = ({ status }: { status: ReservationStatus }) => {
    const { t } = useTranslation();

    const config: Record<number, { colors: string; label: string; Icon: any; pulse: boolean }> = {
        [ReservationStatus.Pending]:    { colors: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: t('reservations.status.pending'),   Icon: FaClock,        pulse: true  },
        [ReservationStatus.Confirmed]:  { colors: 'bg-blue-100 text-blue-700 border-blue-300',       label: t('reservations.status.confirmed'),  Icon: FaCheckCircle,  pulse: false },
        [ReservationStatus.CheckedIn]:  { colors: 'bg-primary-100 text-primary-700 border-primary-300', label: t('reservations.status.checkedIn'), Icon: FaSuitcase,    pulse: true  },
        [ReservationStatus.CheckedOut]: { colors: 'bg-slate-100 text-slate-600 border-slate-300',    label: t('reservations.status.checkedOut'), Icon: FaSignOutAlt,  pulse: false },
        [ReservationStatus.Cancelled]:  { colors: 'bg-red-100 text-red-700 border-red-300',          label: t('reservations.status.cancelled'),  Icon: FaTimesCircle, pulse: false },
    };

    const { colors, label, Icon, pulse } = config[status] ?? { colors: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Unknown', Icon: FaCalendarAlt, pulse: false };

    return (
        <div className="relative inline-flex">
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${colors}`}>
                <Icon className="text-sm" /> {label}
            </span>
            {pulse && <span className={`absolute inset-0 rounded-lg ${colors} opacity-50 animate-ping`} />}
        </div>
    );
};

// --- Info Pill ---
const InfoPill = ({ icon: Icon, value, label }: { icon: any; value: number; label: string }) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
        <Icon className="text-primary-500 text-sm" />
        <span className="font-bold text-sm">{value}</span>
        <span className="text-xs font-medium">{label}</span>
    </div>
);

// --- Main Card ---
const ReservationCard = ({ reservation, onViewInvoice, onCancel, onEdit, onViewDetails, onNoShow }: ReservationCardProps) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    return (
        <div className="group bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden">
            {/* Top accent bar by status */}
            <div className={`h-1 w-full ${
                reservation.status === ReservationStatus.CheckedIn  ? 'bg-primary-500' :
                reservation.status === ReservationStatus.Confirmed  ? 'bg-blue-500'    :
                reservation.status === ReservationStatus.Cancelled  ? 'bg-red-400'     :
                reservation.status === ReservationStatus.CheckedOut ? 'bg-slate-400'   :
                'bg-yellow-400'
            }`} />

            <div className="p-5 space-y-4">
                {/* Header: Avatar + Guest Info + Status */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <GuestAvatar name={reservation.guestName || 'Guest'} status={reservation.status} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <FaBed className="text-primary-500 text-xs flex-shrink-0" />
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider truncate">
                                    {t('common.room')} {reservation.roomNumber}
                                </span>
                            </div>
                            <Link
                                to={`/guests?search=${reservation.guestName}`}
                                className="flex items-center gap-1 group/name"
                            >
                                <FaUser className="text-slate-400 text-xs flex-shrink-0" />
                                <h3 className="font-extrabold text-slate-800 text-base truncate group-hover/name:text-primary-600 transition-colors">
                                    {reservation.guestName}
                                </h3>
                                <FaArrowRight className="text-[10px] text-slate-300 group-hover/name:text-primary-400 transition-colors" />
                            </Link>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <StatusBadge status={reservation.status} />
                    </div>
                </div>

                {/* Timeline */}
                <TimelineProgress checkInDate={reservation.checkInDate} checkOutDate={reservation.checkOutDate} />

                {/* Guest details */}
                <div className="flex flex-wrap gap-2">
                    <InfoPill icon={FaUsers} value={reservation.adults} label={t('reservations.card.adults')} />
                    {reservation.children > 0 && (
                        <InfoPill icon={FaChild} value={reservation.children} label={t('reservations.card.children')} />
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Footer: Price + Actions */}
                <div className="flex justify-between items-center gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('reservations.card.total')}</p>
                        <p className="text-2xl font-extrabold text-primary-700">{formatCurrency(reservation.totalPrice)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Edit */}
                        {(reservation.status === ReservationStatus.Pending || reservation.status === ReservationStatus.Confirmed) && (
                            <button
                                onClick={onEdit}
                                className="p-2.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                title={t('reservations.card.editReservation')}
                            >
                                <FaEdit size={15} />
                            </button>
                        )}
                        {/* Details */}
                        <button
                            onClick={onViewDetails}
                            className="p-2.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-100"
                            title={t('reservations.viewDetails', 'Ver Detalles')}
                        >
                            <FaEye size={15} />
                        </button>
                        {/* Invoice */}
                        <button
                            onClick={onViewInvoice}
                            className="p-2.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-100"
                            title={t('reservations.viewInvoice')}
                        >
                            <FaFileInvoiceDollar size={15} />
                        </button>
                        {/* No-Show */}
                        {(reservation.status === ReservationStatus.Pending || reservation.status === ReservationStatus.Confirmed) && onNoShow && (
                            <button
                                onClick={onNoShow}
                                className="p-2.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100"
                                title="Mark as No-Show"
                            >
                                <FaUserAltSlash size={15} />
                            </button>
                        )}
                        {/* Cancel */}
                        {reservation.status !== ReservationStatus.Cancelled && reservation.status !== ReservationStatus.CheckedOut && (
                            <button
                                onClick={onCancel}
                                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold text-xs flex items-center gap-1.5 border border-red-200 hover:border-red-600"
                            >
                                <FaTimesCircle size={12} />
                                <span className="hidden sm:inline">{t('common.cancel')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;
