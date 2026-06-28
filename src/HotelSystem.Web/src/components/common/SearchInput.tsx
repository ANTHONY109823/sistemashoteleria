import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Buscar...',
    isLoading = false,
    debounceMs = 300,
}) => {
    const [localValue, setLocalValue] = useState(value);

    // Debounce the onChange callback
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs, onChange, value]);

    // Update local value when prop changes from outside
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
    }, [onChange]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    )}
                </div>
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     placeholder-gray-400 text-gray-900 transition-all"
                    placeholder={placeholder}
                />
                {localValue && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 
                       text-gray-400 transition-colors"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};
