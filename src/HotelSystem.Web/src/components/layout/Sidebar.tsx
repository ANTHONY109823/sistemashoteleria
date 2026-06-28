import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBed, FaCalendarAlt, FaConciergeBell, FaUser, FaSignOutAlt, FaBroom, FaShapes, FaCog, FaUserShield, FaHistory, FaChartLine, FaFileInvoiceDollar, FaDatabase } from 'react-icons/fa';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api';
import { useSettings } from '../../hooks/useSettings';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const { t } = useTranslation();
    const { data: settings } = useSettings();

    const listMenuItems = [
        { name: t('sidebar.dashboard') || 'Dashboard', icon: FaHome, path: '/' },
        { name: t('sidebar.frontDesk') || 'Front Desk', icon: FaConciergeBell, path: '/front-desk' },
        { name: t('sidebar.reservations') || 'Reservations', icon: FaCalendarAlt, path: '/reservations' },
        { name: t('sidebar.guests') || 'Guests', icon: FaUser, path: '/guests' },
        { name: t('sidebar.rooms') || 'Rooms', icon: FaBed, path: '/rooms' },
        { name: t('sidebar.housekeeping') || 'Housekeeping', icon: FaBroom, path: '/housekeeping' },
        { name: t('sidebar.roomTypes') || 'Room Types', icon: FaShapes, path: '/room-types' },
        { name: 'Invoices', icon: FaFileInvoiceDollar, path: '/invoices' },
    ];

    const settingMenuItems = [
        { name: t('sidebar.reports') || 'Reports', icon: FaChartLine, path: '/reports' },
        { name: t('sidebar.profile') || 'Profile', icon: FaUser, path: '/profile' },
        { name: t('sidebar.users') || 'Users', icon: FaUserShield, path: '/users' },
        { name: t('sidebar.auditLogs') || 'Audit Logs', icon: FaHistory, path: '/audit-logs' },
        { name: 'Mantenimiento', icon: FaDatabase, path: '/maintenance' },
        { name: t('sidebar.settings') || 'Settings', icon: FaCog, path: '/settings' },
    ];

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <aside
            className={clsx(
                'h-screen w-64 bg-white text-slate-600 flex flex-col fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200 z-50 transition-transform duration-300',
                // Mobile: slide in from left
                'lg:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
            <div className="h-16 flex flex-col justify-center px-6 border-b border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                    {settings?.logoBase64 ? (
                        <div className="bg-primary-50 rounded-full h-10 w-10 flex items-center justify-center shadow-sm">
                           <img
                               src={settings.logoBase64}
                               alt="Logo"
                               className="max-h-8 max-w-8 object-contain rounded-full"
                           />
                        </div>
                    ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded-full shadow-sm flex-shrink-0" />
                    )}
                    <h1 className="text-lg font-extrabold text-primary-600 leading-tight uppercase tracking-wider whitespace-normal break-words">
                        {settings?.companyName || 'LOGO'}
                        <span className="block text-[9px] text-slate-400 font-normal mt-0.5 tracking-normal lowercase">Tagline Here</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar">
                
                {/* List Menu Section */}
                <div className="px-4">
                    <h3 className="px-4 text-xs font-bold text-primary-600 tracking-wider mb-2 uppercase flex items-center gap-2">
                        <span className="text-lg">≡</span> LIST MENU
                    </h3>
                    <nav className="space-y-1">
                        {listMenuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleLinkClick}
                                    className={clsx(
                                        'flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group relative',
                                        isActive
                                            ? 'bg-primary-50 text-primary-600 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary-600 rounded-r-md" />
                                        )}
                                        <item.icon className={clsx("text-lg", isActive ? "text-primary-600" : "text-primary-600/70")} />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-xs opacity-50">◀</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Setting Section */}
                <div className="px-4">
                    <h3 className="px-4 text-xs font-bold text-primary-600 tracking-wider mb-2 uppercase flex items-center gap-2">
                        <span className="text-lg">≡</span> SETTING
                    </h3>
                    <nav className="space-y-1">
                        {settingMenuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleLinkClick}
                                    className={clsx(
                                        'flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group relative',
                                        isActive
                                            ? 'bg-primary-50 text-primary-600 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary-600 rounded-r-md" />
                                        )}
                                        <item.icon className={clsx("text-lg", isActive ? "text-primary-600" : "text-primary-600/70")} />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Logout Capsule Button */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full shadow-md shadow-primary-600/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span>{t('sidebar.logout') || 'Logout'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
