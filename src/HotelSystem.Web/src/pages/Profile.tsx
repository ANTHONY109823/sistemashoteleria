import { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    // Get user info from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'user@hotel.com';
    const userRole = localStorage.getItem('role') || 'Staff';
    const userName = localStorage.getItem('userName') || 'User';

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                    <FaUser className="text-primary-500" />
                    My Profile
                </h1>
                <p className="text-slate-500 text-sm font-medium">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information Card */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-primary-500 text-lg" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-800">User Information</h2>
                    </div>

                    <div className="space-y-5 flex-grow">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Name
                            </label>
                            <div className="text-base font-bold text-slate-800">
                                {userName}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Email
                            </label>
                            <div className="text-base font-bold text-slate-800">
                                {userEmail}
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Role
                            </label>
                            <div>
                                <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${userRole === 'Admin'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-primary-50 text-primary-700 border border-primary-200'
                                    }`}>
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <FaLock className="text-orange-500 text-lg" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-800">Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4 flex-grow flex flex-col">
                        <div className="space-y-4 flex-grow">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 transition-shadow outline-none"
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 transition-shadow outline-none"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 transition-shadow outline-none"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full px-4 py-2.5 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaLock />
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
