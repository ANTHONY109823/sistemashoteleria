import { ReactNode } from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    changePercent?: number;
    comparisonText?: string;
    loading?: boolean;
}

const StatCard = ({ title, value, icon, color, trend, changePercent, comparisonText, loading }: StatCardProps) => {
    const getTrendIcon = () => {
        if (!trend || trend === 'neutral') return <FaMinus className="text-xs" />;
        if (trend === 'up') return <FaArrowUp className="text-xs" />;
        return <FaArrowDown className="text-xs" />;
    };

    const getTrendColor = () => {
        if (!trend || trend === 'neutral') return 'text-slate-400 bg-slate-100';
        if (trend === 'up') return 'text-green-600 bg-green-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${color} opacity-30`}></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-slate-200 rounded w-16"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer transform hover:scale-105 duration-200"
        >
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl ${color}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-slate-500 text-sm font-medium">{title}</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                        {changePercent !== undefined && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendColor()}`}>
                                {getTrendIcon()}
                                <span className="text-xs font-semibold">
                                    {changePercent > 0 ? '+' : ''}{changePercent}%
                                </span>
                            </div>
                        )}
                    </div>
                    {comparisonText && (
                        <p className="text-xs text-slate-400 mt-1">{comparisonText}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
