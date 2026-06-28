import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    mainValue: string;
    subValue?: string;
    progressValue: number; // 0-100
    colorClass: string; // 'blue' | 'yellow' | 'green' | 'primary'
    trend: 'up' | 'down' | 'neutral';
    loading?: boolean;
}

const StatsCard = ({ title, mainValue, subValue, progressValue, colorClass, trend, loading }: StatsCardProps) => {

    if (loading) {
        return (
            <div className="bg-white p-5 rounded-lg shadow-md border-b-4 border-slate-200 animate-pulse h-32">
                <div className="h-3.5 bg-slate-200 rounded w-1/3 mb-5" />
                <div className="flex justify-between items-center">
                    <div className="h-10 bg-slate-200 rounded w-1/2" />
                    <div className="h-16 w-16 bg-slate-200 rounded-full" />
                </div>
            </div>
        );
    }

    const getColors = () => {
        switch (colorClass) {
            case 'blue':    return { text: 'text-blue-600',    border: 'border-blue-500',   stroke: '#3b82f6',  bg: 'bg-blue-50'   };
            case 'yellow':  return { text: 'text-yellow-500',  border: 'border-yellow-400', stroke: '#eab308',  bg: 'bg-yellow-50' };
            case 'green':   return { text: 'text-green-500',   border: 'border-green-500',  stroke: '#22c55e',  bg: 'bg-green-50'  };
            case 'primary': return { text: 'text-primary-600', border: 'border-primary-500',stroke: '#2ab09b',  bg: 'bg-primary-50'};
            default:        return { text: 'text-slate-600',   border: 'border-slate-400',  stroke: '#64748b',  bg: 'bg-slate-50'  };
        }
    };

    const colors = getColors();
    const clampedProgress = Math.min(100, Math.max(0, progressValue));
    const r = 26;
    const circumference = 2 * Math.PI * r;
    const dashoffset = circumference - (clampedProgress / 100) * circumference;

    const TrendArrow = () => {
        if (trend === 'up')   return <span className="text-green-500 font-extrabold text-2xl leading-none mr-1">^</span>;
        if (trend === 'down') return <span className="text-red-500 font-extrabold text-2xl leading-none mr-1 inline-block rotate-180">^</span>;
        return <span className="text-slate-400 font-bold text-2xl leading-none mr-1">+</span>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-lg shadow-md border-b-[5px] ${colors.border} p-5 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 h-full`}
        >
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
                <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{title}</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <TrendArrow />
                    <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none break-all">{mainValue}</span>
                    {subValue && <span className="text-sm text-slate-400 font-bold">{subValue}</span>}
                </div>
            </div>

            {/* Circular SVG Progress */}
            <div className="relative w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] flex-shrink-0 flex items-center justify-center self-end xs:self-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                        cx="30" cy="30" r={r}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-base font-extrabold ${colors.text}`}>{clampedProgress}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
