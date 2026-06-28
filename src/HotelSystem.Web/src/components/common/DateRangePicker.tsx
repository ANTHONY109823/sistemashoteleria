import { useState } from 'react';
import { FaCalendar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface DateRangePickerProps {
    onRangeChange: (startDate: Date, endDate: Date) => void;
}

const DateRangePicker = ({ onRangeChange }: DateRangePickerProps) => {
    const { t } = useTranslation();
    const [selectedPreset, setSelectedPreset] = useState<string>('month');

    const presets = [
        { key: 'today', label: t('dateRange.today', 'Today'), days: 0 },
        { key: 'week', label: t('dateRange.lastWeek', 'Last Week'), days: 7 },
        { key: 'month', label: t('dateRange.lastMonth', 'Last Month'), days: 30 },
        { key: 'year', label: t('dateRange.lastYear', 'Last Year'), days: 365 },
    ];

    const handlePresetClick = (preset: typeof presets[0]) => {
        setSelectedPreset(preset.key);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - preset.days);
        onRangeChange(startDate, endDate);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <FaCalendar className="text-slate-400" />
            <div className="flex gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.key}
                        onClick={() => handlePresetClick(preset)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPreset === preset.key
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DateRangePicker;
