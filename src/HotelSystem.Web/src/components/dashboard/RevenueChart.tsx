import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { format } from 'date-fns';

interface RevenueChartProps {
    data: any[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
    const { t } = useTranslation();
    const { formatCurrency, currencySymbol } = useCurrency();

    const chartData = data && data.length > 0 ? data.map((item: any) => ({
        date: format(new Date(item.date), 'dd MMM'),
        amount: item.amount,
    })) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-lg shadow-md flex flex-col h-full min-h-[280px]"
        >
            <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
                <h3 className="text-slate-700 font-bold text-sm">{t('dashboard.revenueChart.title') || 'Revenue Summary'}</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-primary-500" />
                        <span className="text-xs text-slate-500 font-medium">{t('dashboard.revenueChart.income') || 'Income'}</span>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg py-1 px-2 text-slate-500 focus:ring-0 cursor-pointer outline-none">
                        <option>{t('dashboard.revenueChart.last7Days') || 'Last 7 days'}</option>
                        <option>{t('dashboard.revenueChart.last30Days') || 'Last 30 days'}</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2ab09b" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#2ab09b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                            formatter={(value: any) => [formatCurrency(Number(value) || 0), t('dashboard.revenueChart.income') || 'Income']}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#2ab09b" strokeWidth={2.5} fill="url(#colorIncome)" name={t('dashboard.revenueChart.income') || 'Income'} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default RevenueChart;
