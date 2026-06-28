import { FaTimes } from 'react-icons/fa';
import clsx from 'clsx';

interface QuickFilter {
    label: string;
    value: string;
    count?: number;
}

interface QuickFiltersProps {
    filters: QuickFilter[];
    activeFilter: string | null;
    onFilterChange: (value: string | null) => void;
    className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
    filters,
    activeFilter,
    onFilterChange,
    className,
}) => {
    return (
        <div className={clsx('flex flex-wrap gap-2', className)}>
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onFilterChange(activeFilter === filter.value ? null : filter.value)}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                        'flex items-center gap-2',
                        activeFilter === filter.value
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                    )}
                >
                    <span>{filter.label}</span>
                    {filter.count !== undefined && (
                        <span
                            className={clsx(
                                'px-2 py-0.5 rounded-full text-xs font-semibold',
                                activeFilter === filter.value
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            )}
                        >
                            {filter.count}
                        </span>
                    )}
                    {activeFilter === filter.value && (
                        <FaTimes className="h-3 w-3 ml-1" />
                    )}
                </button>
            ))}
        </div>
    );
};
