import React, { useState, useEffect } from 'react';
import { invoiceService, Invoice } from '../services/api';
import { FaFileInvoiceDollar, FaDownload, FaSearch } from 'react-icons/fa';
import SkeletonTable from '../components/common/SkeletonTable';
import { showErrorToast } from '../utils/toast';

const Invoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.getAll();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            showErrorToast('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string, invoiceNumber: string) => {
        try {
            setDownloadingId(id);
            await invoiceService.downloadPdf(id);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showErrorToast(`Failed to download invoice ${invoiceNumber}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredInvoices = invoices.filter(i => 
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Paid</span>;
            case 'Pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">Pending</span>;
            case 'Refunded':
                return <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">Refunded</span>;
            case 'Cancelled':
                return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">Cancelled</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                            <FaFileInvoiceDollar className="text-primary-500" />
                            Invoices
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Billing and documentation</p>
                    </div>
                    {/* Search */}
                     <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-slate-400 text-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by invoice #, guest, or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center">
                        <SkeletonTable rows={10} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Invoice #</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Guest & Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInvoices.map((invoice, index) => (
                                    <tr 
                                        key={invoice.id} 
                                        className="hover:bg-slate-50 transition-colors duration-200 animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-800">{invoice.invoiceNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{invoice.guestName}</span>
                                                <div className="text-sm text-slate-500">Room {invoice.roomNumber}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-slate-800">${invoice.totalAmount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPaymentStatusBadge(invoice.paymentStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                                                disabled={downloadingId === invoice.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 transition-colors disabled:opacity-50 border border-teal-200"
                                            >
                                                {downloadingId === invoice.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-teal-600 border-t-transparent" />
                                                ) : (
                                                    <FaDownload />
                                                )}
                                                Download PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No invoices found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Invoices;
