import React, { useState, useEffect } from 'react';
import { FaTimes, FaWalking, FaUser, FaBed, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { Room, RoomStatus } from '../../types';
import { frontDeskService, roomService } from '../../services/api';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

interface WalkInModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const WalkInModal = ({ onClose, onSuccess }: WalkInModalProps) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [identificationNumber, setIdentificationNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    
    const [roomId, setRoomId] = useState('');
    
    // Default checkout is tomorrow
    const [checkOutDate, setCheckOutDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await roomService.getAll();
                // Only show available rooms
                setRooms(data.filter(r => r.status === RoomStatus.Available));
            } catch (error) {
                console.error("Failed to load rooms", error);
                showErrorToast("Could not load available rooms");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleWalkIn = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!firstName || !lastName || !roomId || !checkOutDate) {
            showErrorToast("Please fill all required fields");
            return;
        }

        setIsProcessing(true);
        try {
            await frontDeskService.walkIn({
                firstName,
                lastName,
                identificationNumber,
                phone,
                email,
                roomId,
                checkOutDate: new Date(checkOutDate).toISOString(),
                adults,
                children,
                paymentMethod: 'Cash', // Defaulting for walkin base requirement
                notes: 'Walk-In Registration'
            } as any);
            
            showSuccessToast('Walk-in check-in completed!');
            onSuccess();
        } catch (error: any) {
            console.error('Walk-in error:', error);
            showErrorToast(error.response?.data?.message || 'Walk-in failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FaWalking className="text-white" />
                            Walk-In Registration
                        </h2>
                        <p className="text-blue-100 font-medium text-sm">Instant guest check-in</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                        <FaTimes />
                    </button>
                </div>

                {/* Body scrollable */}
                <form onSubmit={handleWalkIn} className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
                    
                    {/* Guest Details */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-blue-500" /> Guest Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">First Name *</label>
                                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name *</label>
                                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">ID / Passport</label>
                                <input type="text" value={identificationNumber} onChange={e => setIdentificationNumber(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doc Number" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+123456789" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    {/* Stay Details */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FaBed className="text-indigo-500" /> Stay Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Assign Room *</label>
                                <select required value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="" disabled>Select Available Room</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>Room {r.number} - {r.roomTypeName} (${r.pricePerNight || 'N/A'}/night)</option>
                                    ))}
                                </select>
                                {rooms.length === 0 && !loading && <span className="text-red-500 text-xs mt-1">No rooms available!</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><FaCalendarAlt/> Check-Out Date *</label>
                                <input required type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><FaUsers/> Guests *</label>
                                <div className="flex gap-2">
                                    <input required type="number" min="1" value={adults} onChange={e => setAdults(Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Adults" />
                                    <input type="number" min="0" value={children} onChange={e => setChildren(Number(e.target.value))} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Children" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </form>

                {/* Footer fixed */}
                <div className="bg-white border-t border-slate-200 p-6 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleWalkIn}
                        disabled={isProcessing || !roomId || rooms.length === 0}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Processing...</>
                        ) : 'Check In Now'}
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

export default WalkInModal;
