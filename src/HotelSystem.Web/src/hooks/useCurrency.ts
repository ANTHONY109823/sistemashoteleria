import { useSettings } from './useSettings';

export const useCurrency = () => {
    const { data: settings } = useSettings();

    const currencySymbol = settings?.currencySymbol || '$';
    const currencyCode = settings?.currency || 'USD';

    const formatCurrency = (amount: number) => {
        // Option 1: Use Intl.NumberFormat for full locale support (preferred)
        // We try to use the selected currency, falling back to USD if invalid
        /* 
        try {
            return new Intl.NumberFormat(settings?.language || 'en-US', {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        } catch (e) {
            return `$${amount.toFixed(2)}`;
        }
        */

        // Option 2: Simple symbol prefix (requested by user to just show symbol)
        // This is often safer if the "currencyCode" in settings might be custom or just a symbol key
        return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return {
        currencySymbol,
        currencyCode,
        formatCurrency
    };
};
