import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';

const Login = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login({ email, password });
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Credenciales inválidas. Por favor verifique sus datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: '#e2e8f0' }}
        >
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[540px]">

                {/* ---- Left Panel (Teal branding) ---- */}
                <div
                    className="w-full md:w-5/12 p-10 text-white flex flex-col justify-between relative overflow-hidden"
                    style={{ backgroundColor: '#2ab09b' }}
                >
                    {/* Decorative blobs */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ backgroundColor: '#1d8f7e' }} />
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: '#197367' }} />

                    {/* Logo area */}
                    <div className="relative z-10 flex items-center gap-3">
                        {settings?.logoBase64 ? (
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 p-1">
                                <img src={settings.logoBase64} alt="Logo" className="max-h-full max-w-full object-contain rounded-full" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                <span className="text-2xl" style={{ color: '#2ab09b' }}>⌂</span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl font-extrabold uppercase tracking-widest leading-none truncate max-w-[200px]">
                                {settings?.companyName || 'HOTEL OS'}
                            </h1>
                            <p className="text-[10px] opacity-70 tracking-wide">Management System</p>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div className="relative z-10 my-8 md:my-0">
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                            Elevate<br />Your Hotel<br />Experience.
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                            Streamline operations, boost revenue, and deliver unforgettable moments for your guests.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 text-white/60 text-xs font-medium">
                        © {new Date().getFullYear()} {settings?.companyName || 'Hotel System Inc.'}
                    </div>
                </div>

                {/* ---- Right Panel (White form) ---- */}
                <div className="w-full md:w-7/12 p-8 md:p-12 lg:px-16 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Welcome back!</h2>
                        <p className="text-slate-400 text-sm">Please sign in to your account to continue.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3.5 rounded-r-lg mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                                {t('login.email') || 'Email Address'}
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                    <FaEnvelope />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@hotel.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium outline-none focus:ring-2 focus:border-transparent transition-all"
                                    style={{ '--tw-ring-color': '#2ab09b' } as React.CSSProperties}
                                    onFocus={e => e.target.style.borderColor = '#2ab09b'}
                                    onBlur={e => e.target.style.borderColor = ''}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    {t('login.password') || 'Password'}
                                </label>
                                <a href="#" className="text-xs font-bold" style={{ color: '#2ab09b' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                    <FaLock />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium outline-none transition-all"
                                    onFocus={e => e.target.style.borderColor = '#2ab09b'}
                                    onBlur={e => e.target.style.borderColor = ''}
                                />
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                                style={{ accentColor: '#2ab09b' }}
                            />
                            <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer select-none">
                                Remember my device
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            style={{ backgroundColor: '#2ab09b' }}
                            onMouseEnter={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#1d8f7e')}
                            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = '#2ab09b')}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('login.signingIn') || 'Signing in...'}
                                </span>
                            ) : (
                                t('login.signIn') || 'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
