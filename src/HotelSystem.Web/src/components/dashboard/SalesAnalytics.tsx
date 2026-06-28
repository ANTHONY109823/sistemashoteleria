import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, reportService } from '../../services/api';

const PIE_COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const SalesAnalytics = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    const { data: stats } = useQuery({
        queryKey: ['sales-analytics-stats'],
        queryFn: dashboardService.getStats
    });

    const { data: revenueReport } = useQuery({
        queryKey: ['sales-analytics-revenue-report'],
        queryFn: () => reportService.getRevenue()
    });

    const totalIncome = stats?.totalRevenue || 0;

    const roomTypeData = revenueReport?.revenueByRoomType?.map((item: any, index: number) => ({
        name: item.roomTypeName,
        value: item.revenue,
        color: PIE_COLORS[index % PIE_COLORS.length]
    })) || [];

    const hasData = roomTypeData.length > 0 && totalIncome > 0;

    const fallback = [
        { name: 'Standard', value: 55, color: '#10B981' },
        { name: 'Deluxe', value: 20, color: '#EF4444' },
        { name: 'Suite', value: 25, color: '#F59E0B' },
    ];

    const displayData = hasData ? roomTypeData : fallback;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-lg shadow-md flex flex-col h-full min-h-[280px]"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-700">{t('dashboard.salesAnalytics.title') || 'Sales by Room Type'}</h3>
            </div>

            <div className="flex flex-col items-center flex-1">
                <div className="w-[180px] h-[180px] relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {displayData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => hasData ? formatCurrency(Number(value) || 0) : `${value}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-extrabold text-slate-700">100%</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 justify-center flex-wrap">
                    {displayData.map((item: any) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>

                {hasData && (
                    <div className="mt-3 text-center">
                        <p className="text-xs text-slate-400">{t('dashboard.salesAnalytics.totalIncome') || 'Total Income'}</p>
                        <p className="text-lg font-extrabold text-slate-700">{formatCurrency(totalIncome)}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SalesAnalytics;
