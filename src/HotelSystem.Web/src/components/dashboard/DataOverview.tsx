import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api';
import { format, subDays } from 'date-fns';

const DataOverview = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const { data: revenueData = [] } = useQuery({
        queryKey: ['data-overview-revenue', startDate, endDate],
        queryFn: () => dashboardService.getRevenueChart(startDate, endDate)
    });

    const { data: stats } = useQuery({
        queryKey: ['data-overview-stats'],
        queryFn: dashboardService.getStats
    });

    const chartData = revenueData.map((item: any) => ({
        name: format(new Date(item.date), 'EEE'),
        amount: item.amount
    }));

    const totalIncome = stats?.totalRevenue || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-lg shadow-md flex flex-col h-full min-h-[280px]"
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm text-slate-700">{t('dashboard.dataOverview.title') || 'Data Overview'}</h3>
            </div>
            <p className="text-slate-400 text-xs mb-4">{t('dashboard.dataOverview.subtitle') || 'Income & expense summary'}</p>

            {/* Income pill */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-primary-500 rounded-xl p-3 text-white">
                    <div className="text-lg font-bold">{formatCurrency(totalIncome)}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{t('dashboard.dataOverview.income') || 'Income'}</div>
                </div>
                <div className="bg-purple-500 rounded-xl p-3 text-white">
                    <div className="text-lg font-bold">{formatCurrency(0)}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{t('dashboard.dataOverview.expenses') || 'Expenses'}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-xs text-slate-600">{t('dashboard.dataOverview.activity') || 'Activity'}</h4>
                <select className="border-none bg-transparent text-xs text-slate-400 focus:ring-0 outline-none">
                    <option>{t('dashboard.dataOverview.monthly') || 'Monthly'}</option>
                    <option>{t('dashboard.dataOverview.weekly') || 'Weekly'}</option>
                </select>
            </div>

            <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} dy={6} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} width={40} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' }}
                            formatter={(value: any) => formatCurrency(Number(value) || 0)}
                        />
                        <Bar dataKey="amount" fill="#2ab09b" radius={[4, 4, 4, 4]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default DataOverview;
