import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaCheckCircle, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { Reservation } from '../../types';
import { frontDeskService } from '../../services/api';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

interface ExtraItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

interface CheckOutModalProps {
    reservation: Reservation;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckOutModal = ({ reservation, onClose, onSuccess }: CheckOutModalProps) => {
    const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'CreditCard' | 'DebitCard'>('Cash');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form inputs for new item
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemQty, setNewItemQty] = useState<number>(1);
    const [newItemPrice, setNewItemPrice] = useState<number>(0);

    const handleAddItem = () => {
        if (!newItemDesc || newItemQty <= 0 || newItemPrice < 0) {
            showErrorToast("Verrify extra item details.");
            return;
        }

        setExtraItems([...extraItems, {
            description: newItemDesc,
            quantity: newItemQty,
            unitPrice: newItemPrice
        }]);

        setNewItemDesc('');
        setNewItemQty(1);
        setNewItemPrice(0);
    };

    const handleRemoveItem = (index: number) => {
        setExtraItems(extraItems.filter((_, i) => i !== index));
    };

    const handleCheckOut = async () => {
        setIsProcessing(true);
        try {
            await frontDeskService.checkOut(reservation.id, {
                paymentMethod,
                extraItems,
                notes
            });
            showSuccessToast('Check-out completed, Invoice generated!');
            onSuccess();
        } catch (error: any) {
            console.error('Check-out error:', error);
            showErrorToast(error.response?.data?.message || 'Check-out failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const extraTotal = extraItems.reduce((acc, current) => acc + (current.quantity * current.unitPrice), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-3xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FaCheckCircle className="text-green-400" />
                            Check-Out: {reservation.guestName}
                        </h2>
                        <p className="text-slate-400 font-medium">Room {reservation.roomNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                        <FaTimes />
                    </button>
                </div>

                {/* Body scrollable */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-8">
                    
                    {/* Extra Items Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add Extra Charges</h3>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input 
                                type="text"
                                placeholder="Description (e.g. Minibar, Laundry)"
                                value={newItemDesc}
                                onChange={e => setNewItemDesc(e.target.value)}
                                className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-3">
                                <input 
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    value={newItemQty}
                                    onChange={e => setNewItemQty(Number(e.target.value))}
                                    className="w-20 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Price $"
                                    value={newItemPrice || ''}
                                    onChange={e => setNewItemPrice(Number(e.target.value))}
                                    className="w-28 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button 
                                    onClick={handleAddItem}
                                    className="p-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-bold transition flex items-center justify-center"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* List items */}
                        {extraItems.length > 0 && (
                            <table className="w-full text-left mt-4 text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="py-2">Item</th>
                                        <th className="py-2">Qty</th>
                                        <th className="py-2">Price</th>
                                        <th className="py-2">Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extraItems.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                                            <td className="py-3 font-medium text-slate-700">{item.description}</td>
                                            <td className="py-3 text-slate-600">{item.quantity}</td>
                                            <td className="py-3 text-slate-600">${item.unitPrice.toFixed(2)}</td>
                                            <td className="py-3 font-bold text-slate-800">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                            <td className="py-3 text-right">
                                                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                            <span className="text-slate-500 mr-4">Extras Total:</span>
                            <span className="text-xl font-bold text-slate-800">${extraTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Payment & Options</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                                <div className="flex gap-2">
                                    <button 
                                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'Cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('Cash')}
                                    >
                                        <FaMoneyBillWave className="text-2xl" />
                                        <span className="font-bold text-sm">Cash</span>
                                    </button>
                                    <button 
                                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CreditCard' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('CreditCard')}
                                    >
                                        <FaCreditCard className="text-2xl" />
                                        <span className="font-bold text-sm">Credit Card</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                    placeholder="Optional notes for the invoice..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer fixed */}
                <div className="bg-white border-t border-slate-200 p-6 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCheckOut}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Processing...</>
                        ) : 'Confirm Check-Out'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CheckOutModal;
