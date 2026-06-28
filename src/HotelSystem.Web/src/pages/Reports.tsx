import { useState, useEffect } from 'react';
import { FaChartLine, FaCalendar, FaUsers, FaDollarSign, FaBed } from 'react-icons/fa';
import { reportService, RevenueReport, OccupancyReport, GuestStats } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from 'react-i18next';

const Reports = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
    const [occupancyData, setOccupancyData] = useState<OccupancyReport | null>(null);
    const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const [revenue, occupancy, guests] = await Promise.all([
                reportService.getRevenue(dateRange.startDate, dateRange.endDate),
                reportService.getOccupancy(dateRange.startDate, dateRange.endDate),
                reportService.getGuestStats()
            ]);
            setRevenueData(revenue);
            setOccupancyData(occupancy);
            setGuestStats(guests);
        } catch (error: any) {
            toast.error(t('reports.error'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeUpdate = () => {
        loadReports();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="p-6 min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-medium">{t('reports.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                        <FaChartLine className="text-primary-500" />
                        {t('reports.title')}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">{t('reports.subtitle')}</p>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <FaCalendar className="text-slate-400 ml-1" />
                    <input
                        type="date"
                        className="px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        value={dateRange.startDate}
                        onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                    <span className="text-slate-400 text-sm">to</span>
                    <input
                        type="date"
                        className="px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        value={dateRange.endDate}
                        onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                    <button
                        onClick={handleDateRangeUpdate}
                        className="px-4 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm font-bold shadow-sm"
                    >
                        {t('reports.dateRange.update')}
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center gap-4">
                    <div className="w-1.5 h-14 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <FaDollarSign className="text-2xl text-primary-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-800 mb-0.5">{formatCurrency(revenueData?.totalRevenue || 0)}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('reports.metrics.totalRevenue')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center gap-4">
                    <div className="w-1.5 h-14 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FaBed className="text-2xl text-blue-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-800 mb-0.5">{occupancyData?.currentOccupancyRate.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            {t('reports.metrics.occupancyRate')} <br/> 
                            <span className="opacity-75">{occupancyData?.occupiedRooms} / {occupancyData?.totalRooms} {t('reports.metrics.rooms')}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center gap-4">
                    <div className="w-1.5 h-14 rounded-full bg-teal-600 flex-shrink-0" />
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <FaUsers className="text-2xl text-teal-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-800 mb-0.5">{guestStats?.totalGuests || 0}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            {t('reports.metrics.totalGuests')} <br/>
                            <span className="opacity-75">+{guestStats?.newGuestsThisMonth || 0} {t('reports.metrics.newThisMonth')}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">{t('reports.charts.revenueTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData?.revenueByDate.map(d => ({ ...d, date: formatDate(d.date) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => formatCurrency(value)}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#2ab09b" strokeWidth={3} name={t('reports.charts.revenue')} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Room Type */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">{t('reports.charts.revenueByRoomType')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData?.revenueByRoomType}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="roomTypeName" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => formatCurrency(value)}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} name={t('reports.charts.revenue')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Occupancy Trend */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">{t('reports.charts.occupancyTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={occupancyData?.occupancyByDate.map(d => ({ ...d, date: formatDate(d.date) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => `${value}%`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="occupancyRate" stroke="#3b82f6" strokeWidth={3} name={t('reports.charts.occupancy')} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Guests by Country */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">{t('reports.charts.guestsByCountry')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={guestStats?.guestsByCountry}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="country"
                                stroke="none"
                            >
                                {guestStats?.guestsByCountry.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
