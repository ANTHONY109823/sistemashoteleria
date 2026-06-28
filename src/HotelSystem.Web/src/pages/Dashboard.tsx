import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import DataOverview from '../components/dashboard/DataOverview';
import SalesAnalytics from '../components/dashboard/SalesAnalytics';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats, ReservationStatus } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { format, subDays } from 'date-fns';
import { useCurrency } from '../hooks/useCurrency';

// Standalone income target card
const TargetCard = ({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-600">{label}</h3>
        <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-slate-800">{value}</span>
            <span className="text-2xl font-bold text-slate-500">%</span>
        </div>
        <div>
            <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                    className={`${color} h-3 rounded-full transition-all duration-1000`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <p className={`text-xs font-semibold mt-2 ${bg}`}>Income Target</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { t } = useTranslation();
    const { notifications } = useNotifications();
    const { formatCurrency } = useCurrency();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats
    });

    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const { data: revenueData = [] } = useQuery({
        queryKey: ['dashboard-revenue', startDate, endDate],
        queryFn: () => dashboardService.getRevenueChart(startDate, endDate)
    });

    useEffect(() => {
        if (data) setStats(data);
    }, [data]);

    useEffect(() => {
        if (notifications.length > 0) refetch();
    }, [notifications, refetch]);

    const getOccupancyRate = () => {
        if (!stats || stats.totalRooms === 0) return 0;
        return Math.round((stats.occupiedRooms / stats.totalRooms) * 100);
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Confirmed: return 'text-green-700 bg-green-100';
            case ReservationStatus.CheckedIn: return 'text-blue-700 bg-blue-100';
            case ReservationStatus.CheckedOut: return 'text-slate-600 bg-slate-100';
            case ReservationStatus.Cancelled: return 'text-red-700 bg-red-100';
            case ReservationStatus.NoShow: return 'text-orange-700 bg-orange-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels = ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'];
        return labels[status] || 'Unknown';
    };

    return (
        <div className="space-y-6 pb-10">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                        ☆ {t('dashboard.welcome', { name: '' }) || 'DASHBOARD'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">{t('dashboard.subtitle') || 'Hotel management overview'}</p>
                </div>
            </div>

            {/* ===================== ROW 1: 3 KPI Cards ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatsCard
                    title={t('dashboard.stats.totalRevenue') || 'Total Revenue'}
                    mainValue={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                    progressValue={85}
                    colorClass="blue"
                    trend="up"
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.stats.totalReservations') || 'Total Reservations'}
                    mainValue={stats?.totalBookings?.toString() || '0'}
                    progressValue={92}
                    colorClass="yellow"
                    trend="down"
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.stats.occupancyRate') || 'Occupancy Rate'}
                    mainValue={`${getOccupancyRate()}%`}
                    progressValue={getOccupancyRate()}
                    colorClass="green"
                    trend="up"
                    loading={isLoading}
                />
            </div>

            {/* ===================== ROW 2: 3 Equal Charts ===================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Chart 1: Data Overview / Bar chart */}
                <DataOverview />

                {/* Chart 2: Revenue Area Chart */}
                <RevenueChart data={revenueData} />

                {/* Chart 3: Sales Analytics / Pie Chart */}
                <SalesAnalytics />
            </div>

            {/* ===================== ROW 3: 3 Income Target Cards ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <TargetCard label={t('dashboard.stats.totalRevenue') || 'Revenue Target'} value={65} color="bg-blue-500" bg="text-blue-600" />
                <TargetCard label={t('dashboard.stats.totalReservations') || 'Bookings Target'} value={65} color="bg-yellow-400" bg="text-yellow-600" />
                <TargetCard label={t('dashboard.stats.occupancyRate') || 'Occupancy Target'} value={65} color="bg-green-500" bg="text-green-600" />
            </div>

            {/* ===================== EXTRA: Recent Bookings strip ===================== */}
            <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-base text-slate-700">{t('dashboard.recentBookings') || 'Recent Bookings'}</h3>
                    <Link to="/reservations" className="text-xs text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 uppercase tracking-wider">
                        {t('dashboard.viewAll') || 'View All'} <FaArrowRight size={10} />
                    </Link>
                </div>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex gap-4 items-center animate-pulse">
                                <div className="w-9 h-9 rounded-lg bg-slate-100" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                                </div>
                                <div className="h-3.5 bg-slate-100 rounded w-16" />
                            </div>
                        ))
                    ) : stats?.recentBookings?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {stats.recentBookings.slice(0, 4).map(booking => (
                                <div key={booking.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer group border border-slate-100">
                                    <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {booking.guestName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-700 truncate text-sm group-hover:text-primary-700 transition-colors">
                                            {booking.guestName}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">Room {booking.roomNumber}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-slate-700 text-xs">{formatCurrency(booking.totalPrice)}</p>
                                        <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getStatusColor(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-6 text-sm">{t('dashboard.noRecentBookings') || 'No recent bookings'}</p>
                    )}
                </div>
            </div>

            {/* Footer bar like Image 2 */}
            <div className="bg-primary-500 text-white text-center py-2.5 rounded-lg text-sm font-medium">
                Hotel System — Streamline operations, boost revenue, and deliver unforgettable moments.
            </div>
        </div>
    );
};

export default Dashboard;
