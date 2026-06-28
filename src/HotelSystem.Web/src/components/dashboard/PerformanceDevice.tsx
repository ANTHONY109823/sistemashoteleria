import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api';

const PerformanceDevice = () => {
    const { t } = useTranslation();

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats
    });

    const data = [
        { name: 'available', value: stats?.availableRooms || 0, color: '#10B981' }, // Emerald-500
        { name: 'occupied', value: stats?.occupiedRooms || 0, color: '#EF4444' }, // Red-500
        { name: 'cleaning', value: stats?.cleaningRooms || 0, color: '#F59E0B' }, // Amber-500
        { name: 'maintenance', value: stats?.maintenanceRooms || 0, color: '#6B7280' }, // Gray-500
    ].filter(item => item.value > 0);

    const totalRooms = stats?.totalRooms || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">{t('dashboard.performanceDevice.title')}</h3>
            </div>

            <div className="flex items-center justify-between">
                <div className="w-[200px] h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-bold text-slate-800">100%</span>
                        <span className="text-xs text-slate-400">{t('dashboard.performanceDevice.totalStatus')}</span>
                    </div>
                </div>

                <div className="flex-1 ml-4 justify-center flex flex-col items-center">
                    <div className="text-center mb-4">
                        <p className="text-sm text-slate-400 mb-1">{t('dashboard.stats.totalRooms')}</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-bold text-slate-800">{totalRooms}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 px-2">
                {data.map((item) => (
                    <div key={item.name} className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-xs font-bold text-slate-700">{item.value}</span>
                        </div>
                        <span className="text-xs text-slate-400">{t(`dashboard.performanceDevice.${item.name}`)}</span>
                    </div>
                ))}
                {data.length === 0 && <p className="text-center text-sm text-slate-400 col-span-2">No data available</p>}
            </div>
        </motion.div>
    );
};

export default PerformanceDevice;
