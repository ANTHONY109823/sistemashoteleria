import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const IncomeTarget = () => {
    const { t } = useTranslation();

    const targets = [
        { name: 'Hotel Bookings', value: 85, color: 'bg-blue-500' },
        { name: 'Restaurant Sales', value: 45, color: 'bg-yellow-400' },
        { name: 'Services', value: 65, color: 'bg-green-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md border-t-4 border-slate-200 h-full flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Income Target</h3>
                <button className="text-slate-400 hover:text-slate-600">...</button>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                {targets.map((target, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-600">{target.name}</span>
                            <span className="text-sm font-bold text-slate-800">{target.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div className={`${target.color} h-2.5 rounded-full`} style={{ width: `${target.value}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default IncomeTarget;
