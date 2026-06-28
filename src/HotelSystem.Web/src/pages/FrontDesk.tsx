import { useEffect, useState } from 'react';
import { reservationService, frontDeskService, roomService } from '../services/api';
import { Reservation, ReservationStatus, Room, RoomStatus } from '../types';
import {
    FaCheck, FaSignOutAlt, FaCalendarAlt, FaUser, FaBed,
    FaFileInvoiceDollar, FaFilePdf, FaTools, FaBroom,
    FaCheckCircle, FaClock, FaHourglassHalf, FaUserCircle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import { generateInvoicePDF, generateDailyReportPDF } from '../utils/pdfExports';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import WalkInModal from '../components/frontdesk/WalkInModal';
import CheckOutModal from '../components/frontdesk/CheckOutModal';

// ===================== Room Card =====================
const RoomCard = ({ room }: { room: Room }) => {
    const { t } = useTranslation();

    const config = {
        [RoomStatus.Available]:   { bg: 'bg-primary-500',  label: t('rooms.status.available'),    icon: <FaCheckCircle className="text-xl" /> },
        [RoomStatus.Occupied]:    { bg: 'bg-red-500',       label: t('rooms.status.occupied'),     icon: <FaBed className="text-xl" /> },
        [RoomStatus.Cleaning]:    { bg: 'bg-yellow-400',    label: t('rooms.status.cleaning'),     icon: <FaBroom className="text-xl" /> },
        [RoomStatus.Maintenance]: { bg: 'bg-slate-500',     label: t('rooms.status.maintenance'),  icon: <FaTools className="text-xl" /> },
    }[room.status] ?? { bg: 'bg-slate-400', label: 'Unknown', icon: <FaBed className="text-xl" /> };

    return (
        <div
            className={`group ${config.bg} rounded-xl p-3.5 shadow-md cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-white min-h-[90px]`}
            title={`${room.roomTypeName || ''} — ${t('common.floor')} ${room.floor}`}
        >
            <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                {config.icon}
            </div>
            <span className="font-extrabold text-xl tracking-tight">{room.number}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{config.label}</span>
        </div>
    );
};

// ===================== Arrival Card =====================
const ArrivalCard = ({
    reservation,
    onCheckIn,
    isProcessing,
}: {
    reservation: Reservation;
    onCheckIn: () => void;
    isProcessing: boolean;
}) => {
    const { t } = useTranslation();
    const initials = reservation.guestName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="h-1 w-full bg-primary-500" />
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm flex-shrink-0">
                            {initials}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                                <FaUser className="text-slate-400 text-xs" />
                                {reservation.guestName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <FaBed className="text-primary-400 text-xs" />
                                <span className="text-xs font-bold text-primary-600">
                                    {t('common.room')} {reservation.roomNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    {reservation.status === ReservationStatus.Confirmed ? (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200 flex items-center gap-1">
                            <FaCheckCircle className="text-xs" /> {t('reservations.status.confirmed')}
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-lg border border-yellow-200 flex items-center gap-1 animate-pulse">
                            <FaClock className="text-xs" /> {t('reservations.status.pending')}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <FaCalendarAlt className="text-primary-400 text-xs" />
                    <span className="font-medium text-sm">{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                </div>

                <button
                    onClick={onCheckIn}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-sm transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                            {t('common.processing')}
                        </>
                    ) : (
                        <>
                            <FaCheck />
                            {t('frontDesk.checkIn')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// ===================== Departure Card =====================
const DepartureCard = ({
    reservation,
    onCheckOut,
    onInvoice,
}: {
    reservation: Reservation;
    onCheckOut: () => void;
    onInvoice: () => void;
}) => {
    const { t } = useTranslation();
    const initials = reservation.guestName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const today = new Date();
    const checkOut = new Date(reservation.checkOutDate);
    const daysRemaining = Math.ceil((checkOut.getTime() - today.getTime()) / 86400000);
    const isCheckoutToday = daysRemaining === 0;
    const isOverdue = daysRemaining < 0;

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className={`h-1 w-full ${isOverdue ? 'bg-red-500' : isCheckoutToday ? 'bg-orange-400' : 'bg-blue-500'}`} />
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm flex-shrink-0">
                            {initials}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                                <FaUserCircle className="text-slate-400 text-xs" />
                                {reservation.guestName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <FaBed className="text-blue-400 text-xs" />
                                <span className="text-xs font-bold text-blue-600">
                                    {t('common.room')} {reservation.roomNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isOverdue ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 flex items-center gap-1">
                            <FaClock className="text-xs" /> {t('frontDesk.overdue', 'Vencido')}
                        </span>
                    ) : isCheckoutToday ? (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-lg border border-orange-200 flex items-center gap-1 animate-pulse">
                            <FaClock className="text-xs" /> {t('frontDesk.checkoutToday', 'Checkout Hoy')}
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200 flex items-center gap-1">
                            <FaHourglassHalf className="text-xs" />
                            {daysRemaining} {daysRemaining === 1 ? t('frontDesk.dayRemaining', 'día') : t('frontDesk.daysRemaining', 'días')}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <FaCalendarAlt className="text-blue-400 text-xs" />
                    <span className="font-medium text-sm">Check-out: {checkOut.toLocaleDateString()}</span>
                </div>

                {isCheckoutToday && (
                    <div className="mb-4">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-orange-400 rounded-full animate-pulse" />
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onInvoice}
                        className="flex-1 px-3 py-2.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 rounded-lg transition-all font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 hover:border-primary-200"
                    >
                        <FaFileInvoiceDollar />
                        <span className="hidden sm:inline">{t('invoicing.invoice')}</span>
                    </button>
                    <button
                        onClick={onCheckOut}
                        className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                        <FaSignOutAlt />
                        {t('frontDesk.checkOut')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===================== Main Page =====================
const FrontDesk = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'checkin'; id: string; name: string } | null>(null);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [checkoutReservation, setCheckoutReservation] = useState<Reservation | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resData, roomsData] = await Promise.all([
                reservationService.getAll(),
                roomService.getAll(),
            ]);
            setReservations(resData);
            setRooms(roomsData);
        } catch (error: any) {
            showErrorToast(t('frontDesk.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const executeCheckIn = async () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        setProcessingId(id);
        setConfirmAction(null);
        try {
            await frontDeskService.checkIn(id);
            await fetchData();
            showSuccessToast(t('frontDesk.checkInSuccess'));
        } catch (error: any) {
            showErrorToast(t('frontDesk.checkInError') + ': ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCheckIns = reservations.filter(r =>
        r.status === ReservationStatus.Confirmed || r.status === ReservationStatus.Pending
    );
    const activeStays = reservations.filter(r => r.status === ReservationStatus.CheckedIn);

    // Room status counts
    const available   = rooms.filter(r => r.status === RoomStatus.Available).length;
    const occupied    = rooms.filter(r => r.status === RoomStatus.Occupied).length;
    const cleaning    = rooms.filter(r => r.status === RoomStatus.Cleaning).length;
    const maintenance = rooms.filter(r => r.status === RoomStatus.Maintenance).length;

    return (
        <div className="space-y-6">
            {/* ---- Page Header ---- */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                            <FaBed className="text-primary-500" />
                            {t('frontDesk.title')}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">{t('frontDesk.subtitle')}</p>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                        <button
                            onClick={() => setShowWalkInModal(true)}
                            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm transition-all"
                        >
                            Walk-In
                        </button>
                        <button
                            onClick={() => settings && generateDailyReportPDF(reservations, rooms, settings)}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg shadow-sm font-bold text-sm transition-all"
                        >
                            <FaFilePdf />
                            {t('frontDesk.dailyReport')}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 flex justify-center p-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-500" />
                </div>
            ) : (
                <>
                    {/* ---- KPI Strip ---- */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: t('rooms.status.available'),   count: available,   color: 'bg-primary-500' },
                            { label: t('rooms.status.occupied'),    count: occupied,    color: 'bg-red-500'     },
                            { label: t('rooms.status.cleaning'),    count: cleaning,    color: 'bg-yellow-400'  },
                            { label: t('rooms.status.maintenance'), count: maintenance, color: 'bg-slate-500'   },
                        ].map(kpi => (
                            <div key={kpi.label} className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex items-center gap-4">
                                <div className={`w-3 h-12 rounded-full ${kpi.color} flex-shrink-0`} />
                                <div>
                                    <p className="text-3xl font-extrabold text-slate-800">{kpi.count}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ---- Room Rack ---- */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                        <h2 className="text-base font-extrabold text-slate-700 mb-5 flex items-center gap-2">
                            <FaBed className="text-primary-500" />
                            {t('frontDesk.liveRoomRack')}
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                            {rooms.sort((a, b) => a.number.localeCompare(b.number)).map((room, index) => (
                                <div key={room.id} className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
                                    <RoomCard room={room} />
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-5 mt-5 justify-end flex-wrap">
                            {[
                                { label: t('rooms.status.available'),   color: 'bg-primary-500' },
                                { label: t('rooms.status.occupied'),    color: 'bg-red-500'     },
                                { label: t('rooms.status.cleaning'),    color: 'bg-yellow-400'  },
                                { label: t('rooms.status.maintenance'), color: 'bg-slate-500'   },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <div className={`w-3 h-3 rounded ${item.color}`} />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ---- Arrivals & Departures Grid ---- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Arrivals */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                                <h2 className="text-base font-extrabold text-slate-700">{t('frontDesk.incomingArrivals')}</h2>
                                <span className="ml-auto text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg border border-primary-200">
                                    {pendingCheckIns.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {pendingCheckIns.map((res, index) => (
                                    <div key={res.id} className="animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                                        <ArrivalCard
                                            reservation={res}
                                            onCheckIn={() => setConfirmAction({ type: 'checkin', id: res.id, name: res.guestName })}
                                            isProcessing={processingId === res.id}
                                        />
                                    </div>
                                ))}
                                {pendingCheckIns.length === 0 && (
                                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-10 text-center">
                                        <FaCalendarAlt className="text-5xl text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-semibold text-sm">{t('frontDesk.noPendingArrivals')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Stays */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <h2 className="text-base font-extrabold text-slate-700">{t('frontDesk.activeStays')}</h2>
                                <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                                    {activeStays.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {activeStays.map((res, index) => (
                                    <div key={res.id} className="animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                                        <DepartureCard
                                            reservation={res}
                                            onCheckOut={() => setCheckoutReservation(res)}
                                            onInvoice={() => settings && generateInvoicePDF(res, settings)}
                                        />
                                    </div>
                                ))}
                                {activeStays.length === 0 && (
                                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-10 text-center">
                                        <FaBed className="text-5xl text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-semibold text-sm">{t('frontDesk.noActiveStays')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ---- Dialogs & Modals ---- */}
            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeCheckIn}
                title={t('frontDesk.checkIn')}
                message={confirmAction ? `${t('frontDesk.confirmCheckIn')} ${confirmAction.name}?` : ''}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type="info"
            />
            {showWalkInModal && (
                <WalkInModal
                    onClose={() => setShowWalkInModal(false)}
                    onSuccess={() => { setShowWalkInModal(false); fetchData(); }}
                />
            )}
            {checkoutReservation && (
                <CheckOutModal
                    reservation={checkoutReservation}
                    onClose={() => setCheckoutReservation(null)}
                    onSuccess={() => { setCheckoutReservation(null); fetchData(); }}
                />
            )}
        </div>
    );
};

export default FrontDesk;
