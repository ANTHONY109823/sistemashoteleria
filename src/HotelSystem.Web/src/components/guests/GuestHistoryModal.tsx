import { useState, useEffect } from 'react';
import { reservationService, Guest, Reservation, ReservationStatus } from '../../services/api';
import { FaTimes, FaCalendarAlt, FaBed } from 'react-icons/fa';

interface GuestHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: Guest | null;
}

const GuestHistoryModal = ({ isOpen, onClose, guest }: GuestHistoryModalProps) => {
    const [history, setHistory] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && guest) {
            fetchHistory();
        }
    }, [isOpen, guest]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // In a real app, use a dedicated endpoint like /Guests/{id}/History
            // For now, client-side filtering as per demo constraints
            const allReservations = await reservationService.getAll();
            const guestReservations = allReservations.filter(r => r.guestId === guest?.id);
            setHistory(guestReservations);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !guest) return null;

    const totalSpent = history.reduce((sum, r) => sum + r.totalPrice, 0);

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Confirmed: return 'bg-green-100 text-green-700';
            case ReservationStatus.CheckedIn: return 'bg-blue-100 text-blue-700';
            case ReservationStatus.CheckedOut: return 'bg-gray-100 text-gray-700';
            case ReservationStatus.Cancelled: return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels = ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'];
        return labels[status] || 'Unknown';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Guest History</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            {guest.firstName} {guest.lastName} • <span className="font-semibold text-green-600">Total Spent: ${totalSpent.toFixed(2)}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-0 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : history.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Room</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map(res => (
                                    <tr key={res.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <FaBed className="text-slate-400" />
                                                {res.roomNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1"><FaCalendarAlt className="text-xs text-slate-400" /> In: {new Date(res.checkInDate).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><FaCalendarAlt className="text-xs text-slate-400" /> Out: {new Date(res.checkOutDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(res.status)}`}>
                                                {getStatusLabel(res.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-800">
                                            ${res.totalPrice.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            No history found for this guest.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestHistoryModal;
