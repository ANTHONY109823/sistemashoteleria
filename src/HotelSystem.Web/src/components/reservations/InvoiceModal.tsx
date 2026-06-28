import { Reservation } from '../../services/api';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from 'react-i18next';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
}

const InvoiceModal = ({ isOpen, onClose, reservation }: InvoiceModalProps) => {
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();
    if (!isOpen || !reservation) return null;

    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = reservation.totalPrice / nights;

    // Simple tax calculation for demo (e.g., 10%)
    // In a real app, this should come from backend
    const subtotal = reservation.totalPrice / 1.1;
    const tax = reservation.totalPrice - subtotal;

    // Use total price as the authoritative final amount
    const total = reservation.totalPrice;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:absolute print:inset-0">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">

                {/* Modal Header - Hidden when printing */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">{t('reservations.invoice.preview')}</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
                        >
                            <FaPrint /> {t('reservations.invoice.printInvoice')}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-10 print:p-8 space-y-8 font-serif" id="invoice-content">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-primary-600 pb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t('reservations.invoice.title')}</h1>
                            <p className="text-gray-500 mt-1">#{reservation.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-primary-600">Hotel OS</h2>
                            <p className="text-gray-600">123 Luxury Ave</p>
                            <p className="text-gray-600">Miami, FL 33101</p>
                            <p className="text-gray-600">contact@hotelos.com</p>
                        </div>
                    </div>

                    {/* Bill To & Details */}
                    <div className="flex justify-between py-4">
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('reservations.invoice.billTo')}</span>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">{reservation.guestName}</h3>
                            <p className="text-gray-600">{t('reservations.invoice.guestId')}: {reservation.guestId.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t('reservations.invoice.dateIssued')}</span>
                                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{t('reservations.invoice.stayDuration')}</span>
                                <span className="font-semibold">{checkIn.toLocaleDateString()} — {checkOut.toLocaleDateString()}</span>
                                <span className="text-gray-500 text-sm ml-2">({nights} {t('reservations.invoice.nights')})</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="py-3 px-4 rounded-l-lg">{t('reservations.invoice.description')}</th>
                                <th className="py-3 px-4 text-right">{t('reservations.invoice.unitPrice')}</th>
                                <th className="py-3 px-4 text-center">{t('reservations.invoice.qty')}</th>
                                <th className="py-3 px-4 rounded-r-lg text-right">{t('reservations.invoice.amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-4 px-4">
                                    <p className="font-bold text-gray-800">{t('reservations.invoice.accommodation', { room: reservation.roomNumber })}</p>
                                    <p className="text-sm text-gray-500">{t('reservations.invoice.standardRate', { nights })}</p>
                                </td>
                                <td className="py-4 px-4 text-right">{formatCurrency(pricePerNight)}</td>
                                <td className="py-4 px-4 text-center">{nights}</td>
                                <td className="py-4 px-4 text-right font-medium">{formatCurrency(reservation.totalPrice)}</td>
                            </tr>
                            {/* Extras (Placeholder) */}
                            {/* <tr>
                                <td className="py-4 px-4">
                                    <p className="font-bold text-gray-800">Room Service</p>
                                    <p className="text-sm text-gray-500">Food & Beverages</p>
                                </td>
                                <td className="py-4 px-4 text-right">$50.00</td>
                                <td className="py-4 px-4 text-center">1</td>
                                <td className="py-4 px-4 text-right font-medium">$50.00</td>
                            </tr> */}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('reservations.invoice.subtotal')}</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('reservations.invoice.tax')}</span>
                                <span>{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                                <span>{t('reservations.invoice.total')}</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-gray-400 text-sm border-t border-gray-100 pt-8">
                        <p>{t('reservations.invoice.thankYou')}</p>
                        <p className="mt-1">{t('reservations.invoice.questions')}</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceModal;
