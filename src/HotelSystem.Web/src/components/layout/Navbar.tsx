import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <header className="bg-primary-500 text-white h-16 flex items-center justify-between px-4 lg:px-6 shadow-md sticky top-0 z-40">
            {/* Left: Mobile hamburger + Date/Time */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-white/90 hover:text-white transition-colors p-1"
                    aria-label="Toggle menu"
                >
                    <FaBars className="text-xl" />
                </button>

                <div className="hidden md:flex items-center gap-2 text-white/90 text-sm font-medium">
                    <FaCalendarAlt className="text-white/70" />
                    <span>{formatDate(currentTime)}</span>
                    <span className="text-white/50 mx-1">|</span>
                    <span>PM {formatTime(currentTime)}</span>
                </div>
            </div>

            {/* Center: Search bar */}
            <div className="flex-1 max-w-xl mx-4 lg:mx-8">
                <button
                    onClick={() => {
                        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                        document.dispatchEvent(event);
                    }}
                    className="w-full flex items-center bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors group border border-white/10"
                >
                    <FaSearch className="text-white/70 group-hover:text-white flex-shrink-0" />
                    <span className="ml-3 flex-1 text-white/70 group-hover:text-white text-left text-sm font-medium">
                        Search...
                    </span>
                </button>
            </div>

            {/* Right: Language, Notifications, User */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Language Switcher */}
                <div className="hidden sm:flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`text-[11px] uppercase font-bold transition-colors ${i18n.language === 'en' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                    >
                        EN
                    </button>
                    <span className="text-white/40 text-xs">|</span>
                    <button
                        onClick={() => changeLanguage('es')}
                        className={`text-[11px] uppercase font-bold transition-colors ${i18n.language === 'es' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                    >
                        ES
                    </button>
                </div>

                {/* Notifications */}
                <div className="text-white/90 hover:text-white">
                    <NotificationBell />
                </div>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors focus:outline-none"
                    >
                        <span className="hidden sm:block text-sm font-bold">Your Name</span>
                        <FaUserCircle className="text-2xl sm:text-3xl" />
                    </button>

                    {showDropdown && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-20 text-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
                                >
                                    <FaSignOutAlt /> {t('common.logout') || 'Logout'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
